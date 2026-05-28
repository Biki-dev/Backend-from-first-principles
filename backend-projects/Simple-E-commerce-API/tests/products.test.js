import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const API_URL = process.env.API_URL || 'http://localhost:3000/api/products';
const TOKEN = process.env.TOKEN ;

const testProduct = {
  name: 'Test Product',
  description: 'This is a test product',
  price: 99.99,
  stock: 10,
  category: '65f8a1b2c3d4e5f6a7b8c9d0'
};

const authHeaders = {
  Authorization: `Bearer ${TOKEN}`
};

try {
  if (TOKEN === 'YOUR_JWT_TOKEN') {
    throw new Error('Set TOKEN before running: TOKEN=<jwt> node test-products.js');
  }

  // Create product
  const createRes = await axios.post(API_URL, testProduct, {
    headers: authHeaders
  });
  console.log('Created:', createRes.data);

  // Get all products
  const getAllRes = await axios.get(API_URL);
  console.log('All products count:', getAllRes.data.length);

  // Get single product
  const getRes = await axios.get(`${API_URL}/${createRes.data._id}`);
  console.log('Single product:', getRes.data);

  // Update product
  const updateRes = await axios.put(
    `${API_URL}/${createRes.data._id}`,
    { ...testProduct, price: 89.99 },
    { headers: authHeaders }
  );
  console.log('Updated:', updateRes.data);

  // Delete product
  const deleteRes = await axios.delete(`${API_URL}/${createRes.data._id}`, {
    headers: authHeaders
  });
  console.log('Deleted:', deleteRes.data);
} catch (error) {
  if (error.response) {
    console.error('Request failed:', error.response.status, error.response.data);
  } else {
    console.error('Error:', error.message);
  }
  process.exit(1);
}
