import {
  createOrderFromCart,
  listOrders,
  createHttpError,
  getOrderById
} from '../services/order.service.js';

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, notes } = req.body;
    const order = await createOrderFromCart(req.user._id, shippingAddress, notes);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Error creating order'
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await listOrders();

    res.status(200).json({ orders });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Error fetching orders'
    });
  }
};

export const getOrderByIdController = async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      throw createHttpError(403, 'Access denied');
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Error fetching order'
    });
  }
};
