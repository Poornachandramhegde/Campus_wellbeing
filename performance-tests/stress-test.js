import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom Metrics
const loginResponseTime = new Trend('login_response_time', true);
const loginErrors = new Rate('login_errors');
const loginRequests = new Counter('login_requests');

/**
 * Stress Test Configuration
 * Progressively ramps up virtual users to observe latency degradation, error saturation, and breaking points.
 * Stages: 50 -> 100 -> 200 -> 300 -> 500 -> 800 VUs
 */
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Stage 1: 50 VUs
    { duration: '30s', target: 100 }, // Stage 2: 100 VUs
    { duration: '30s', target: 200 }, // Stage 3: 200 VUs
    { duration: '30s', target: 300 }, // Stage 4: 300 VUs
    { duration: '30s', target: 500 }, // Stage 5: 500 VUs
    { duration: '30s', target: 800 }, // Stage 6: 800 VUs (stress threshold ceiling)
    { duration: '30s', target: 0 }    // Ramp down to 0 VUs
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],      // Failure rate tracked across stress load
    http_req_duration: ['p(95)<3000'],   // Latency degradation ceiling criteria
    login_errors: ['rate<0.10']
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

  // Check response status and token presence
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

  // Brief pause between requests
  sleep(1);
}
