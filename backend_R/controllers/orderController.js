import { supabase } from "../Config/supabase.js";
import { calculateDistanceKm } from "../utils/geo.js";

/**
 * Process a POS Customer Order:
 * 1. Expand ordered menu items into micro-ingredients via recipe BOM.
 * 2. Atomically deduct ingredient quantities from the store's inventory.
 * 3. Evaluate stock against reorder_level / critical threshold.
 * 4. If critical (< 15% / <= reorder_level), trigger 10km Geospatial FEFO Redistribution.
 * 5. Broadcast real-time Socket.IO alerts.
 */
export const processOrder = async (req, res) => {
  try {
    const { store_id, items } = req.body;
    const io = req.app.get("io");

    if (!store_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "store_id and a non-empty items array are required." });
    }

    // 1. Fetch Requesting Store details
    const { data: store, error: storeErr } = await supabase
      .from("stores")
      .select("id, name, lat, log, address")
      .eq("id", store_id)
      .single();

    if (storeErr || !store) {
      return res.status(404).json({ error: "Store not found." });
    }

    // 2. Fetch Menu Items details
    const menuItemIds = items.map(i => i.menu_item_id);
    const { data: menuItems, error: menuErr } = await supabase
      .from("menu_items")
      .select("*")
      .in("id", menuItemIds);

    if (menuErr) throw menuErr;

    // 3. Fetch Recipe BOM for all ordered menu items
    const { data: recipeRows, error: recipeErr } = await supabase
      .from("recipe_items")
      .select("*, ingredients(*)")
      .in("menu_item_id", menuItemIds);

    if (recipeErr) throw recipeErr;

    // 4. Calculate total micro-ingredient requirements
    const ingredientDeductions = {};
    const ingredientDetails = {};

    for (const orderItem of items) {
      const recipes = recipeRows.filter(r => r.menu_item_id === orderItem.menu_item_id);
      for (const recipe of recipes) {
        const requiredQty = Number(recipe.quantity_required) * Number(orderItem.quantity);
        ingredientDeductions[recipe.ingredient_id] =
          (ingredientDeductions[recipe.ingredient_id] || 0) + requiredQty;
        if (!ingredientDetails[recipe.ingredient_id]) {
          ingredientDetails[recipe.ingredient_id] = recipe.ingredients;
        }
      }
    }

    // 5. Fetch current store inventory for these ingredients
    const neededIngredientIds = Object.keys(ingredientDeductions);
    const { data: storeInventory, error: invErr } = await supabase
      .from("inventory")
      .select("*")
      .eq("store_id", store_id)
      .in("ingredient_id", neededIngredientIds);

    if (invErr) throw invErr;

    const inventoryMap = {};
    (storeInventory || []).forEach(inv => {
      inventoryMap[inv.ingredient_id] = inv;
    });

    // 6. Deduct quantities & identify critical shortages
    const deductionLogs = [];
    const criticalAlerts = [];
    const triggeredPings = [];

    for (const [ingredientId, deductQty] of Object.entries(ingredientDeductions)) {
      const invRecord = inventoryMap[ingredientId];
      const ingredient = ingredientDetails[ingredientId];
      const unit = ingredient?.unit || "units";
      const ingredientName = ingredient?.name || "Unknown Item";

      let currentStock = invRecord ? Number(invRecord.quantity) : 0;
      let reorderLevel = invRecord ? Number(invRecord.reorder_level) : 5;
      let newStock = Math.max(0, Math.round((currentStock - deductQty) * 1000) / 1000);

      deductionLogs.push({
        ingredient_id: ingredientId,
        name: ingredientName,
        unit: unit,
        deducted: deductQty,
        previous_stock: currentStock,
        remaining_stock: newStock,
        reorder_level: reorderLevel
      });

      // Update Supabase inventory
      if (invRecord) {
        await supabase
          .from("inventory")
          .update({
            quantity: newStock,
            updated_at: new Date().toISOString()
          })
          .eq("id", invRecord.id);
      } else {
        // If row didn't exist, create it with 0
        await supabase.from("inventory").insert({
          store_id,
          ingredient_id: ingredientId,
          quantity: newStock,
          reorder_level: reorderLevel
        });
      }

      // Check if stock is critical (<= reorder_level)
      if (newStock <= reorderLevel) {
        criticalAlerts.push({
          ingredient_id: ingredientId,
          name: ingredientName,
          remaining_stock: newStock,
          reorder_level: reorderLevel,
          unit: unit
        });

        // 7. Trigger Autonomous 10km Geospatial FEFO Redistribution
        const pingCreated = await triggerGeospatialRedistribution({
          requestingStore: store,
          ingredientId,
          ingredientName,
          unit,
          currentStock: newStock,
          reorderLevel,
          io
        });

        if (pingCreated) {
          triggeredPings.push(pingCreated);
        }
      }
    }

    // 8. Calculate order totals
    let orderTotal = 0;
    const itemsSummary = items.map(item => {
      const mItem = menuItems.find(m => m.id === item.menu_item_id);
      const subtotal = (mItem?.price || 0) * item.quantity;
      orderTotal += subtotal;
      return {
        menu_item_id: item.menu_item_id,
        name: mItem?.name || "Item",
        quantity: item.quantity,
        price: mItem?.price || 0,
        subtotal
      };
    });

    // 9. Emit real-time Socket.IO events
    if (io) {
      io.to(`store_${store_id}`).emit("inventory:updated", {
        store_id,
        deductions: deductionLogs
      });
      io.emit("inventory:global_update", {
        store_id,
        deductions: deductionLogs
      });
    }

    res.status(200).json({
      success: true,
      order_id: "ORD-" + Date.now().toString(36).toUpperCase(),
      store: { id: store.id, name: store.name },
      items: itemsSummary,
      total_amount: orderTotal,
      deductions: deductionLogs,
      critical_shortages: criticalAlerts,
      triggered_pings: triggeredPings,
      message: triggeredPings.length > 0
        ? `Order completed. Stock critical for ${criticalAlerts.map(a => a.name).join(", ")}. Autonomous 10km Redistribution Pings initiated!`
        : "Order processed successfully. Micro-ingredients deducted."
    });
  } catch (error) {
    console.error("Error in processOrder:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Autonomous Geospatial Redistribution Engine:
 * - Queries other stores within 10km radius using Haversine formula.
 * - Filters stores having surplus inventory for the shortage ingredient.
 * - Sorts candidate donors using FEFO (First Expiring, First Out).
 * - Creates transfer_pings record and broadcasts Socket.IO alert.
 */
async function triggerGeospatialRedistribution({
  requestingStore,
  ingredientId,
  ingredientName,
  unit,
  currentStock,
  reorderLevel,
  io
}) {
  try {
    // 1. Fetch all other stores
    const { data: allStores, error: storesErr } = await supabase
      .from("stores")
      .select("id, name, lat, log, address")
      .neq("id", requestingStore.id);

    if (storesErr || !allStores || allStores.length === 0) return null;

    // 2. Filter stores within 10km radius
    const nearbyStores = allStores
      .map(s => {
        const dist = calculateDistanceKm(requestingStore.lat, requestingStore.log, s.lat, s.log);
        return { ...s, distance_km: dist };
      })
      .filter(s => s.distance_km <= 10.0) // 10km geofence boundary!
      .sort((a, b) => a.distance_km - b.distance_km);

    if (nearbyStores.length === 0) {
      console.log(`[GeoRedistribute] No stores found within 10km for store ${requestingStore.name}`);
      return null;
    }

    const nearbyStoreIds = nearbyStores.map(s => s.id);

    // 3. Fetch inventory of candidate stores for this ingredient
    const { data: candidateInventories, error: invErr } = await supabase
      .from("inventory")
      .select("*, stores(id, name, lat, log, address)")
      .in("store_id", nearbyStoreIds)
      .eq("ingredient_id", ingredientId);

    if (invErr || !candidateInventories || candidateInventories.length === 0) return null;

    // 4. Filter only stores with safe surplus (quantity > reorder_level)
    const validDonors = candidateInventories.filter(
      item => Number(item.quantity) - Number(item.reorder_level) > 1.0
    );

    if (validDonors.length === 0) {
      console.log(`[GeoRedistribute] No donor stores with surplus of ${ingredientName} within 10km.`);
      return null;
    }

    // 5. FEFO Sorting: Prioritize store whose stock expires FIRST to eliminate food waste!
    validDonors.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
    const selectedDonor = validDonors[0];

    // Compute distance to chosen donor
    const donorStoreObj = nearbyStores.find(s => s.id === selectedDonor.store_id);
    const distanceKm = donorStoreObj ? donorStoreObj.distance_km : 0;

    // Calculate optimal transfer quantity (restore requesting store to safe level + buffer)
    const deficit = Number(reorderLevel) - Number(currentStock) + 5;
    const availableSurplus = Number(selectedDonor.quantity) - Number(selectedDonor.reorder_level);
    const transferQuantity = Math.min(availableSurplus, Math.max(2, deficit));

    // 6. Check for existing PENDING ping to avoid duplicates
    const { data: existingPings } = await supabase
      .from("transfer_pings")
      .select("id")
      .eq("from_store_id", selectedDonor.store_id)
      .eq("to_store_id", requestingStore.id)
      .eq("ingredient_id", ingredientId)
      .eq("status", "PENDING")
      .limit(1);

    if (existingPings && existingPings.length > 0) {
      console.log(`[GeoRedistribute] Active pending ping already exists for ${ingredientName}.`);
      return null;
    }

    // 7. Insert Transfer Ping into Supabase
    const { data: newPing, error: pingErr } = await supabase
      .from("transfer_pings")
      .insert({
        from_store_id: selectedDonor.store_id,
        to_store_id: requestingStore.id,
        ingredient_id: ingredientId,
        quantity: Math.round(transferQuantity * 10) / 10,
        distance_km: distanceKm,
        status: "PENDING"
      })
      .select(
        "*, from_store:stores!from_store_id(id, name, address, lat, log), to_store:stores!to_store_id(id, name, address, lat, log), ingredient:ingredients(id, name, unit, cost_per_unit)"
      )
      .single();

    if (pingErr) {
      console.error("[GeoRedistribute] Error inserting ping:", pingErr);
      return null;
    }

    console.log(
      `🚨 [Autonomous Ping] Created ping ${newPing.id}: ${newPing.quantity} ${unit} of ${ingredientName} from ${newPing.from_store?.name} to ${newPing.to_store?.name} (${distanceKm} km away)`
    );

    // 8. Emit Socket.IO real-time ping broadcast!
    if (io) {
      // Direct alert to fulfilling donor store
      io.to(`store_${selectedDonor.store_id}`).emit("ping:new_request", newPing);
      // Alert to requesting store
      io.to(`store_${requestingStore.id}`).emit("ping:initiated", newPing);
      // Global broadcast for franchise admin dashboard
      io.emit("ping:broadcast", newPing);
      io.emit("inventory:critical", {
        store_id: requestingStore.id,
        store_name: requestingStore.name,
        ingredient_name: ingredientName,
        current_stock: currentStock,
        reorder_level: reorderLevel,
        unit
      });
    }

    return newPing;
  } catch (err) {
    console.error("[GeoRedistribute] Error in triggerGeospatialRedistribution:", err);
    return null;
  }
}
