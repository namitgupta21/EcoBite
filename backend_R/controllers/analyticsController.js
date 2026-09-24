import { supabase } from "../Config/supabase.js";

/**
 * Get aggregated ESG, Food Waste Prevention & Inventory Redistribution Analytics
 */
export const getAnalytics = async (req, res) => {
  try {
    // 1. Fetch all transfers with ingredient details
    const { data: pings, error: pingsErr } = await supabase
      .from("transfer_pings")
      .select("*, ingredient:ingredients(name, unit, cost_per_unit)");

    if (pingsErr) throw pingsErr;

    // 2. Fetch all inventory with stores and ingredients
    const { data: inventory, error: invErr } = await supabase
      .from("inventory")
      .select("*, stores(id, name, lat, log), ingredients(name, unit, cost_per_unit)");

    if (invErr) throw invErr;

    // 3. Fetch stores
    const { data: stores, error: storesErr } = await supabase
      .from("stores")
      .select("*");

    if (storesErr) throw storesErr;

    // Calculations
    const allPings = pings || [];
    const completedPings = allPings.filter(p => p.status === "COMPLETED");
    const pendingPings = allPings.filter(p => p.status === "PENDING");
    const rejectedPings = allPings.filter(p => p.status === "REJECTED");

    // Waste Prevented (kg) & Cost Saved (₹)
    let totalWastePreventedKg = 0;
    let totalCostSavings = 0;
    const ingredientTransfersCount = {};

    for (const p of completedPings) {
      const qty = Number(p.quantity) || 0;
      const costPerUnit = Number(p.ingredient?.cost_per_unit) || 0;
      const unit = (p.ingredient?.unit || "").toLowerCase();

      // Convert to kg equivalent if kg/grams or standard weight factor
      let kgEquivalent = qty;
      if (unit === "grams" || unit === "g") {
        kgEquivalent = qty / 1000;
      } else if (unit === "pcs" || unit === "units") {
        kgEquivalent = qty * 0.1; // ~100g per patty/bun avg
      } else if (unit === "l" || unit === "liters") {
        kgEquivalent = qty * 1.0;
      }

      totalWastePreventedKg += kgEquivalent;
      totalCostSavings += qty * costPerUnit;

      const ingName = p.ingredient?.name || "Other";
      ingredientTransfersCount[ingName] = (ingredientTransfersCount[ingName] || 0) + qty;
    }

    // Top transferred ingredients formatted for charts
    const topTransferred = Object.entries(ingredientTransfersCount)
      .map(([name, quantity]) => ({ name, quantity: Math.round(quantity * 10) / 10 }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Shortage items count (quantity <= reorder_level)
    const allInv = inventory || [];
    const shortageItems = allInv.filter(
      item => Number(item.quantity) <= Number(item.reorder_level)
    );

    // Store Health Overview
    const storeHealth = (stores || []).map(store => {
      const storeItems = allInv.filter(i => i.store_id === store.id);
      const totalItems = storeItems.length;
      const criticalCount = storeItems.filter(
        i => Number(i.quantity) <= Number(i.reorder_level)
      ).length;
      const warningCount = storeItems.filter(
        i => Number(i.quantity) > Number(i.reorder_level) && Number(i.quantity) <= Number(i.reorder_level) * 1.5
      ).length;

      let status = "OPTIMAL";
      if (criticalCount > 0) status = "CRITICAL";
      else if (warningCount > 0) status = "WARNING";

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        lat: store.lat,
        log: store.log,
        status,
        total_items: totalItems,
        critical_items: criticalCount,
        warning_items: warningCount
      };
    });

    res.status(200).json({
      metrics: {
        total_waste_prevented_kg: Math.round(totalWastePreventedKg * 100) / 100,
        total_cost_savings: Math.round(totalCostSavings * 100) / 100,
        completed_transfers_count: completedPings.length,
        pending_pings_count: pendingPings.length,
        rejected_pings_count: rejectedPings.length,
        total_pings_count: allPings.length,
        active_shortages_count: shortageItems.length,
        total_stores_count: (stores || []).length
      },
      top_transferred_ingredients: topTransferred,
      stores_health: storeHealth,
      recent_pings: allPings.slice(0, 10)
    });
  } catch (error) {
    console.error("Error in getAnalytics:", error.message);
    res.status(500).json({ error: error.message });
  }
};
