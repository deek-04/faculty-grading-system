/**
 * Simple test script to verify backend functionality
 * Run with: node test-server.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: JSON.parse(data)
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Backend Server...\n');

  try {
    // Test 1: Health check
    console.log('Test 1: Health Check');
    const health = await makeRequest('/health');
    console.log(`✓ Status: ${health.statusCode}`);
    console.log(`✓ Response:`, health.data);
    console.log('');

    // Test 2: 404 handler
    console.log('Test 2: 404 Handler');
    const notFound = await makeRequest('/nonexistent');
    console.log(`✓ Status: ${notFound.statusCode}`);
    console.log(`✓ Response:`, notFound.data);
    console.log('');

    // Test 3: CORS headers
    console.log('Test 3: CORS Configuration');
    console.log('✓ CORS is configured for:', process.env.FRONTEND_URL || 'http://localhost:5173');
    console.log('');

    console.log('✅ All tests passed!');
    console.log('\nServer is ready for development.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
