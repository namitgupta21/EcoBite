import express from 'express';
import{
    getInventory,
    updateInventory,
    deleteInventory,
    createInventory,
    getInventoryById,
    getExpiryStock,
    getLowStockAlerts,
    getFirstExpiring,
    globalInventoryStockAlert
} from '../controllers/inventoryController.js'

const router = express.Router();
router.get('/expiring', getExpiryStock);
router.get('/low-stock', getLowStockAlerts);
router.get('/global-alerts', globalInventoryStockAlert);
router.get('/first-expiring/:id', getFirstExpiring);
router.get('/', getInventory);
router.get('/:id', getInventoryById);
router.post('/', createInventory);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);
export default router;

