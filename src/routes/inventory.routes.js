import express from 'express';
import { inventoryController } from '../controllers/inventory.controller.js';

const router = express.Router();

router.post('/', inventoryController.createProduct);
router.get('/', inventoryController.getProducts);

export default router;