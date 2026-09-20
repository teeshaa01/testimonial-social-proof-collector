const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { app } = require('./server');

let server;
let cookies = [];

function request(method, path, body = null, useCookies = false) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (useCookies && cookies.length > 0) {
      headers['Cookie'] = cookies.join('; ');
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method,
        headers
      },
      (res) => {
        let resData = '';
        if (res.headers['set-cookie']) {
          cookies = res.headers['set-cookie'].map((c) => c.split(';')[0]);
        }
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: JSON.parse(resData)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              raw: resData
            });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING AUTHENTICATION & SECURITY TESTS ---');

  const testEmail = `owner_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // 1. Signup
  console.log('1. Testing POST /api/auth/signup...');
  const signupRes = await request('POST', '/api/auth/signup', {
    name: 'Test Owner',
    email: testEmail,
    password: testPassword
  });
  console.log('Signup status:', signupRes.status);
  console.log('User created:', signupRes.body.user?.email);
  console.log('Email preview link:', signupRes.body.emailPreview?.link);
  if (signupRes.status !== 201) throw new Error('Signup failed: ' + JSON.stringify(signupRes.body));

  // Extract verification token
  const verifyToken = signupRes.body.emailPreview.link.split('token=')[1];

  // 2. Email verification simulation
  console.log('\n2. Testing POST /api/auth/verify-email...');
  const verifyRes = await request('POST', '/api/auth/verify-email', {
    token: verifyToken
  });
  console.log('Verify status:', verifyRes.status, verifyRes.body.message);
  if (verifyRes.status !== 200) throw new Error('Email verify failed');

  // 3. Login
  console.log('\n3. Testing POST /api/auth/login...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword
  });
  console.log('Login status:', loginRes.status, 'Cookies received:', cookies.length);
  if (loginRes.status !== 200 || cookies.length === 0) throw new Error('Login failed');

  // 4. Protected Route /api/auth/me
  console.log('\n4. Testing GET /api/auth/me with cookies...');
  const meRes = await request('GET', '/api/auth/me', null, true);
  console.log('Me status:', meRes.status, 'User verified:', meRes.body.user?.isEmailVerified);
  if (meRes.status !== 200 || !meRes.body.user) throw new Error('Auth me failed');

  // 5. Refresh token rotation
  console.log('\n5. Testing POST /api/auth/refresh (Token Rotation)...');
  const oldCookies = [...cookies];
  const refreshRes = await request('POST', '/api/auth/refresh', {}, true);
  console.log('Refresh status:', refreshRes.status, 'New cookies received:', cookies.length);
  if (refreshRes.status !== 200) throw new Error('Refresh failed: ' + JSON.stringify(refreshRes.body));

  // 6. Test protected route with rotated cookies
  console.log('\n6. Testing GET /api/auth/me with new rotated cookies...');
  const meRes2 = await request('GET', '/api/auth/me', null, true);
  console.log('Me after rotation status:', meRes2.status);
  if (meRes2.status !== 200) throw new Error('Auth me after rotation failed');

  // 7. Logout
  console.log('\n7. Testing POST /api/auth/logout...');
  const logoutRes = await request('POST', '/api/auth/logout', {}, true);
  console.log('Logout status:', logoutRes.status, logoutRes.body.message);
  if (logoutRes.status !== 200) throw new Error('Logout failed');

  // 8. Protected route after logout should be 401
  console.log('\n8. Testing GET /api/auth/me after logout (Expect 401)...');
  const meRes3 = await request('GET', '/api/auth/me', null, true);
  console.log('Me after logout status:', meRes3.status, meRes3.body.message);
  if (meRes3.status !== 401) throw new Error('Expected 401 after logout');

  // 9. Forgot Password Simulation
  console.log('\n9. Testing POST /api/auth/forgot-password...');
  const forgotRes = await request('POST', '/api/auth/forgot-password', {
    email: testEmail
  });
  console.log('Forgot status:', forgotRes.status, 'Reset link:', forgotRes.body.emailPreview?.link);
  const resetToken = forgotRes.body.emailPreview.link.split('token=')[1];

  // 10. Reset Password
  console.log('\n10. Testing POST /api/auth/reset-password...');
  const newPassword = 'NewPassword456!';
  const resetRes = await request('POST', '/api/auth/reset-password', {
    token: resetToken,
    password: newPassword
  });
  console.log('Reset status:', resetRes.status, resetRes.body.message);
  if (resetRes.status !== 200) throw new Error('Reset password failed');

  // 11. Login with new password
  console.log('\n11. Testing POST /api/auth/login with new password...');
  const newLoginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: newPassword
  });
  console.log('New Login status:', newLoginRes.status, 'Success:', newLoginRes.body.success);
  if (newLoginRes.status !== 200) throw new Error('New login failed');

  console.log('\n========================================');
  console.log('ALL AUTHENTICATION & SECURITY TESTS PASSED!');
  console.log('========================================\n');
  process.exit(0);
}

// Start server and run tests
setTimeout(() => {
  runTests().catch((err) => {
    console.error('TEST SUITE FAILED:', err);
    process.exit(1);
  });
}, 1500);
