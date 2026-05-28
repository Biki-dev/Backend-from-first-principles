import express from 'express';
import {
  createPaymentOrder,
  razorpayWebhook,
  verifyPayment
} from '../controllers/payment.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', authMiddleware, createPaymentOrder);
router.post('/verify', authMiddleware, verifyPayment);
router.post('/webhook', razorpayWebhook);

export default router;