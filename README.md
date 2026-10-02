# Remetra — Smart Bill Reminders & Spend Insights ⚡

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Node.js_Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Firebase Auth](https://img.shields.io/badge/Identity-Firebase_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Remetra** is a modern household financial vault designed to track recurring bills, subscriptions, and mobile recharges, automate email reminder notifications, process simulated digital settlements via Cashfree Sandbox, and provide actionable analytics on household spend distribution.

---

## 🌟 Core Capabilities

- 📱 **Recharge & Bill Tracking**: Track Prepaid validity cycles, Postpaid dues, Consumer IDs for utilities, and recurring subscriptions.
- ⏰ **Automated Email Reminders**: Daily background cron scheduler (`node-cron`) automatically alerts users via transactional email (Resend API) 3 days before obligations are due.
- 📊 **Spend Insights & Analytics**: Visual category distributions, top spender metrics, and monthly run-rate tracking.
- 💳 **Cashfree Sandbox Digital Payments**: In-app modal checkout powered by `@cashfreepayments/cashfree-js` with dual reconciliation (synchronous client verification + asynchronous HMAC-verified webhook).
- 🛡️ **Hardened Multi-Tier Security**: Firebase Admin authentication, tiered route-level rate limiting (`express-rate-limit`), Render proxy anti-spoofing (`TRUST_PROXY=1`), and atomic race-condition safeguards.
- 🎨 **FinTech Vault Design**: Sleek dark slate aesthetic with responsive glassmorphic cards and micro-interactions optimized down to 320px screens.

---

## 🏗️ System Architecture

![Remetra System Architecture Diagram](./docs/architecture-diagram.png)

Remetra operates as a decoupled, multi-tier cloud application:
1. **Client Tier**: React 18 single-page application built with Vite and Tailwind CSS.
2. **Identity Layer**: Firebase Authentication handling user signup, session persistence, and client token issuance.
3. **API & Gateway**: Node.js & Express REST API with route-level rate limiters and Firebase Admin token verification.
4. **Persistence**: MongoDB Atlas managing payment commitments, audit trails, and OTP verification records.
5. **Email Engine**: Background scheduler evaluating upcoming due dates and dispatching email notifications via Resend API.
6. **Payment Gateway**: Cashfree Sandbox handling order creation, hosted modal checkout, and webhook event delivery.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Axios, React Router DOM v6, `@cashfreepayments/cashfree-js` |
| **Backend** | Node.js (ES Modules), Express.js (v5), Mongoose ORM, `node-cron`, `cashfree-pg` SDK |
| **Security & Identity** | Firebase Admin SDK, `express-rate-limit` (v8), bcrypt, crypto |
| **Database & Cloud** | MongoDB Atlas, Render (Web Service), Resend API (Transactional Email) |

---


## 📂 Project Organization

```text
Remetra/
├── Backend/
│   ├── app.js                   # Express configuration, trust proxy & middleware pipeline
│   ├── index.js                 # HTTP listener & MongoDB connection bootstrap
│   └── src/
│       ├── config/              # MongoDB connection & Firebase Admin setup
│       ├── controllers/         # Auth, Contact, and Payment controllers
│       ├── jobs/                # reminderJob.js (Automated daily cron scheduler)
│       ├── middlewares/         # authMiddleware.js, rateLimiter.js, errorHandler.js
│       ├── models/              # Payment.model.js, EmailVerification.js
│       ├── routes/              # authRoutes.js, paymentRoutes.js, contactRoutes.js
│       └── services/            # emailService.js, cashfreeService.js
└── Frontend/
    ├── index.html
    └── src/
        ├── App.jsx              # Application router & route guards
        ├── components/          # Payment modals, cards, navigation, and charts
        ├── context/             # AuthContext (Firebase authentication state)
        ├── pages/               # Dashboard, Payments, Spend Insights, Settings, Contact, Auth
        └── services/            # Axios API layer and Cashfree checkout bridge
```

---

## 🔌 API Endpoints & Rate Limiting

All protected endpoints require an `Authorization: Bearer <Firebase_Token>` header. Healthcheck routes remain unthrottled for cloud monitoring.

| Method | Endpoint | Auth | Rate Limit Tier | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/` | Public | Unthrottled | Root API status probe |
| `GET` | `/health` | Public | Unthrottled | Healthcheck probe for Render / uptime monitoring |
| `POST` | `/api/auth/send-registration-otp` | Public | 10 req / 15m (IP) | Generate and dispatch 6-digit registration OTP via Resend |
| `POST` | `/api/auth/verify-registration-otp` | Public | 10 req / 15m (IP) | Validate registration OTP with 5-attempt brute-force protection |
| `POST` | `/api/auth/verify-email-token` | Public | 30 req / 15m (IP) | Verify temporary email proof token |
| `POST` | `/api/auth/confirm-email-verification` | Bearer | 30 req / 15m (IP) | Confirm email verification status on Firebase user record |
| `POST` | `/api/contact` | Public | 5 req / 15m (IP) | Submit validated contact inquiry with linear URL filtering |
| `GET` | `/api/payments` | Bearer | 60 req / 1m (UID) | Retrieve all active payments for authenticated user |
| `GET` | `/api/payments/:id` | Bearer | 60 req / 1m (UID) | Fetch details for a specific payment record |
| `POST` | `/api/payments` | Bearer | 60 req / 1m (UID) | Create a new payment commitment |
| `PUT` | `/api/payments/:id` | Bearer | 60 req / 1m (UID) | Update a payment record (strict field allowlist) |
| `DELETE` | `/api/payments/:id` | Bearer | 60 req / 1m (UID) | Delete a specific payment record |
| `DELETE` | `/api/payments/account` | Bearer | 5 req / 15m (UID) | Cascade-delete user account and all associated payments |
| `POST` | `/api/payments/:id/pay` | Bearer | 15 req / 1m (UID) | Create Cashfree Sandbox order and return session ID |
| `GET` | `/api/payments/:id/verify-payment` | Bearer | 15 req / 1m (UID) | Actively verify payment status with Cashfree API |
| `POST` | `/api/payments/:id/verify-payment` | Bearer | 15 req / 1m (UID) | POST variant for active status reconciliation |
| `POST` | `/api/payments/webhook` | Public | 300 req / 5m (IP) | Cashfree server webhook listener (HMAC-SHA256 verified) |

---

## 💳 Cashfree Sandbox Payment Gateway

Remetra integrates Cashfree Sandbox to simulate real-world digital bill settlements:

1. **Initiate (`POST /api/payments/:id/pay`)**: Generates an order ID (`order_<paymentId>_<timestamp>`), stores it in MongoDB (`cashfreeOrderId` and historical `cashfreeOrders` audit array), and returns a `payment_session_id`.
2. **Checkout Modal**: The frontend invokes `@cashfreepayments/cashfree-js` to render a native popup modal without redirecting users off the page.
3. **Dual Reconciliation**:
   - **Synchronous Path**: Upon modal closure, the client calls `GET /api/payments/:id/verify-payment`. The backend queries Cashfree directly and updates status to `Paid`.
   - **Asynchronous Webhook**: Cashfree dispatches `PAYMENT_SUCCESS_WEBHOOK` to `POST /api/payments/webhook`. The backend verifies the raw body HMAC-SHA256 signature and reconciles payment idempotently.
4. **Security Isolation**: `CASHFREE_SECRET_KEY` remains strictly on the backend. The frontend only receives transient session tokens.

---

## 🛡️ Security Architecture

- **Tiered Rate Limiting**: Built with `express-rate-limit` (v8). Authenticated routes key off `req.user.uid` so separate users behind shared NAT/VPN gateways do not throttle each other. Sensitive endpoints (OTPs, account deletion, contact) use strict time-window budgets.
- **Cashfree Webhook Protection**: Uses a dedicated 300 req / 5 min burst window. **Firebase Auth is intentionally omitted** because requests are machine-to-machine from Cashfree. Authorization relies entirely on cryptographic HMAC-SHA256 signature validation.
- **Render Reverse Proxy (`TRUST_PROXY=1`)**: Express is configured to trust exactly 1 upstream proxy hop. It inspects `X-Forwarded-For` from right to left, preventing attackers from spoofing client IPs to bypass rate limits.
- **Process-Local Storage**: Rate limit counters are tracked in-memory (`MemoryStore`) per Node.js process instance.
- **Defense in Depth**: Revocation-aware token validation (`verifyIdToken(token, true)`), 60-second atomic OTP resend cooldowns, 5-attempt brute-force lockouts, and CRLF log sanitization.

---

## 🚀 Environment Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas database cluster
- Firebase Project with Email/Password Authentication
- Cashfree Merchant Sandbox account
- Resend API key for transactional emails

### 2. Backend Configuration (`Backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/remetra
FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/serviceAccountKey.json
RESEND_API_KEY=re_your_resend_api_key
TRUST_PROXY=1

# Cashfree Sandbox Credentials (Backend-Only)
CASHFREE_APP_ID=your_cashfree_sandbox_app_id
CASHFREE_SECRET_KEY=your_cashfree_sandbox_secret_key
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Configuration (`Frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=remetra.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=remetra
VITE_FIREBASE_STORAGE_BUCKET=remetra.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Running Locally

```bash
# Start Backend API
cd Backend
npm install
npm run dev

# In a separate terminal, start Frontend App
cd Frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
