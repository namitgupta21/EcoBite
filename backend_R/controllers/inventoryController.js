import {supabase } from "../Config/supabase.js";
export const getInventory = async(req,res)=>{
    try{
        const { store_id } = req.query;
        let query = supabase
            .from('inventory')
            .select('*, ingredients(id, name, unit, cost_per_unit), stores(id, name)')
            .order('created_at', { ascending: true });

        if (store_id) {
            query = query.eq('store_id', store_id);
        }

        const {data, error} = await query;
        if(error) throw error;
        res.status(200).json(data);
    }catch(error){
        res.status(400).json({error:error.message})
        console.log('error found in getInventory:', error.message)
    }
}
export const updateInventory  = async(req,res) =>{
    try{
        const{data,error} = await supabase
        .from('inventory')
        .update(req.body)
        .eq('id',req.params.id)
        .select()
        .single()

        if(error) throw error;
        res.status(200).json(data)
        console.log('Successfully updated')

    }catch(error){
        res.status(400).json({error:error.message})
        console.log('error found')
    }
}
export const deleteInventory = async(req,res)=>{
    try{
        const {data, error} = await supabase
        .from('inventory')
        .delete()
        .eq('id',req.params.id)
        .single()

        if(error) throw error;
        res.status(200).json(data);
        console.log('Deleted successfully');



    }
    catch(error){
        res.status(400).json({error:error.message})
        console.log('error found')
    }
}
export const createInventory = async(req,res)=>{
    try{
        const {data , error} = await supabase
        .from('inventory')
        .insert(req.body)
        .select()
        .single()

        if(error) throw error;
        res.status(200).json(data)
        console.log('successful created inventory')

    }catch(error){
        res.status(400).json({error:error.message})
        console.log('error found when creating inventory')
    }
}
export const getInventoryById = async(req,res) =>{
    try{
        const {data , error} = await supabase
        .from('inventory')
        .select()
        .eq('id', req.params.id)
        .single()

        if(error) throw error
        res.status(200).json(data)
        console.log('Successful fteched the inventory')

    }catch(error){
        res.status(400).json({error:error.message})
        console.log('error when fetched')
    }
}
export const getExpiryStock = async(req,res)=>{
    try{
        const today = new Date();
        const twoDaysLater = new Date();
        twoDaysLater.setDate(today.getDate() + 2 )

        const{data, error} = await supabase
        .from('inventory')
        .select()
        .lt('expiry_date', twoDaysLater.toISOString())//less than   
        .gte('expiry_date', today.toISOString());//greater than equal 

        if(error) throw error;
        res.status(200).json(data);
        console.log('Successfully fetched expiry stock');
    }catch(error){
        res.status(400).json({error:error.message})
        console.log('error when fetched')
    }



}
export const getLowStockAlerts = async(req,res)=>{
    try{
        const reorder_level = req.query.reorder_level || 10;
        const store_id = req.query.store_id;

        let query = supabase
        .from('inventory')
        .select('*, stores(name, address), ingredients(name, unit)')
        .lte('quantity', reorder_level);


        if (store_id) {
            query = query.eq('store_id', store_id);
        }

        const {data, error} = await query;
        if(error) throw error;
        res.status(200).json(data);
        console.log('Successfully fetched low quantity');
    }catch(error){
        res.status(400).json({error:error.message})
        console.log('Error in getting low stock alerts')
    }
}
export const getFirstExpiring = async(req,res)=>{
    try{
        const reorder_level = req.query.reorder_level || req.params.reorder_level || 10;
        const store_id = req.params.id;

        const {data, error} = await supabase
        .from('inventory')
        .select('id, expiry_date, created_at')
        .eq('store_id', store_id)
        .lte('quantity', reorder_level)
        .order('expiry_date', {ascending: true})
        .limit(1);

        if(error) throw error;
        res.status(200).json(data);
        console.log('Successfully sent the alert to the manager');
    }catch(error){
        res.status(400).json({error:error.message})
        console.log('Error in getting low stock alerts')
    }
}
export const globalInventoryStockAlert = async(req,res)=>{
    try{
        const reorder_level = req.query.reorder_level || 10;
        const store_id = req.query.store_id;

        let query = supabase
        .from('inventory')
        .select('*, stores(name), ingredients(name)')
        .lte('quantity', reorder_level);

        if (store_id) {
            query = query.eq('store_id', store_id);
        }

        const {data, error} = await query.order('expiry_date', {ascending: true}).limit(1);
        if(error) throw error;
        res.status(200).json(data);
        console.log('Successfully sent the alert to the manager');
    }catch(error){
        res.status(400).json({error:error.message})
        console.log('Error in getting low stock alerts')
    }
}








