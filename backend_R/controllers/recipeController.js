import { supabase } from "../Config/supabase.js";

export const getRecipes = async (req, res) => {
  try {
    const { menu_item_id } = req.query;

    let query = supabase
      .from("recipe_items")
      .select("*, menu_items(id, name, price, category), ingredients(id, name, unit, cost_per_unit)");

    if (menu_item_id) {
      query = query.eq("menu_item_id", menu_item_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
