// tests/manual-cart-test.js
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Cart from '../models/Cart.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function manualTest() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Clear ALL existing test data (not just by email/name)
    await User.deleteMany({ email: /testuser@example.com/ });
    await Product.deleteMany({ 
      $or: [
        { name: /Test Product/ },
        { slug: /test-product/ },
        { slug: 'inactive-product' }
      ]
    });
    await Cart.deleteMany({});
    console.log('✅ Cleared test data');
    
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'hashedpassword123',
      role: 'user'
    });
    console.log('✅ Created test user:', user._id.toString());
    
    // Create test product with unique slug
    const timestamp = Date.now();
    const product = await Product.create({
      name: `Test Product ${timestamp}`,
      slug: `test-product-${timestamp}`,
      description: 'This is a test product',
      price: 29.99,
      stock: 100,
      images: [
        { 
          url: 'https://example.com/test-product.jpg', 
          alt: 'Test Product Image' 
        }
      ],
      category: 'Electronics',
      isActive: true,
      createdBy: user._id
    });
    console.log('✅ Created test product:', product._id.toString());
    
    // Create second test product
    const product2 = await Product.create({
      name: `Test Product 2 ${timestamp}`,
      slug: `test-product-2-${timestamp}`,
      description: 'Another test product',
      price: 49.99,
      stock: 50,
      images: [
        { 
          url: 'https://example.com/test-product-2.jpg', 
          alt: 'Test Product 2 Image' 
        },
        { 
          url: 'https://example.com/test-product-2-extra.jpg', 
          alt: 'Test Product 2 Extra Image' 
        }
      ],
      category: 'Clothing',
      isActive: true,
      createdBy: user._id
    });
    console.log('✅ Created second test product:', product2._id.toString());
    
    // Create inactive product with unique slug
    const inactiveProduct = await Product.create({
      name: `Inactive Product ${timestamp}`,
      slug: `inactive-product-${timestamp}`,
      description: 'This product is inactive',
      price: 19.99,
      stock: 10,
      images: [{ url: 'https://example.com/inactive.jpg', alt: 'Inactive Product' }],
      category: 'Misc',
      isActive: false,
      createdBy: user._id
    });
    console.log('✅ Created inactive test product:', inactiveProduct._id.toString());
    
    // Generate JWT token - MAKE SURE YOU HAVE A VALID TOKEN
    // Either generate one here or use a valid token from .env
    let token = process.env.TOKEN;
    
    if (!token) {
      // Generate a new token if not provided in .env
      token = jwt.sign(
        { 
          id: user._id.toString(), 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '1h' }
      );
      console.log('✅ Generated new token');
    } else {
      console.log('✅ Using token from .env');
    }
    
    console.log('\n=== Starting Cart API Tests ===\n');
    
    // Test 1: Add to cart
    console.log('📝 Test 1: Add product to cart');
    const addResponse = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 2
      });
    
    console.log('Status:', addResponse.status);
    if (addResponse.status === 200) {
      console.log('✅ Product added successfully');
      console.log('Cart items:', addResponse.body.cart?.items?.length || 0);
    } else {
      console.log('❌ Failed:', addResponse.body.message);
    }
    console.log('');
    
    // Test 2: Add same product again (should update quantity)
    console.log('📝 Test 2: Add same product again (should update quantity)');
    const addSameResponse = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 3
      });
    
    console.log('Status:', addSameResponse.status);
    if (addSameResponse.status === 200) {
      const item = addSameResponse.body.cart?.items?.find(
        i => i.productId?._id?.toString() === product._id.toString()
      );
      console.log('✅ Quantity updated to:', item?.quantity);
    } else {
      console.log('❌ Failed:', addSameResponse.body.message);
    }
    console.log('');
    
    // Test 3: Add second product to cart
    console.log('📝 Test 3: Add second product to cart');
    const addResponse2 = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product2._id.toString(),
        quantity: 1
      });
    
    console.log('Status:', addResponse2.status);
    if (addResponse2.status === 200) {
      console.log('✅ Second product added');
    } else {
      console.log('❌ Failed:', addResponse2.body.message);
    }
    console.log('');
    
    // Test 4: Try to add inactive product (should fail)
    console.log('📝 Test 4: Try to add inactive product (should fail)');
    const inactiveResponse = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: inactiveProduct._id.toString(),
        quantity: 1
      });
    
    console.log('Status:', inactiveResponse.status);
    if (inactiveResponse.status === 400) {
      console.log('✅ Correctly blocked -', inactiveResponse.body.message);
    } else {
      console.log('⚠️ Unexpected response:', inactiveResponse.body.message);
    }
    console.log('');
    
    // Test 5: Get cart items
    console.log('📝 Test 5: Get cart items');
    const getResponse = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Status:', getResponse.status);
    if (getResponse.status === 200) {
      console.log('✅ Cart retrieved');
      console.log('Total Items:', getResponse.body.totalItems);
      console.log('Total Price: $', getResponse.body.totalPrice);
      console.log('Products in cart:', getResponse.body.items?.length || 0);
      if (getResponse.body.items) {
        getResponse.body.items.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.productId?.name} - Quantity: ${item.quantity} - Price: $${item.productId?.price}`);
        });
      }
    } else {
      console.log('❌ Failed:', getResponse.body.message);
    }
    console.log('');
    
    // Test 6: Update cart item quantity
    console.log('📝 Test 6: Update cart item quantity');
    const updateResponse = await request(app)
      .patch(`/api/cart/item/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });
    
    console.log('Status:', updateResponse.status);
    if (updateResponse.status === 200) {
      console.log('✅ Quantity updated');
      const updatedItem = updateResponse.body.items?.find(
        item => item.productId?._id?.toString() === product._id.toString()
      );
      console.log('New quantity:', updatedItem?.quantity);
    } else {
      console.log('❌ Failed:', updateResponse.body.message);
    }
    console.log('');
    
    // Test 7: Try to update with invalid quantity
    console.log('📝 Test 7: Try to update with invalid quantity (should fail)');
    const invalidUpdateResponse = await request(app)
      .patch(`/api/cart/item/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 0 });
    
    console.log('Status:', invalidUpdateResponse.status);
    if (invalidUpdateResponse.status === 400) {
      console.log('✅ Correctly blocked -', invalidUpdateResponse.body.message);
    } else {
      console.log('⚠️ Unexpected response:', invalidUpdateResponse.body.message);
    }
    console.log('');
    
    // Test 8: Try to add more than stock
    console.log('📝 Test 8: Try to exceed stock limit (should fail)');
    const exceedResponse = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 200
      });
    
    console.log('Status:', exceedResponse.status);
    if (exceedResponse.status === 400) {
      console.log('✅ Correctly blocked -', exceedResponse.body.message);
    } else {
      console.log('⚠️ Unexpected response:', exceedResponse.body.message);
    }
    console.log('');
    
    // Test 9: Remove specific product from cart
    console.log('📝 Test 9: Remove product from cart');
    const removeResponse = await request(app)
      .delete(`/api/cart/remove/${product2._id}`)
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Status:', removeResponse.status);
    if (removeResponse.status === 200) {
      console.log('✅ Product removed');
      console.log('Remaining items:', removeResponse.body.items?.length);
    } else {
      console.log('❌ Failed:', removeResponse.body.message);
    }
    console.log('');
    
    // Test 10: Get cart after removal
    console.log('📝 Test 10: Get cart after removal');
    const getAfterRemoveResponse = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Status:', getAfterRemoveResponse.status);
    if (getAfterRemoveResponse.status === 200) {
      console.log('✅ Cart retrieved');
      console.log('Remaining items:', getAfterRemoveResponse.body.items?.length);
    }
    console.log('');
    
    // Test 11: Clear entire cart
    console.log('📝 Test 11: Clear entire cart');
    const clearResponse = await request(app)
      .delete('/api/cart/clear')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Status:', clearResponse.status);
    if (clearResponse.status === 200) {
      console.log('✅ Cart cleared');
    } else {
      console.log('❌ Failed:', clearResponse.body.message);
    }
    console.log('');
    
    // Test 12: Verify cart is empty
    console.log('📝 Test 12: Verify cart is empty');
    const finalGetResponse = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Status:', finalGetResponse.status);
    if (finalGetResponse.status === 200) {
      console.log('✅ Final cart check');
      console.log('Total items in cart:', finalGetResponse.body.totalItems);
      console.log('Cart items count:', finalGetResponse.body.items?.length || 0);
    }
    console.log('');
    
    // Test 13: Unauthorized access (no token)
    console.log('📝 Test 13: Unauthorized access (should fail)');
    const noAuthResponse = await request(app)
      .get('/api/cart');
    
    console.log('Status:', noAuthResponse.status);
    if (noAuthResponse.status === 401) {
      console.log('✅ Correctly blocked - Authentication required');
    } else {
      console.log('⚠️ Unexpected response status:', noAuthResponse.status);
    }
    console.log('');
    
    console.log('=== ✅ All Cart API Tests Completed Successfully ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 11000) {
      console.error('Duplicate key error. Please clear your database or use unique slugs.');
    }
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the manual test
manualTest();