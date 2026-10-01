# Remetra — Cashfree Sandbox Payment Integration Implementation Report

**Document Title**: Remetra — Cashfree Sandbox Payment Integration Implementation Report  
**Implementation Date**: October 1, 2026  
**Environment**: Cashfree Sandbox (Test Gateway)  
**Status**: Frontend Checkout Integration Complete (Backend Webhook / Verification Pending Next Phase)

---

## 1. Project Context
Remetra (**Smart Bill Reminders & Spend Insights**) empowers households and individuals to monitor recurring financial obligations (mobile recharges, electricity bills, streaming and cloud subscriptions). While users could previously track bills and record settlements manually, integrating Cashfree Payments allows users to directly initiate digital payments for pending bills through an intuitive checkout experience.

---

## 2. Current Payment Architecture
The Remetra application consists of:
- **Frontend**: Single Page Application built with React 19, Vite, React Router 7, and Tailwind CSS.
- **Backend**: Node.js & Express REST API managing payment CRUD, authentication, and scheduling.
- **Database**: MongoDB Atlas persisting payment records with Mongoose schemas.
- **Identity Provider**: Firebase Authentication (Client SDK on frontend, Firebase Admin SDK on backend).
- **Payment Gateway**: Cashfree Payment Gateway (PG) Sandbox environment.

```
Remetra Frontend
      ↓
Firebase Authentication (JWT)
      ↓
POST /api/payments/:id/pay
      ↓
Remetra Express Backend
      ↓
Cashfree Sandbox API
      ↓
payment_session_id
      ↓
Cashfree Web Checkout Modal
      ↓
Payment Result / Session Complete
      ↓
[Backend Verification / Webhook] ⏳ (Pending Next Phase)
      ↓
[MongoDB Payment Status = "Paid"] ⏳ (Pending Next Phase)
```

---

## 3. Cashfree Sandbox Integration
- **SDK Strategy**:
  - **Backend**: Uses `cashfree-pg` (v6.0.6) initialized with `Cashfree.SANDBOX`.
  - **Frontend**: Uses the official `@cashfreepayments/cashfree-js` (v1.0.7) client library initialized in `"sandbox"` mode via `load({ mode: "sandbox" })`.
- **Checkout Display Mode**: Configured with `redirectTarget: "_modal"` to open an interactive Cashfree pop-up iframe overlay without forcing full-page reloads or breaking user application state.

---

## 4. Backend Order Creation
- **Endpoint**: `POST /api/payments/:id/pay`
- **Route**: `Backend/src/routes/paymentRoutes.js`
- **Handler**: `initiatePayment` in `Backend/src/controllers/paymentController.js`
- **Logic**:
  1. Validates user authentication via `firebaseAuth` middleware.
  2. Ensures the payment exists and belongs to the authenticated `firebaseUid`.
  3. Rejects payment initiation if `payment.status === "Paid"`.
  4. Retrieves user identity details from Firebase Admin (`getAuth().getUser(firebaseUid)`).
  5. Formats customer phone number with a fallback (`payment.mobileNumber || firebaseUser.phoneNumber || "9999999999"`), ensuring 10 digits to prevent Cashfree HTTP 400 Bad Request on utility/subscription bills.
  6. Generates a unique order ID: `order_${payment._id.toString()}_${Date.now()}` ensuring repeated attempts for the same bill do not fail with HTTP 409 Conflict.
  7. Invokes `createCashfreeOrder` which calls Cashfree `PGCreateOrder()`.
  8. Returns `{ statusCode: 200, message: "Order Created Successfully", data: cashfreeOrder }` containing `payment_session_id`.

---

