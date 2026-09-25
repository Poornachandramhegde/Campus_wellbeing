# ERP Performance Testing Suite with K6

This directory contains automated performance testing scripts using [Grafana K6](https://k6.io/) to evaluate the performance, stability, and scalability of the College ERP authentication backend under varying virtual user (VU) concurrency profiles.

---

## 1. Purpose
The primary objective of these performance tests is to evaluate how the Node.js + Express.js backend and MySQL 8.0 database (`erp_wellbeing`) perform under simulated concurrent traffic. The suite measures API throughput, latency distribution (p90, p95, p99), error rates, and system degradation under expected load, progressive stress, and sudden traffic spikes.

---

## 2. Testing Scope

> [!IMPORTANT]
> **Authentication API Only**: Testing is strictly confined to:
> `POST http://localhost:5000/api/auth/login`
> 
> **Architecture Path Measured**:
> `K6 Virtual Users` ➔ `Node.js + Express Server` ➔ `Bcrypt Password Verification & JWT Token Generation` ➔ `MySQL 8.0 (user_login / users tables)` ➔ `HTTP Response`

---

## 3. Important Exclusions & Safety Guardrails

> [!WARNING]
> ### Intentional Exclusions:
> 1. **Counselling Booking Workflow Excluded**:
>    The following endpoints are **NOT** called in any performance test:
>    - `POST /api/counselling/book`
>    - `GET /api/counselling/my-appointments`
>    - `GET /api/counselling/list`
>    - `PATCH /api/counselling/:id/status`
> 2. **No Bulk Google Calendar / Google Meet Events**:
>    Excluding appointment creation guarantees that hundreds of Google Calendar events and Google Meet links are not generated.
> 3. **No Bulk Email Spam**:
>    Nodemailer notifications are not triggered during testing.
> 4. **No Appointment Table Pollution**:
>    The `appointments` table in MySQL remains untouched.

---

## 4. Local Machine Testing Limitations

> [!CAUTION]
> ### Local Execution Warning:
> - **Target is localhost**: All tests target `http://localhost:5000`.
> - **Shared System Resources**: K6 (load generator), Node.js (backend API), and MySQL 8.0 (database) execute on the **same local machine**.
> - **Resource Contention**: CPU cycles and RAM are shared between the load generation tool and the server under test.
> - **Test Machine Specific**: Observed throughput and latency figures directly depend on the local hardware configuration, background OS tasks, and thermal throttling.
> - **Virtual Users vs. Real Users**: K6 VUs execute in continuous tight iteration loops with minimal think-time, generating substantially higher requests-per-second than real human users. These results should not be directly equated to production server capacity.

---

## 5. K6 Installation

If K6 is not installed on Windows, install it using `winget`:

```powershell
winget install k6 --source winget
```

Verify the installation:
```powershell
k6 version
```

---

## 6. Test Account Configuration

Credentials must **never** be hardcoded into JavaScript test files. Configure them using environment variables in PowerShell prior to test execution:

```powershell
$env:TEST_EMAIL = "test_student_a@rnsit.ac.in"
$env:TEST_PASSWORD = "Password@123"
```

> [!NOTE]
> Ensure the test student account exists in the `users` and `user_login` tables before running tests. If invalid credentials are used, the server will return `HTTP 401`, which indicates a credential misconfiguration rather than a performance failure.

---

## 7. Performance Test Profiles & Procedures

### A. Load Test (`load-test.js`)
- **Purpose**: Measure backend performance under normal and peak expected operational traffic.
- **Stages**:
  - `0s  ➔ 30s`: Ramp up from 0 to 10 VUs
  - `30s ➔ 60s`: Ramp up from 10 to 25 VUs
  - `60s ➔ 90s`: Ramp up from 25 to 50 VUs
  - `90s ➔ 120s`: Ramp up to peak 100 VUs
  - `120s ➔ 150s`: Ramp down to 0 VUs
- **Pass / Fail Criteria (Thresholds)**:
  - `http_req_failed < 5%`
  - `http_req_duration p(95) < 2000ms`
- **Execution Command**:
  ```powershell
  k6 run performance-tests/load-test.js
  ```

---

### B. Stress Test (`stress-test.js`)
- **Purpose**: Progressively ramp up virtual users beyond expected capacity to observe performance degradation, latency inflection points, and error behavior.
- **Stages**:
  - `0s  ➔ 30s`: Ramp to 50 VUs
  - `30s ➔ 60s`: Ramp to 100 VUs
  - `60s ➔ 90s`: Ramp to 200 VUs
  - `90s ➔ 120s`: Ramp to 300 VUs
  - `120s ➔ 150s`: Ramp to 500 VUs
  - `150s ➔ 180s`: Ramp to 800 VUs (stress test ceiling)
  - `180s ➔ 210s`: Ramp down to 0 VUs
- **Execution Command**:
  ```powershell
  k6 run performance-tests/stress-test.js
  ```

---

### C. Spike Test (`spike-test.js`)
- **Purpose**: Evaluate system stability when hit with an instantaneous surge of concurrent traffic, measuring recovery behavior after the burst subsides.
- **Stages**:
  - `0s  ➔ 20s`: Baseline at 10 VUs
  - `20s ➔ 30s`: Sudden spike to 200 VUs (within 10s)
  - `30s ➔ 90s`: Sustained burst load at 200 VUs (60s)
  - `90s ➔ 110s`: Rapid drop to 10 VUs
  - `110s ➔ 130s`: Cooldown to 0 VUs
- **Execution Command**:
  ```powershell
  k6 run performance-tests/spike-test.js
  ```

---

## 8. Key Metrics to Monitor

When executing tests, K6 collects and outputs the following metrics:

| Metric | Description |
| :--- | :--- |
| `vus` / `vus_max` | Current active and maximum configured Virtual Users. |
| `iterations` | Total complete execution loops performed. |
| `http_reqs` | Total HTTP requests sent to the backend. |
| `http_req_duration` | Total request latency (including `avg`, `min`, `med`, `p(90)`, `p(95)`, `p(99)`, `max`). |
| `http_req_failed` | Rate of non-200 HTTP responses. |
| `login_response_time` | Custom Trend metric capturing end-to-end authentication roundtrip time. |
| `login_errors` | Custom Rate metric tracking non-200 / failed authentication attempts. |
| `data_received` / `data_sent` | Total network throughput across localhost socket. |

While testing, monitor system metrics using Windows Task Manager / Resource Monitor:
- **CPU Utilization (%)**: Node.js event loop vs MySQL CPU consumption.
- **Memory (RAM)**: Node.js heap and MySQL buffer pool utilization.
- **MySQL Connection Pool**: Active pool connections.
