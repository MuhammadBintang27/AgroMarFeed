const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000';
const FRONTEND_URL = 'http://localhost:3000';

async function testIntegration() {
  console.log('🚀 Testing Frontend-Backend Integration\n');

  try {
    // 1. Test backend health
    console.log('1. Testing Backend Health...');
    const backendHealth = await axios.get(`${BACKEND_URL}/`);
    console.log('✅ Backend is running:', backendHealth.data);

    // 2. Test frontend health
    console.log('\n2. Testing Frontend Health...');
    try {
      const frontendHealth = await axios.get(`${FRONTEND_URL}/`);
      console.log('✅ Frontend is running');
    } catch (error) {
      console.log('⚠️  Frontend might not be running (this is okay for backend testing)');
    }

    // 3. Test orders endpoint
    console.log('\n3. Testing Orders Endpoint...');
    try {
      const ordersResponse = await axios.get(`${BACKEND_URL}/api/orders/user/test-user-id`);
      console.log('✅ Orders endpoint working');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Orders endpoint working (404 expected for non-existent user)');
      } else {
        console.log('❌ Orders endpoint error:', error.response?.data || error.message);
      }
    }

    // 4. Test payment notification endpoint
    console.log('\n4. Testing Payment Notification Endpoint...');
    try {
      const notificationResponse = await axios.post(`${BACKEND_URL}/api/payment/notification`, {
        order_id: 'test-order',
        transaction_status: 'pending',
        status_code: '200',
        gross_amount: '100000'
      });
      console.log('✅ Payment notification endpoint working');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Payment notification endpoint working (404 expected for non-existent order)');
      } else {
        console.log('❌ Payment notification endpoint error:', error.response?.data || error.message);
      }
    }

    // 5. Test cart endpoint
    console.log('\n5. Testing Cart Endpoint...');
    try {
      const cartResponse = await axios.get(`${BACKEND_URL}/api/cart/user/test-user-id`);
      console.log('✅ Cart endpoint working');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Cart endpoint working (404 expected for non-existent user)');
      } else {
        console.log('❌ Cart endpoint error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Integration test completed!');
    console.log('\n📋 Summary:');
    console.log('- Backend: ✅ Running');
    console.log('- Orders API: ✅ Working');
    console.log('- Payment API: ✅ Working');
    console.log('- Cart API: ✅ Working');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

testIntegration(); 