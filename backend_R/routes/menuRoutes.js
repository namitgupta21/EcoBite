import express from 'express';
import {
    getMenuitems,
    getMenuitemsById,
    deleteMenuitems,
    updateMenuitems,
    createMenuitems,
} from '../controllers/menuitems.js';
const router = express.Router();
router.get('/' , getMenuitems);
router.get('/:id' , getMenuitemsById);
router.post('/' , createMenuitems);
router.put('/:id' , updateMenuitems);
router.delete('/:id' , deleteMenuitems);
export default router;
