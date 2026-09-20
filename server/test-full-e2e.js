const http = require('http');
require('dotenv').config();
const { app } = require('./server');

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

async function runEndToEndTest() {
  console.log('================================================================');
  console.log('--- STARTING COMPREHENSIVE END-TO-END ASSESSMENT VERIFICATION ---');
  console.log('================================================================\n');

  const uniqueId = Date.now();
  const email = `owner_${uniqueId}@saascorp.com`;
  const password = 'Password@123';
  const spaceSlug = `acme-innovations-${uniqueId}`;

  // 1. Owner Signup
  console.log('Step 1: Testing Owner Signup...');
  const signupRes = await request('POST', '/api/auth/signup', {
    name: 'Sarah Connor',
    email,
    password
  });
  console.log('  -> Status:', signupRes.status, 'User:', signupRes.body.user?.name);
  if (signupRes.status !== 201) throw new Error('Signup failed: ' + JSON.stringify(signupRes.body));

  // 2. Email verification simulation
  console.log('\nStep 2: Simulating Email Verification...');
  const verifyToken = signupRes.body.emailPreview?.link?.split('token=')[1];
  const verifyRes = await request('POST', '/api/auth/verify-email', { token: verifyToken });
  console.log('  -> Status:', verifyRes.status, verifyRes.body.message);
  if (verifyRes.status !== 200) throw new Error('Email verification failed');

  // 3. Login
  console.log('\nStep 3: Testing Owner Login & httpOnly Cookies...');
  const loginRes = await request('POST', '/api/auth/login', { email, password });
  console.log('  -> Status:', loginRes.status, 'User verified:', loginRes.body.user?.isEmailVerified);
  console.log('  -> Cookies set:', cookies.length);
  if (loginRes.status !== 200) throw new Error('Login failed');

  // 4. Create Space
  console.log('\nStep 4: Creating a Testimonial Space...');
  const spaceRes = await request(
    'POST',
    '/api/spaces',
    {
      name: 'Acme Innovations',
      slug: spaceSlug,
      headerTitle: 'Tell us how Acme helped your business grow',
      customMessage: 'We love feedback from our valued clients!',
      customPrompts: [
        'What problem were you facing?',
        'How did Acme solve it?',
        'Would you recommend us?'
      ],
      mandatoryAvatarToggle: false,
      starRatingToggle: true
    },
    true
  );
  console.log('  -> Status:', spaceRes.status, 'Space created:', spaceRes.body.space?.name, `(/collect/${spaceRes.body.space?.slug})`);
  if (spaceRes.status !== 201) throw new Error('Create space failed: ' + JSON.stringify(spaceRes.body));
  const spaceId = spaceRes.body.space._id;

  // 5. Query Public Space (No Auth Required)
  console.log('\nStep 5: Querying Public Collection endpoint (NO AUTH)...');
  const pubSpaceRes = await request('GET', `/api/public/spaces/${spaceSlug}`);
  console.log('  -> Status:', pubSpaceRes.status, 'Header:', pubSpaceRes.body.space?.headerTitle);
  if (pubSpaceRes.status !== 200) throw new Error('Public space fetch failed');

  // 6. Public Client submits Testimonial #1 (5 stars)
  console.log('\nStep 6: Public Client Submits 5-Star Testimonial (NO AUTH)...');
  const review1 = await request('POST', `/api/public/testimonials/${spaceSlug}`, {
    clientName: 'Alex Morgan',
    email: 'alex@fintech.io',
    companyRole: 'CTO @ FinTech Co',
    starRating: 5,
    reviewText: 'Acme transformed our deployment velocity within 2 weeks. Highly recommended!'
  });
  console.log('  -> Status:', review1.status, review1.body.message);
  if (review1.status !== 201) throw new Error('Submit review 1 failed');

  // 7. Public Client submits Testimonial #2 (4 stars)
  console.log('\nStep 7: Public Client Submits 4-Star Testimonial (NO AUTH)...');
  const review2 = await request('POST', `/api/public/testimonials/${spaceSlug}`, {
    clientName: 'Jordan Lee',
    email: 'jordan@designco.com',
    companyRole: 'Lead Designer',
    starRating: 4,
    reviewText: 'Super smooth experience, great customer support team.'
  });
  console.log('  -> Status:', review2.status, review2.body.message);
  if (review2.status !== 201) throw new Error('Submit review 2 failed');

  // 8. Owner Moderation: Fetch reviews
  console.log('\nStep 8: Owner fetches reviews for moderation...');
  const ownerReviewsRes = await request('GET', `/api/testimonials/space/${spaceId}`, null, true);
  console.log('  -> Status:', ownerReviewsRes.status, 'Reviews found:', ownerReviewsRes.body.count);
  if (ownerReviewsRes.status !== 200 || ownerReviewsRes.body.count !== 2) {
    throw new Error('Owner reviews fetch failed');
  }
  const review1Id = ownerReviewsRes.body.testimonials[1]._id;
  const review2Id = ownerReviewsRes.body.testimonials[0]._id;

  // 9. Owner Moderation: Approve Review #1
  console.log('\nStep 9: Owner Approves Review #1...');
  const approveRes = await request(
    'PATCH',
    `/api/testimonials/${review1Id}/status`,
    { status: 'approved' },
    true
  );
  console.log('  -> Status:', approveRes.status, 'New status:', approveRes.body.testimonial?.status);
  if (approveRes.status !== 200 || approveRes.body.testimonial?.status !== 'approved') {
    throw new Error('Approve review failed');
  }

  // 10. Owner Moderation: Mark Review #1 as Featured
  console.log('\nStep 10: Owner Marks Review #1 as Featured...');
  const featureRes = await request('PATCH', `/api/testimonials/${review1Id}/feature`, {}, true);
  console.log('  -> Status:', featureRes.status, 'isFeatured:', featureRes.body.isFeatured);
  if (featureRes.status !== 200 || !featureRes.body.isFeatured) {
    throw new Error('Feature review failed');
  }

  // 11. Owner Moderation: Mark Review #1 as Liked
  console.log('\nStep 11: Owner Likes Review #1...');
  const likeRes = await request('PATCH', `/api/testimonials/${review1Id}/like`, {}, true);
  console.log('  -> Status:', likeRes.status, 'isLiked:', likeRes.body.isLiked);
  if (likeRes.status !== 200 || !likeRes.body.isLiked) {
    throw new Error('Like review failed');
  }

  // 12. Owner Moderation: Approve Review #2
  console.log('\nStep 12: Owner Approves Review #2...');
  await request('PATCH', `/api/testimonials/${review2Id}/status`, { status: 'approved' }, true);

  // 13. Owner Metrics: Verify aggregated metrics & star breakdown
  console.log('\nStep 13: Querying Rating Metrics & Breakdown...');
  const metricsRes = await request('GET', `/api/spaces/${spaceId}/metrics`, null, true);
  console.log('  -> Total Reviews:', metricsRes.body.metrics?.totalReviews);
  console.log('  -> Average Rating:', metricsRes.body.metrics?.averageRating);
  console.log('  -> Status breakdown:', metricsRes.body.metrics?.statusCounts);
  console.log('  -> Star distribution:', metricsRes.body.metrics?.breakdown);
  if (metricsRes.status !== 200 || metricsRes.body.metrics?.totalReviews !== 2) {
    throw new Error('Metrics verification failed');
  }

  // 14. Wall of Love (Public): Verify approved reviews appear
  console.log('\nStep 14: Verifying Public Wall of Love (/api/public/wall/:slug)...');
  const wallRes = await request('GET', `/api/public/wall/${spaceSlug}`);
  console.log('  -> Status:', wallRes.status, 'Approved reviews displayed:', wallRes.body.count);
  console.log('  -> First review featured?:', wallRes.body.testimonials[0]?.isFeatured);
  if (wallRes.status !== 200 || wallRes.body.count !== 2) {
    throw new Error('Public wall verification failed');
  }

  // 15. Search & Filter Tests
  console.log('\nStep 15: Testing Keyword Search Filter...');
  const searchRes = await request(
    'GET',
    `/api/testimonials/space/${spaceId}?search=deployment`,
    null,
    true
  );
  console.log('  -> Search for "deployment" count:', searchRes.body.count);
  if (searchRes.body.count !== 1) throw new Error('Search filter failed');

  console.log('\nStep 16: Testing Star Rating Filter (5 stars only)...');
  const starFilterRes = await request(
    'GET',
    `/api/testimonials/space/${spaceId}?rating=5`,
    null,
    true
  );
  console.log('  -> 5-star filter count:', starFilterRes.body.count);
  if (starFilterRes.body.count !== 1) throw new Error('Star filter failed');

  // 16. Refresh Token Rotation Test
  console.log('\nStep 17: Testing Refresh Token Rotation...');
  const refreshRes = await request('POST', '/api/auth/refresh', {}, true);
  console.log('  -> Refresh status:', refreshRes.status, 'Cookies rotated:', cookies.length);
  if (refreshRes.status !== 200) throw new Error('Token rotation failed');

  // 17. Logout
  console.log('\nStep 18: Testing Logout & Cookie Clearance...');
  const logoutRes = await request('POST', '/api/auth/logout', {}, true);
  console.log('  -> Logout status:', logoutRes.status);
  if (logoutRes.status !== 200) throw new Error('Logout failed');

  console.log('\n================================================================');
  console.log('SUCCESS: ALL 18 END-TO-END ASSESSMENT REQUIREMENTS VERIFIED!');
  console.log('================================================================\n');
  process.exit(0);
}

setTimeout(() => {
  runEndToEndTest().catch((err) => {
    console.error('\nE2E VERIFICATION FAILED:', err);
    process.exit(1);
  });
}, 1200);
