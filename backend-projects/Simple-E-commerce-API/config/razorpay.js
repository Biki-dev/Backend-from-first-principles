import Razorpay from 'razorpay';

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.warn('Razorpay credentials are not fully configured');
}

let razorpayClient = null;

if (key_id && key_secret) {
  razorpayClient = new Razorpay({
    key_id,
    key_secret
  });
}

export function getRazorpayClient() {
  if (!razorpayClient) {
    throw new Error('Razorpay credentials are not configured');
  }

  return razorpayClient;
}

export default razorpayClient;