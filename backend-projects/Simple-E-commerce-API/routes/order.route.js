import express from 'express';
import { createOrder, getOrderByIdController, getOrders } from '../controllers/order.controller.js';
import { adminMiddleware, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authMiddleware, createOrder);
router.get('/', authMiddleware, adminMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderByIdController);

export default router;