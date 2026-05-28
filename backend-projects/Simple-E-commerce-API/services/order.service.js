import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateShippingAddress(shippingAddress) {
  const requiredFields = ['street', 'city', 'state', 'postalCode', 'phoneNumber'];

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    throw createHttpError(400, 'Shipping address is required');
  }

  for (const field of requiredFields) {
    if (!shippingAddress[field] || String(shippingAddress[field]).trim() === '') {
      throw createHttpError(400, `Shipping address field ${field} is required`);
    }
  }
}

async function populateOrder(order) {
  return order.populate([
    { path: 'user', select: 'name email' },
    { path: 'items.productId', select: 'name price stock isActive' }
  ]);
}

async function validateOrderStock(order) {
  for (const item of order.items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw createHttpError(404, `Product not found for order item ${item.nameSnapshot}`);
    }

    if (!product.isActive) {
      throw createHttpError(400, `Product ${product.name} is not active`);
    }

    if (product.stock < item.quantity) {
      throw createHttpError(409, `Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }
  }
}

async function reduceOrderStock(order) {
  const reducedItems = [];

  try {
    for (const item of order.items) {
      const result = await Product.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );

      if (result.matchedCount === 0 || result.modifiedCount === 0) {
        throw createHttpError(409, `Unable to reserve stock for ${item.nameSnapshot}`);
      }

      reducedItems.push(item);
    }
  } catch (error) {
    for (const item of reducedItems) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } }
      );
    }

    throw error;
  }
}

async function clearCart(userId) {
  await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { new: true }
  );
}

export async function createOrderFromCart(userId, shippingAddress, notes) {
  if (!userId) {
    throw createHttpError(401, 'User context is required');
  }

  validateShippingAddress(shippingAddress);

  const cart = await Cart.findOne({ userId }).populate('items.productId');

  if (!cart || cart.items.length === 0) {
    throw createHttpError(400, 'Cart is empty');
  }

  const items = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
    const product = cartItem.productId;

    if (!product) {
      throw createHttpError(404, 'Cart contains a product that no longer exists');
    }

    if (!product.isActive) {
      throw createHttpError(400, `Product ${product.name} is not active`);
    }

    if (product.stock < cartItem.quantity) {
      throw createHttpError(409, `Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }

    const lineSubtotal = product.price * cartItem.quantity;

    items.push({
      productId: product._id,
      nameSnapshot: product.name,
      priceSnapshot: product.price,
      quantity: cartItem.quantity,
      subtotal: lineSubtotal
    });

    subtotal += lineSubtotal;
  }

  const order = await Order.create({
    user: userId,
    items,
    subtotal,
    totalAmount: subtotal,
    paymentStatus: 'pending',
    fulfillmentStatus: 'pending',
    orderStatus: 'created',
    shippingAddress,
    notes: notes?.trim() || ''
  });

  return populateOrder(order);
}

export async function getOrderById(orderId) {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createHttpError(404, 'Order not found');
  }

  return populateOrder(order);
}

export async function listOrders() {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('items.productId', 'name price stock isActive');

  return orders;
}

export async function markOrderPaid({
  order,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) {
  if (order.paymentStatus === 'paid' && order.fulfillmentStatus === 'completed') {
    return populateOrder(order);
  }

  const claimedOrder = await Order.findOneAndUpdate(
    { _id: order._id, fulfillmentStatus: 'pending' },
    {
      $set: {
        fulfillmentStatus: 'processing',
        razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date()
      }
    },
    { new: true }
  );

  if (!claimedOrder) {
    const latestOrder = await Order.findById(order._id);
    return populateOrder(latestOrder || order);
  }

  try {
    await validateOrderStock(claimedOrder);
    await reduceOrderStock(claimedOrder);

    claimedOrder.paymentStatus = 'paid';
    claimedOrder.orderStatus = 'processing';
    claimedOrder.fulfillmentStatus = 'completed';
    claimedOrder.razorpayOrderId = razorpayOrderId || claimedOrder.razorpayOrderId;
    claimedOrder.razorpayPaymentId = razorpayPaymentId;
    claimedOrder.razorpaySignature = razorpaySignature;
    claimedOrder.paidAt = claimedOrder.paidAt || new Date();

    await claimedOrder.save();
    await clearCart(claimedOrder.user);

    return populateOrder(claimedOrder);
  } catch (error) {
    claimedOrder.fulfillmentStatus = 'failed';
    claimedOrder.orderStatus = 'cancelled';
    claimedOrder.paymentStatus = 'failed';
    claimedOrder.notes = claimedOrder.notes
      ? `${claimedOrder.notes}\nPayment was verified but stock reservation failed: ${error.message}`
      : `Payment was verified but stock reservation failed: ${error.message}`;

    await claimedOrder.save();

    throw error;
  }
}

export async function cancelUnpaidOrder(order, reason) {
  order.paymentStatus = 'failed';
  order.fulfillmentStatus = 'failed';
  order.orderStatus = 'cancelled';
  order.notes = order.notes ? `${order.notes}\n${reason}` : reason;
  await order.save();
  return populateOrder(order);
}

export { clearCart, createHttpError, populateOrder };