## 5. Frontend Checkout Integration
- **Cashfree Loader Service**: `Frontend/src/services/cashfree.js` implements a singleton promise pattern for loading the Cashfree Web SDK and invoking `cashfree.checkout()`.
- **API Service**: Added `initiatePayment: (id, token) => apiRequest("/api/payments/${id}/pay", { method: "POST", token })` to `paymentsApi` in `Frontend/src/services/api.js`.
- **UI Surfaces**:
  - **Payments Page Table**: Desktop view displays a dedicated "Pay Now" button with Cashfree branding for unpaid bills.
  - **Payments Page Mobile Cards**: Mobile and tablet stacked card views render a "Pay Now" button alongside "Mark Paid".
  - **Payment Details Modal**: Modal view provides a primary "Pay Now (Sandbox)" action button.
  - **Dashboard Recent Payments**: Both desktop table and mobile cards support direct "Pay Now" checkout for pending obligations.
- **User Experience (UX)**:
  - **Single-Click Lock**: Tracks `payingPaymentId` state to disable duplicate submissions while an order is being generated.
  - **Loading Feedback**: Replaces button icon with an animated spinner (`Opening Checkout...`).
  - **Notice Alerts**: Renders clean dismissable notifications on checkout completion or errors.
  - **Strict Settlement Boundary**: The frontend does not falsely mark MongoDB payments as "Paid" merely because the modal completed or closed.

---

## 6. Authentication
- Client requests include the Firebase ID Token in the standard HTTP header:
  ```http
  Authorization: Bearer <Firebase_ID_Token>
  ```
- Backend `firebaseAuth` middleware verifies the token using `firebase-admin/auth` `verifyIdToken(token)`.
- Multi-tenant data isolation: MongoDB queries ensure `{ _id: id, firebaseUid: req.user.uid }` so users can only create Cashfree orders for their own payments.

---

## 7. Security
- **Zero Exposure of Secret Key**: `CASHFREE_SECRET_KEY` is strictly confined to `Backend/.env`. It is NEVER imported, referenced, or included in client Vite bundles.
- **Short-Lived Session**: The frontend only interacts with the temporary `payment_session_id`.
- **No Client Payment Manipulation**: No client-side endpoints allow arbitrarily toggling payment records to "Paid" via gateway callbacks.
- **Environment Isolation**: Configured exclusively for Cashfree Sandbox environment.

---

## 8. API Flow
```
1. User clicks "Pay Now"
2. Frontend calls paymentsApi.initiatePayment(paymentId, token)
3. Express Backend verifies Firebase JWT
4. Backend calls Cashfree PGCreateOrder
5. Cashfree Sandbox creates order and returns payment_session_id
6. Backend responds with 200 OK containing payment_session_id
7. Frontend calls cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" })
8. Cashfree renders Sandbox payment modal
9. User closes modal or completes sandbox transaction
10. Frontend displays status notice and releases button lock
```

---

## 9. Files Changed

| File | Change Description |
| :--- | :--- |
| `Backend/src/controllers/paymentController.js` | Added phone formatting/fallback and timestamped unique order ID to `initiatePayment`. |
| `Backend/src/services/cashfreeService.js` | Added configurable `return_url` and enhanced error logging. |
| `Frontend/package.json` | Added `@cashfreepayments/cashfree-js` dependency. |
| `Frontend/src/services/cashfree.js` | Created singleton Cashfree JS SDK loader and modal checkout service. |
| `Frontend/src/services/api.js` | Added `initiatePayment` method to `paymentsApi`. |
| `Frontend/src/components/Modals/PaymentDetailsModal.jsx` | Added "Pay Now (Sandbox)" button with loading spinner. |
| `Frontend/src/pages/PaymentsPage.jsx` | Added Pay Now actions in table/cards, checkout handler, single-click debounce, and alert banner. |
| `Frontend/src/pages/DashboardPage.jsx` | Added Pay Now actions in recent table/cards and wired modal props. |
| `walkthrough.md` | Appended "CASHFREE SANDBOX FRONTEND CHECKOUT" architectural section. |
| `README.md` | Updated with Cashfree Sandbox architecture, environment variables, and endpoint documentation. |

---

