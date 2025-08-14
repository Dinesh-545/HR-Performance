const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5055/api';
const TEST_USERS = {
  employee: { username: 'employee1', password: 'password123' },
  manager: { username: 'manager1', password: 'password123' },
  hrAdmin: { username: 'hradmin1', password: 'password123' }
};

// Test results
let testResults = [];

// Helper function to get JWT token
async function getToken(user) {
  try {
    const response = await axios.post(`${API_BASE_URL}/Auth/login`, user);
    return response.data.token;
  } catch (error) {
    console.error(`Failed to get token for ${user.username}:`, error.response?.data || error.message);
    return null;
  }
}

// Helper function to make authenticated request
async function makeAuthenticatedRequest(endpoint, token, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status, 
      error: error.response?.data || error.message 
    };
  }
}

// Test function
async function runTest(testName, testFunction) {
  console.log(`\n🧪 Running: ${testName}`);
  try {
    await testFunction();
    console.log(`✅ PASS: ${testName}`);
    testResults.push({ test: testName, status: 'PASS' });
  } catch (error) {
    console.log(`❌ FAIL: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.push({ test: testName, status: 'FAIL', error: error.message });
  }
}

// Test cases
async function testEmployeeAccess() {
  const token = await getToken(TEST_USERS.employee);
  if (!token) throw new Error('Failed to get employee token');

  // Test accessing own profile
  const profileResult = await makeAuthenticatedRequest('/Auth/profile', token);
  if (!profileResult.success) {
    throw new Error(`Failed to access profile: ${profileResult.error}`);
  }

  // Test accessing employees (should only see own data)
  const employeesResult = await makeAuthenticatedRequest('/Employees', token);
  if (!employeesResult.success) {
    throw new Error(`Failed to access employees: ${employeesResult.error}`);
  }

  // Test accessing analytics (should be forbidden)
  const analyticsResult = await makeAuthenticatedRequest('/Analytics', token);
  if (analyticsResult.success) {
    throw new Error('Employee should not be able to access analytics');
  }

  console.log('   Employee can access own profile and employees list');
  console.log('   Employee cannot access analytics (as expected)');
}

async function testManagerAccess() {
  const token = await getToken(TEST_USERS.manager);
  if (!token) throw new Error('Failed to get manager token');

  // Test accessing employees (should see team + own)
  const employeesResult = await makeAuthenticatedRequest('/Employees', token);
  if (!employeesResult.success) {
    throw new Error(`Failed to access employees: ${employeesResult.error}`);
  }

  // Test accessing analytics (should be allowed)
  const analyticsResult = await makeAuthenticatedRequest('/Analytics', token);
  if (!analyticsResult.success) {
    throw new Error(`Failed to access analytics: ${analyticsResult.error}`);
  }

  // Test accessing advanced analytics (should be forbidden)
  const advancedAnalyticsResult = await makeAuthenticatedRequest('/AdvancedAnalytics', token);
  if (advancedAnalyticsResult.success) {
    throw new Error('Manager should not be able to access advanced analytics');
  }

  console.log('   Manager can access employees and analytics');
  console.log('   Manager cannot access advanced analytics (as expected)');
}

async function testHRAdminAccess() {
  const token = await getToken(TEST_USERS.hrAdmin);
  if (!token) throw new Error('Failed to get HR Admin token');

  // Test accessing all employees
  const employeesResult = await makeAuthenticatedRequest('/Employees', token);
  if (!employeesResult.success) {
    throw new Error(`Failed to access employees: ${employeesResult.error}`);
  }

  // Test accessing analytics
  const analyticsResult = await makeAuthenticatedRequest('/Analytics', token);
  if (!analyticsResult.success) {
    throw new Error(`Failed to access analytics: ${analyticsResult.error}`);
  }

  // Test accessing advanced analytics
  const advancedAnalyticsResult = await makeAuthenticatedRequest('/AdvancedAnalytics', token);
  if (!advancedAnalyticsResult.success) {
    throw new Error(`Failed to access advanced analytics: ${advancedAnalyticsResult.error}`);
  }

  console.log('   HR Admin can access all features');
}

async function testUnauthorizedAccess() {
  // Test accessing protected endpoint without token
  const result = await makeAuthenticatedRequest('/Employees', null);
  if (result.success) {
    throw new Error('Should not be able to access protected endpoint without token');
  }

  console.log('   Unauthorized access properly blocked');
}

async function testTokenValidation() {
  const token = await getToken(TEST_USERS.employee);
  if (!token) throw new Error('Failed to get token');

  // Test with valid token
  const validResult = await makeAuthenticatedRequest('/Auth/profile', token);
  if (!validResult.success) {
    throw new Error(`Valid token should work: ${validResult.error}`);
  }

  // Test with invalid token
  const invalidResult = await makeAuthenticatedRequest('/Auth/profile', 'invalid_token');
  if (invalidResult.success) {
    throw new Error('Invalid token should not work');
  }

  console.log('   Token validation working correctly');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting RBAC Tests...');
  console.log('=====================================');

  await runTest('Employee Access Control', testEmployeeAccess);
  await runTest('Manager Access Control', testManagerAccess);
  await runTest('HR Admin Access Control', testHRAdminAccess);
  await runTest('Unauthorized Access Prevention', testUnauthorizedAccess);
  await runTest('Token Validation', testTokenValidation);

  // Print summary
  console.log('\n📊 Test Summary');
  console.log('=====================================');
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.test}: ${r.error}`);
    });
  }

  if (passed === testResults.length) {
    console.log('\n🎉 All tests passed! RBAC implementation is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults }; 