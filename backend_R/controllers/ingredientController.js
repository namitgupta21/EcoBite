import { supabase } from "../Config/supabase.js" ;
export const getIngredients = async(req, res)=>{
    try{
        const {data, error}  = await supabase
        .from('ingredients')
        .select()

        if(error) throw error;
        res.status(200).json(data)
        console.log("successfully fetched")
    }catch(error){
        res.status(400).json({error:error.message})

    }
}


export const updateIngredients = async(req,res)=>{
    try{
        const {data, error} = await supabase
        .from('ingredients')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single() 
        
        if(error) throw error;
        res.status(200).json(data)
        console.log("data updated")
     }catch(error){
        res.status(404).json({error:error.message})
     }
}
export const deleteingredients = async(req,res)=>{
    try{
        const {data, error} = await supabase
        .from('ingredients')
        .delete()
        .eq('id', req.params.id)

        if(error) throw error ;
        res.status(200).json(data);
        console.log("deleted successfully")
    
    } catch(error){
        res.status(400).json({error:error.message})
    }
}
export const createingredients = async(req,res)=>{
    try{
        const {data, error} = await supabase
        .from('ingredients')
        .insert(req.body)
        .select()
        .single()
         res.status(200).json(data)
    console.log("ingredient created successfully")

    }catch(error){
        res.status(400).json({error:error.message})
        console.log("error")
    }
   

}
export const getIngredientsById = async(req,res)=>{
    try{
        const {data , error} = await supabase.from('ingredients')   
        .select()
        .eq('id',req.params.id)
        .single()

        if(error) throw error;
        res.status(200).json(data)
        console.log('data fetched successfully')

    }catch(error){
        res.status(400).json({error:error.message})
        console.log(" data fetched Unsuccessful")
    }
}


