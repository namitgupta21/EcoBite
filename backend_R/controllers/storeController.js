import { supabase } from "../Config/supabase.js";


export const getStore = async (req, res) => {
    try {
        const {data, error} = await supabase
        .from('stores')
        .select()

        if(error) throw error ;
        res.status(200).json(data)
        console.log('data send successfully')

    } catch (error) {
        console.log(error.message)
        res.status(500).json({error:error.message})
    }
}
export const getStoreById = async (req,res) =>{
    try {
        const {data, error} = await supabase
        .from('stores')
        .select()
        .eq('id', req.params.id)

        .single()

        if(error) throw error;
        res.status(200).json(data)
    }catch(error){
        console.log(error.message)
        res.status(404).json({error:error.message})
    }
}
export const createStore  = async(req,res)=>{
    try{
        const {name, address, lat, lng, log, contact_phone } = req.body;
        if (!name || !address ){
            return res.status(400).json({error:"Name and address are required"})
        }

        const sanitizedPhone = contact_phone 
            ? String(contact_phone).replace(/\D/g, '').slice(-10) || '0000000000'
            : '0000000000';

        const storeData = {
            name,
            address,
            contact_phone: sanitizedPhone,
            ...(lat !== undefined && { lat: Number(lat) }),
            ...((log !== undefined || lng !== undefined) && { log: Number(log !== undefined ? log : lng) })
        };



        const{data, error} = await supabase
        .from('stores')
        .insert(storeData)
        .select('*')
        .single()

        if(error) throw error;
        res.status(200).json(data)
        console.log('data created successfully')

    }catch(error){
        console.log(error.message)
        res.status(400).json({error:error.message})
    }
}
export const updateStore = async (req,res) =>{
    try{
        const updateData = { ...req.body };
        if (updateData.lng !== undefined && updateData.log === undefined) {
            updateData.log = updateData.lng;
            delete updateData.lng;
        }
        const {data,error} = await supabase
        .from('stores')
        .update(updateData)
        .eq('id', req.params.id)
        .select('*')
        .single()
        
        if(error) throw error;
        res.status(200).json(data)
        console.log('data updated successfully')
    }catch(error){
        console.log(error.message)
        res.status(404).json({error:error.message})
    }
}

export const deleteStore = async (req,res) =>{
    try{
        const {data,error} = await supabase
        .from('stores')
        .delete()
        .eq('id', req.params.id)
        .single()
        if(error) throw error;
        res.status(200).json(data)
        console.log('data deleted successfully')
    }catch(error){
        console.log(error.message)
        res.status(404).json({error:error.message}) 
    }
}

