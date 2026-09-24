import express from 'express';
import {
  getStore,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
} from '../controllers/storeController.js';

const router = express.Router();



// Store Endpoints 
router.get('/', getStore);           
router.get('/:id', getStoreById);    
router.post('/', createStore);        
router.put('/:id', updateStore);      
router.delete('/:id', deleteStore);  

export default router;
