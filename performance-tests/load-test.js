import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom Metrics
const loginResponseTime = new Trend('login_response_time', true);
const loginErrors = new Rate('login_errors');
const loginRequests = new Counter('login_requests');

/**
 * Load Test Configuration
 * Measures ERP authentication performance under standard / expected virtual user load.
 */
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 VUs
    { duration: '30s', target: 25 },  // Ramp up to 25 VUs
    { duration: '30s', target: 50 },  // Ramp up to 50 VUs
    { duration: '30s', target: 100 }, // Peak load stage at 100 VUs
    { duration: '30s', target: 0 }    // Ramp down to 0 VUs
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],      // HTTP failure rate should remain below 5%
    http_req_duration: ['p(95)<2000'],   // 95% of requests should complete within 2000ms
    login_errors: ['rate<0.05']          // Login business errors should remain below 5%
  }
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:5000';

export default function () {
  const email = __ENV.TEST_EMAIL;
  const password = __ENV.TEST_PASSWORD;

  if (!email || !password) {
    console.error('ERROR: TEST_EMAIL and TEST_PASSWORD must be provided as environment variables.');
    sleep(1);
    return;
  }

  const url = `${BASE_URL}/api/auth/login`;
  const payload = JSON.stringify({ email, password });
  const params = {
    headers: {
      'Content-Type': 'application/json'
    },
    tags: { name: 'POST /api/auth/login' }
  };

  loginRequests.add(1);
  const startTime = Date.now();
  const res = http.post(url, payload, params);
  const duration = Date.now() - startTime;

  loginResponseTime.add(duration);

  // Check HTTP response code and JWT payload
  const is200 = check(res, {
    'is status 200': (r) => r.status === 200,
    'returns token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!body.token;
      } catch (_) {
        return false;
      }
    }
  });

  if (res.status === 401) {
    console.warn('[AUTH 401] Invalid test credentials provided via TEST_EMAIL and TEST_PASSWORD.');
  }

  loginErrors.add(!is200);

  // Short pause before next iteration
  sleep(1);
}
