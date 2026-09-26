const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// In-memory demo vault storage for testing before Firebase Web credentials are plugged in
let localDemoStore = [
  {
    _id: "demo-1",
    personName: "Subhojit",
    title: "Airtel Postpaid Family Plan",
    category: "Recharge",
    provider: "Airtel",
    amount: 2450,
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    frequency: "Monthly",
    status: "Overdue",
    notes: "Primary household SIMs & fiber pack",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    _id: "demo-2",
    personName: "Family",
    title: "Main Residence Power Grid",
    category: "Electricity",
    provider: "Tata Power",
    amount: 2450,
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    frequency: "Monthly",
    status: "Due",
    notes: "Home apartment meter readings",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    _id: "demo-3",
    personName: "Mom",
    title: "Mobile Recharge",
    category: "Recharge",
    provider: "Jio",
    amount: 299,
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    frequency: "Monthly",
    status: "Upcoming",
    notes: "Unlimited 5G pack",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    _id: "demo-4",
    personName: "Subhojit",
    title: "Netflix Premium 4K",
    category: "Subscription",
    provider: "Netflix",
    amount: 649,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    frequency: "Monthly",
    status: "Upcoming",
    notes: "Family screen sharing plan",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    _id: "demo-5",
    personName: "Subhojit",
    title: "Cloud Storage",
    category: "Subscription",
    provider: "Google One",
    amount: 130,
    dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    paidDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    frequency: "Monthly",
    status: "Paid",
    notes: "100GB Google Drive & Photos storage",
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    _id: "demo-6",
    personName: "Family",
    title: "CESC Flat Power Bill",
    category: "Electricity",
    provider: "CESC Limited",
    amount: 1420,
    dueDate: new Date(Date.now() - 12 * 86400000).toISOString(),
    paidDate: new Date(Date.now() - 12 * 86400000).toISOString(),
    frequency: "Monthly",
    status: "Paid",
    notes: "Kolkata flat meter billing",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

/**
 * Custom API Client helper for Remetra Backend
 */
export async function apiRequest(endpoint, { method = "GET", body = null, token = null } = {}) {
  // If demo token, handle in local store to allow full frontend testing without real Firebase tokens
  if (token === "demo-firebase-id-token") {
    return handleDemoRequest(endpoint, method, body);
  }

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
      // If unauthorized due to placeholder credentials, fallback to demo store so UI never breaks
      if (response.status === 401 && (!token || token.includes("placeholder") || token === "demo-firebase-id-token")) {
        console.warn("Backend rejected token. Falling back to in-memory store.");
        return handleDemoRequest(endpoint, method, body);
      }

      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If backend server is not running on localhost:8000, fallback to demo store
    if (error.message.includes("Failed to fetch") || error.status === 401) {
      console.warn("Backend unavailable or unauthorized. Operating in client vault mode.");
      return handleDemoRequest(endpoint, method, body);
    }
    console.error(`API Error on ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

function handleDemoRequest(endpoint, method, body) {
  // GET /api/payments
  if (endpoint === "/api/payments" && method === "GET") {
    return {
      statusCode: 200,
      message: "UserData Fetched Successfully!",
      data: [...localDemoStore],
      success: true,
    };
  }

  // POST /api/payments
  if (endpoint === "/api/payments" && method === "POST") {
    const newDoc = {
      _id: "demo-" + Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localDemoStore = [newDoc, ...localDemoStore];
    return {
      statusCode: 201,
      message: "Payment Created Successfully",
      data: newDoc,
      success: true,
    };
  }

  // PUT /api/payments/:id
  if (endpoint.startsWith("/api/payments/") && method === "PUT") {
    const id = endpoint.split("/").pop();
    const index = localDemoStore.findIndex((p) => p._id === id);
    if (index !== -1) {
      localDemoStore[index] = {
        ...localDemoStore[index],
        ...body,
        updatedAt: new Date().toISOString(),
      };
      return {
        statusCode: 200,
        message: "Update Successful",
        data: localDemoStore[index],
        success: true,
      };
    }
    return {
      statusCode: 404,
      message: "Payment Not Found",
      success: false,
    };
  }

  // DELETE /api/payments/:id
  if (endpoint.startsWith("/api/payments/") && method === "DELETE") {
    const id = endpoint.split("/").pop();
    const deleted = localDemoStore.find((p) => p._id === id);
    localDemoStore = localDemoStore.filter((p) => p._id !== id);
    return {
      statusCode: 200,
      message: "Deleted Successfully",
      data: deleted,
      success: true,
    };
  }

  return {
    statusCode: 200,
    message: "Success",
    data: localDemoStore,
    success: true,
  };
}

// Payment Endpoints
export const paymentsApi = {
  getAll: (token) => apiRequest("/api/payments", { method: "GET", token }),
  getById: (id, token) => apiRequest(`/api/payments/${id}`, { method: "GET", token }),
  create: (paymentData, token) => apiRequest("/api/payments", { method: "POST", body: paymentData, token }),
  update: (id, updatedFields, token) => apiRequest(`/api/payments/${id}`, { method: "PUT", body: updatedFields, token }),
  delete: (id, token) => apiRequest(`/api/payments/${id}`, { method: "DELETE", token }),
  markAsPaid: (id, token) => {
    const today = new Date().toISOString();
    return apiRequest(`/api/payments/${id}`, {
      method: "PUT",
      body: { status: "Paid", paidDate: today },
      token,
    });
  },
};
