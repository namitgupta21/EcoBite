import express from 'express';
import { 
    createTransferPing, 
    updateTransferPing, 
    getTransferPing, 
    deleteTransferPing,
    autoScanRedistribute,
    acceptTransferPing,
    rejectTransferPing
} from '../controllers/transferController.js';

const Router = express.Router();

Router.get('/', getTransferPing);
Router.post('/', createTransferPing);
Router.post('/scan', autoScanRedistribute);
Router.post('/auto-scan', autoScanRedistribute);
Router.post('/:id/accept', acceptTransferPing);
Router.post('/:id/reject', rejectTransferPing);
Router.put('/:id', updateTransferPing);
Router.delete('/:id', deleteTransferPing);

export default Router;
