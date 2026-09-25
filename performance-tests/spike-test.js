import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom Metrics
const loginResponseTime = new Trend('login_response_time', true);
const loginErrors = new Rate('login_errors');
const loginRequests = new Counter('login_requests');

/**
 * Spike Test Configuration
 * Simulates a sudden surge in concurrent traffic to observe burst handling, queueing, and recovery.
 * Stages: 10 VUs (baseline) -> 200 VUs (spike) -> 200 VUs (sustained) -> 10 VUs (recovery) -> 0 VUs
 */
export const options = {
  stages: [
    { duration: '20s', target: 10 },  // Baseline normal traffic
    { duration: '10s', target: 200 }, // Sharp spike to 200 VUs
    { duration: '60s', target: 200 }, // Sustained burst load
    { duration: '20s', target: 10 },  // Quick drop back to normal traffic
    { duration: '20s', target: 0 }    // Cooldown to 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<3000'],
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
