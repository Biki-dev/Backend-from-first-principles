import {
  createRazorpayOrderForInternalOrder,
  handleRazorpayWebhook,
  verifyAndFinalizePayment
} from '../services/payment.service.js';

export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const result = await createRazorpayOrderForInternalOrder(orderId, req.user._id);

    res.status(200).json({
      message: 'Razorpay order created successfully',
      order: result.order,
      razorpayOrder: result.razorpayOrder
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Error creating Razorpay order'
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await verifyAndFinalizePayment({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      userId: req.user._id
    });

    res.status(200).json({
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Error verifying payment'
    });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const order = await handleRazorpayWebhook(rawBody, signature, req.body);

    res.status(200).json({
      message: 'Webhook processed successfully',
      order
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Error processing webhook'
    });
  }
};