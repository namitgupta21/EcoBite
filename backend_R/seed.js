import { supabase } from "./Config/supabase.js";

async function seed() {
  console.log("🌱 Starting Autonomous Kitchen Database Seeder...");

  try {
    // 1. Clean existing records in reverse dependency order
    console.log("🧹 Clearing old data...");
    await supabase.from("transfer_pings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("recipe_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("inventory").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("ingredients").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("stores").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Insert Stores (Cluster around Delhi NCR)
    // 4 stores within 10km, 2 outside 10km to test radius filtering
    console.log("📍 Inserting Stores...");
    const storesData = [
      {
        name: "Central Hub - Connaught Place",
        address: "Block B, Inner Circle, Connaught Place, New Delhi",
        contact_phone: "9811001101",
        lat: 28.6315,
        log: 77.2167
      },
      {
        name: "Express - Paharganj",
        address: "Main Bazaar Road, Paharganj, New Delhi (~1.8km)",
        contact_phone: "9811001102",
        lat: 28.6435,
        log: 77.2119
      },
      {
        name: "Kitchen - Karol Bagh",
        address: "Ajmal Khan Road, Karol Bagh, New Delhi (~3.8km)",
        contact_phone: "9811001103",
        lat: 28.6514,
        log: 77.1907
      },
      {
        name: "Bistro - Chandni Chowk",
        address: "Near Metro Gate 1, Chandni Chowk, Old Delhi (~2.9km)",
        contact_phone: "9811001104",
        lat: 28.6506,
        log: 77.2303
      },
      {
        name: "Outpost - South Extension",
        address: "Part 2 Market, South Extension, New Delhi (~7.2km)",
        contact_phone: "9811001105",
        lat: 28.5729,
        log: 77.2215
      },
      {
        name: "Far Branch - Rajouri Garden",
        address: "Major Sudesh Kumar Marg, Rajouri Garden (~11.5km)",
        contact_phone: "9811001106",
        lat: 28.6492,
        log: 77.1219
      }
    ];

    const { data: stores, error: storesErr } = await supabase
      .from("stores")
      .insert(storesData)
      .select();

    if (storesErr) throw storesErr;
    console.log(`✅ Inserted ${stores.length} stores.`);

    // 3. Insert Ingredients Master Table (9 items)
    console.log("🥦 Inserting Master Ingredients...");
    const ingredientsData = [
      { name: "Brioche Burger Buns", unit: "pcs", cost_per_unit: 15.0 },
      { name: "Crispy Veg Patty", unit: "pcs", cost_per_unit: 25.0 },
      { name: "Grilled Chicken Patty", unit: "pcs", cost_per_unit: 45.0 },
      { name: "Russet Potatoes", unit: "kg", cost_per_unit: 30.0 },
      { name: "Cheddar Cheese Slice", unit: "pcs", cost_per_unit: 12.0 },
      { name: "Signature Garlic Mayo", unit: "kg", cost_per_unit: 180.0 },
      { name: "Fresh Tomatoes", unit: "kg", cost_per_unit: 35.0 },
      { name: "Iceberg Lettuce", unit: "kg", cost_per_unit: 60.0 },
      { name: "Cola Fountain Syrup", unit: "L", cost_per_unit: 95.0 }
    ];

    const { data: ingredients, error: ingErr } = await supabase
      .from("ingredients")
      .insert(ingredientsData)
      .select();

    if (ingErr) throw ingErr;
    console.log(`✅ Inserted ${ingredients.length} ingredients.`);

    // Map ingredients by name for easy lookup
    const ingMap = {};
    ingredients.forEach(i => (ingMap[i.name] = i.id));

    // 4. Insert Menu Items (6 popular items)
    console.log("🍔 Inserting Menu Items...");
    const menuData = [
      {
        name: "Classic Crispy Veg Burger",
        category: "Burgers",
        price: 149,
        is_available: true
      },
      {
        name: "Grilled Chicken Deluxe Burger",
        category: "Burgers",
        price: 199,
        is_available: true
      },
      {
        name: "Golden Salted French Fries",
        category: "Sides",
        price: 109,
        is_available: true
      },
      {
        name: "Cheesy Loaded Fries",
        category: "Sides",
        price: 159,
        is_available: true
      },
      {
        name: "Chilled Fountain Cola (500ml)",
        category: "Beverages",
        price: 69,
        is_available: true
      },
      {
        name: "Chef Special Combo Meal",
        category: "Combos",
        price: 299,
        is_available: true
      }
    ];

    const { data: menuItems, error: menuErr } = await supabase
      .from("menu_items")
      .insert(menuData)
      .select();

    if (menuErr) throw menuErr;
    console.log(`✅ Inserted ${menuItems.length} menu items.`);

    const menuMap = {};
    menuItems.forEach(m => (menuMap[m.name] = m.id));

    // 5. Insert Recipe Ingredients (Bill of Materials - BOM)
    console.log("📋 Inserting Recipe BOMs (recipe_items)...");
    const recipesData = [
      // Classic Veg Burger
      { menu_item_id: menuMap["Classic Crispy Veg Burger"], ingredient_id: ingMap["Brioche Burger Buns"], quantity_required: 1 },
      { menu_item_id: menuMap["Classic Crispy Veg Burger"], ingredient_id: ingMap["Crispy Veg Patty"], quantity_required: 1 },
      { menu_item_id: menuMap["Classic Crispy Veg Burger"], ingredient_id: ingMap["Cheddar Cheese Slice"], quantity_required: 1 },
      { menu_item_id: menuMap["Classic Crispy Veg Burger"], ingredient_id: ingMap["Fresh Tomatoes"], quantity_required: 0.05 },
      { menu_item_id: menuMap["Classic Crispy Veg Burger"], ingredient_id: ingMap["Iceberg Lettuce"], quantity_required: 0.03 },

      // Grilled Chicken Deluxe Burger
      { menu_item_id: menuMap["Grilled Chicken Deluxe Burger"], ingredient_id: ingMap["Brioche Burger Buns"], quantity_required: 1 },
      { menu_item_id: menuMap["Grilled Chicken Deluxe Burger"], ingredient_id: ingMap["Grilled Chicken Patty"], quantity_required: 1 },
      { menu_item_id: menuMap["Grilled Chicken Deluxe Burger"], ingredient_id: ingMap["Cheddar Cheese Slice"], quantity_required: 1 },
      { menu_item_id: menuMap["Grilled Chicken Deluxe Burger"], ingredient_id: ingMap["Signature Garlic Mayo"], quantity_required: 0.03 },

      // French Fries
      { menu_item_id: menuMap["Golden Salted French Fries"], ingredient_id: ingMap["Russet Potatoes"], quantity_required: 0.25 },

      // Cheesy Loaded Fries
      { menu_item_id: menuMap["Cheesy Loaded Fries"], ingredient_id: ingMap["Russet Potatoes"], quantity_required: 0.30 },
      { menu_item_id: menuMap["Cheesy Loaded Fries"], ingredient_id: ingMap["Cheddar Cheese Slice"], quantity_required: 2 },
      { menu_item_id: menuMap["Cheesy Loaded Fries"], ingredient_id: ingMap["Signature Garlic Mayo"], quantity_required: 0.04 },

      // Fountain Cola
      { menu_item_id: menuMap["Chilled Fountain Cola (500ml)"], ingredient_id: ingMap["Cola Fountain Syrup"], quantity_required: 0.08 },

      // Chef Special Combo Meal
      { menu_item_id: menuMap["Chef Special Combo Meal"], ingredient_id: ingMap["Brioche Burger Buns"], quantity_required: 1 },
      { menu_item_id: menuMap["Chef Special Combo Meal"], ingredient_id: ingMap["Crispy Veg Patty"], quantity_required: 1 },
      { menu_item_id: menuMap["Chef Special Combo Meal"], ingredient_id: ingMap["Russet Potatoes"], quantity_required: 0.20 },
      { menu_item_id: menuMap["Chef Special Combo Meal"], ingredient_id: ingMap["Cola Fountain Syrup"], quantity_required: 0.08 }
    ];

    const { data: recipes, error: recipesErr } = await supabase
      .from("recipe_items")
      .insert(recipesData)
      .select();

    if (recipesErr) throw recipesErr;
    console.log(`✅ Inserted ${recipes.length} recipe item mappings.`);

    // 6. Insert Store Inventory
    // Store 0 (Connaught Place) will have critical / low stock on Potatoes and Veg Patty
    // Store 1 (Paharganj) will have surplus expiring in 3 days (Donor 1 - FEFO priority!)
    // Store 2 (Karol Bagh) will have surplus expiring in 8 days (Donor 2)
    console.log("📦 Populating Store Inventories...");
    const inventoryData = [];

    const now = new Date();
    const plusDays = d => {
      const date = new Date(now);
      date.setDate(date.getDate() + d);
      return date.toISOString();
    };

    stores.forEach((store, sIdx) => {
      ingredients.forEach(ing => {
        let quantity = 50;
        let reorder_level = 10;
        let expiry_date = plusDays(14);

        if (sIdx === 0) {
          // Connaught Place: Needs inventory soon!
          if (ing.name === "Russet Potatoes") {
            quantity = 2.0; // 2kg left! (reorder is 5)
            reorder_level = 5.0;
            expiry_date = plusDays(5);
          } else if (ing.name === "Crispy Veg Patty") {
            quantity = 3.0; // 3 patties left! (reorder is 8)
            reorder_level = 8.0;
            expiry_date = plusDays(4);
          } else {
            quantity = 25;
            reorder_level = 10;
          }
        } else if (sIdx === 1) {
          // Paharganj: Close (1.8km) with high surplus expiring SOON (3 days - FEFO winner)
          if (ing.name === "Russet Potatoes") {
            quantity = 45.0;
            reorder_level = 5.0;
            expiry_date = plusDays(3); // expires sooner!
          } else if (ing.name === "Crispy Veg Patty") {
            quantity = 35.0;
            reorder_level = 8.0;
            expiry_date = plusDays(3);
          } else {
            quantity = 40;
            reorder_level = 10;
          }
        } else if (sIdx === 2) {
          // Karol Bagh: Further (3.8km) with surplus expiring in 10 days
          if (ing.name === "Russet Potatoes") {
            quantity = 50.0;
            reorder_level = 5.0;
            expiry_date = plusDays(10);
          } else if (ing.name === "Crispy Veg Patty") {
            quantity = 40.0;
            reorder_level = 8.0;
            expiry_date = plusDays(10);
          } else {
            quantity = 30;
            reorder_level = 10;
          }
        } else {
          // Other stores: normal stock
          quantity = 35;
          reorder_level = 10;
          expiry_date = plusDays(12);
        }

        inventoryData.push({
          store_id: store.id,
          ingredient_id: ing.id,
          quantity: quantity,
          reorder_level: reorder_level,
          expiry_date: expiry_date
        });
      });
    });

    const { data: invRows, error: invErr } = await supabase
      .from("inventory")
      .insert(inventoryData)
      .select();

    if (invErr) throw invErr;
    console.log(`✅ Populated ${invRows.length} inventory records across all stores.`);

    console.log("\n🎉 Database seeded successfully with realistic data!");
    console.log("Summary:");
    console.log(`- Stores: ${stores.length}`);
    console.log(`- Ingredients: ${ingredients.length}`);
    console.log(`- Menu Items: ${menuItems.length}`);
    console.log(`- Recipe BOM Items: ${recipes.length}`);
    console.log(`- Store Inventory Rows: ${invRows.length}`);
  } catch (err) {
    console.error("❌ Seeding Error:", err.message);
  } finally {
    process.exit(0);
  }
}

seed();
