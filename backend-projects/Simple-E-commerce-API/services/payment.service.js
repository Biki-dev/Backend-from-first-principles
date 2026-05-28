import crypto from 'crypto';
import Order from '../models/Order.model.js';
import { getRazorpayClient } from '../config/razorpay.js';
import {
  cancelUnpaidOrder,
  createHttpError,
  getOrderById,
  markOrderPaid,
  populateOrder
} from './order.service.js';

function getWebhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
}

export async function createRazorpayOrderForInternalOrder(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    throw createHttpError(404, 'Order not found');
  }

  if (order.paymentStatus === 'paid') {
    return {
      order: await populateOrder(order),
      razorpayOrder: null
    };
  }

  if (order.razorpayOrderId) {
    return {
      order: await populateOrder(order),
      razorpayOrder: {
        id: order.razorpayOrderId,
        amount: Math.round(order.totalAmount * 100),
        currency: 'INR',
        receipt: `order_${order._id}`
      }
    };
  }

  const razorpayClient = getRazorpayClient();

  const razorpayOrder = await razorpayClient.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'INR',
    receipt: `order_${order._id}`,
    notes: {
      internalOrderId: order._id.toString(),
      userId: userId.toString()
    }
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return {
    order: await populateOrder(order),
    razorpayOrder
  };
}

export function verifyRazorpayPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw createHttpError(400, 'Payment verification data is incomplete');
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw createHttpError(500, 'Razorpay secret is not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expectedSignature === razorpaySignature;
}

export async function verifyAndFinalizePayment({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  userId
}) {
  if (!verifyRazorpayPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
    throw createHttpError(400, 'Invalid payment signature');
  }

  const order = await Order.findOne({ razorpayOrderId });

  if (!order) {
    throw createHttpError(404, 'Order not found for this Razorpay order');
  }

  if (userId && order.user.toString() !== userId.toString()) {
    throw createHttpError(403, 'You cannot verify a payment for another user');
  }

  return markOrderPaid({
    order,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });
}

export async function handleRazorpayWebhook(rawBody, signatureHeader, payload) {
  const secret = getWebhookSecret();

  if (!secret) {
    throw createHttpError(500, 'Razorpay webhook secret is not configured');
  }

  if (!rawBody) {
    throw createHttpError(400, 'Webhook body is required');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signatureHeader) {
    throw createHttpError(401, 'Invalid webhook signature');
  }

  if (!payload || !payload.event) {
    throw createHttpError(400, 'Invalid webhook payload');
  }

  const paymentEntity = payload.payload?.payment?.entity;
  const orderEntity = payload.payload?.order?.entity;

  if (payload.event === 'payment.captured') {
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId || !razorpayPaymentId) {
      throw createHttpError(400, 'Webhook payload is missing payment identifiers');
    }

    const order = await Order.findOne({ razorpayOrderId });

    if (!order) {
      throw createHttpError(404, 'Order not found for webhook payment');
    }

    return markOrderPaid({
      order,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: signatureHeader
    });
  }

  if (payload.event === 'payment.failed') {
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (!razorpayOrderId) {
      throw createHttpError(400, 'Webhook payload is missing an order identifier');
    }

    const order = await Order.findOne({ razorpayOrderId });

    if (!order) {
      throw createHttpError(404, 'Order not found for webhook payment failure');
    }

    return cancelUnpaidOrder(order, 'Payment failed through Razorpay webhook');
  }

  return {
    acknowledged: true,
    event: payload.event
  };
}

export async function fetchOrderForUserOrAdmin(orderId, user) {
  const order = await getOrderById(orderId);

  if (!order) {
    throw createHttpError(404, 'Order not found');
  }

  if (user?.role !== 'admin' && order.user._id.toString() !== user._id.toString()) {
    throw createHttpError(403, 'Access denied');
  }

  return order;
}