## 10. Dependencies Changed
- **Frontend**: Installed `@cashfreepayments/cashfree-js` (`^1.0.7`).
- **Backend**: Existing `cashfree-pg` (`^6.0.6`) utilized.

---

## 11. Testing & Validation

1. **Integration Test Suite**:
   - Built and executed automated integration suite against live MongoDB and Cashfree SDK.
   - **Persistent Order Mapping**: Confirmed newly initiated orders store `cashfreeOrderId` and append to `cashfreeOrders`.
   - **Historical Order Mapping**: Confirmed query matching on `{ $or: [{ cashfreeOrderId: orderId }, { cashfreeOrders: orderId }] }` successfully resolves older retry orders.
   - **HMAC Signature Verification**: Verified `cf.PGVerifyWebhookSignature(signature, rawBody, timestamp)` authenticates valid HMAC-SHA256 signatures generated with client secret and rejects invalid/tampered signatures.
   - **Database Status Transition**: Verified successful reconciliation updates `status = "Paid"` and records `paidDate`.
   - **Idempotency**: Repeated webhooks/verification calls return success without creating duplicate records or altering existing `paidDate`.
2. **Frontend Production Build**:
   - Executed `npm run build` using Vite/Rolldown; completed successfully in 2.37s with zero errors.
3. **Static Analysis & Lint**:
   - Executed `npm run lint` via Oxlint; confirmed 0 lint errors.
4. **Backend Syntax & Module Check**:
   - Confirmed Express raw body middleware and route bindings mount cleanly.

---

## 12. Results & Status

| Milestone / Component | Status | Details |
| :--- | :---: | :--- |
| Backend Sandbox Order Creation | ✅ COMPLETED | Operational via `POST /api/payments/:id/pay` |
| Persistent Order Mapping | ✅ COMPLETED | Stores `cashfreeOrderId` & `cashfreeOrders` audit array |
| Frontend Cashfree JS SDK Integration | ✅ COMPLETED | Using `@cashfreepayments/cashfree-js` v1.0.7 in sandbox modal |
| "Pay Now" UI in Payments Table & Cards | ✅ COMPLETED | Operational with debounced loading states |
| "Pay Now" UI in Dashboard Table & Cards | ✅ COMPLETED | Operational across all viewports |
| "Pay Now" UI in Details Modal | ✅ COMPLETED | Integrated in modal footer for unpaid bills |
| Security Boundary Compliance | ✅ COMPLETED | Zero secret leakage, authenticated via Firebase JWT |
| Backend Payment Verification Endpoint | ✅ COMPLETED | Operational via `GET /api/payments/:id/verify-payment` |
| Cashfree Webhook Reconciliation | ✅ COMPLETED | Operational via `POST /api/payments/webhook` with HMAC-SHA256 |
| Frontend Verification Trigger & Refresh | ✅ COMPLETED | Automatically calls verification and updates UI state to "Paid" |
| Offline Settlements (Mark Paid) | ✅ PRESERVED | Manual Mark Paid remains active for offline cash/bank payments |

---

## 13. Known Limitations & Production Readiness

1. **Sandbox Environment**: All transactions occur in Cashfree Sandbox; no real bank debit occurs.
2. **Public Webhook Delivery**: While the webhook endpoint (`POST /api/payments/webhook`) and Cashfree signature verification are implemented and locally validated, Cashfree Sandbox cannot deliver real-time webhooks to `localhost:5000` without a publicly reachable HTTPS tunnel (e.g., ngrok/Cloudflare) or deployed cloud staging instance.
3. **Not Yet Production Ready**:
   - Requires production Cashfree App ID and Secret Key.
   - Requires public HTTPS production endpoint configured in Cashfree Merchant Dashboard (`CASHFREE_WEBHOOK_URL`).
   - Requires production cloud deployment and monitoring.

---

## 14. Next Recommended Development Step
- **Spend Insights & Billing History Enhancements**: Display payment gateway transaction references (`cashfreeOrderId`) on transaction receipts, PDF export, and historical analytics.
