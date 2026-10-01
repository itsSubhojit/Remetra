let rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").trim().replace(/\/+$/, "");
if (rawBaseUrl.endsWith("/api")) {
  rawBaseUrl = rawBaseUrl.slice(0, -4);
}
const BASE_URL = rawBaseUrl;

/**
 * Production API Client for Remetra Backend
 * Communicates directly with the Express API using Firebase JWT tokens.
 */
export async function apiRequest(endpoint, { method = "GET", body = null, token = null } = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const connError = new Error("Unable to connect to Remetra backend server. Please verify your connection.");
      connError.status = 0;
      throw connError;
    }
    throw error;
  }
}

// Real Payment Endpoints matching Backend routes in paymentRoutes.js
export const paymentsApi = {
  getAll: (token) => apiRequest("/api/payments", { method: "GET", token }),
  getById: (id, token) => apiRequest(`/api/payments/${id}`, { method: "GET", token }),
  create: (paymentData, token) => apiRequest("/api/payments", { method: "POST", body: paymentData, token }),
  update: (id, updatedFields, token) => apiRequest(`/api/payments/${id}`, { method: "PUT", body: updatedFields, token }),
  delete: (id, token) => apiRequest(`/api/payments/${id}`, { method: "DELETE", token }),
  deleteAccount: (token) => apiRequest("/api/payments/account", { method: "DELETE", token }),
  initiatePayment: (id, token) => apiRequest(`/api/payments/${id}/pay`, { method: "POST", token }),
  verifyPayment: (id, token) => apiRequest(`/api/payments/${id}/verify-payment`, { method: "GET", token }),
  markAsPaid: (id, token) => {
    return apiRequest(`/api/payments/${id}`, {
      method: "PUT",
      body: {
        status: "Paid",
        paidDate: new Date().toISOString(),
      },
      token,
    });
  },
  submitContactInquiry: (contactData) => apiRequest("/api/contact", { method: "POST", body: contactData }),
  sendRegistrationOtp: (email) => apiRequest("/api/auth/send-registration-otp", { method: "POST", body: { email } }),
  verifyRegistrationOtp: (email, otp) => apiRequest("/api/auth/verify-registration-otp", { method: "POST", body: { email, otp } }),
  verifyEmailToken: (email, verificationToken) => apiRequest("/api/auth/verify-email-token", { method: "POST", body: { email, verificationToken } }),
};

export const contactApi = {
  submit: (contactData) => apiRequest("/api/contact", { method: "POST", body: contactData }),
};

export const authApi = {
  sendRegistrationOtp: (email) => apiRequest("/api/auth/send-registration-otp", { method: "POST", body: { email } }),
  verifyRegistrationOtp: (email, otp) => apiRequest("/api/auth/verify-registration-otp", { method: "POST", body: { email, otp } }),
  verifyEmailToken: (email, verificationToken) => apiRequest("/api/auth/verify-email-token", { method: "POST", body: { email, verificationToken } }),
};
