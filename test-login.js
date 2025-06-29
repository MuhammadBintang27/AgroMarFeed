// Test script untuk verifikasi login email/password
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing login functionality...');
    
    // Test login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'habilaswad30@gmail.com',
      password: 'password123' // Ganti dengan password yang benar
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login response:', loginResponse.data);
    console.log('✅ Login cookies:', loginResponse.headers['set-cookie']);
    
    // Test current user
    const userResponse = await axios.get('http://localhost:3000/api/auth/current-user', {
      withCredentials: true,
      headers: {
        'Cookie': loginResponse.headers['set-cookie']?.join('; ') || ''
      }
    });
    
    console.log('✅ Current user response:', userResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testLogin(); 