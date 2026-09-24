import {supabase} from '../Config/supabase.js';

export const getMenuitems = async(req,res)=>{
    try{
        //1.Database se data mangao 
        const {data , error } = await supabase
        .from('menu_items')
        .select('*')

        if(error) throw error 
        res.status(200).json(data)
        console.log("Data fetched successfully")



    }catch(error){
        console.log(error.message)
        res.status(500).json({error:error.message})

    }
}
export const createMenuitems = async(req,res)=>{
    try{
        const{data,error} = await supabase
        .from('menu_items')
        .insert(req.body)
        .select()
        .single()
        
        if(error) throw error
        res.status(200).json(data)
        console.log("Data created successfully")
    }catch(error){
        console.log(error.message)
        res.status(404).json({error:error.message})
    }
}
export const getMenuitemsById = async(req,res)=>{
    try{
        const{data , error} = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', req.params.id)
        .single()

        if(error) throw error ;
        res.status(200).json(data);
        console.log('data feched successfully')
    }catch(error){
        console.log(error.message)
        res.status(404).json({error:error.message})
    }
}
export const deleteMenuitems = async(req,res)=>{
    try{
        const {data,error} = await supabase
        .from('menu_items')
        .delete()
        .eq('id',req.params.id)
        .select()
        
        if(error) throw error ;
        res.status(200).json(data);
        console.log("Succcessfully deleted")
    }catch(error){
        console.log(error.message)
        res.status(404).json({error:error.message})
    }
}

export const updateMenuitems = async(req,res)=>{
try{
    const {data, error} = await supabase
    .from('menu_items')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single()

if(error)throw error;

res.status(200).json(data);
console.log("Data updated successfully")


}catch(error){
    console.log(error.message)
    res.status(404).json({error:error.message})
}
}



