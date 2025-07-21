const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const defaultHeaders = {
  "Content-Type": "application/json",
};

async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include", // send cookies
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || "Request failed");
    }
    return data;
  } catch (error) {
    console.error(`API error on ${endpoint}:`, error);
    throw error;
  }
}

// Attach bearer token to headers if available
function withAuth(headers = {}) {
  const token = localStorage.getItem("token");
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

export const authService = {
  // Signup (create account)
  async signup(userData) {
    return apiFetch(`/users/createAccount`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Login
  async login(email, password) {
    const response = await apiFetch(`/users/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      localStorage.setItem("token", response.token);
    }

    return response;
  },

  // Logout
  async logout() {
    const response = await apiFetch(`/users/logout`, {
      method: "DELETE",
      headers: withAuth(),
    });
    localStorage.removeItem("token");
    return response;
  },

  // Send verification code
  async sendVerificationCode(email, type) {
    return apiFetch(`/users/sendVerificationCode`, {
      method: "POST",
      headers: withAuth(),
      body: JSON.stringify({ email, type }),
    });
  },

  // Verify account
  async verifyUserAccount(phone_number, code) {
    return apiFetch(`/users/verifyUserAccount`, {
      method: "POST",
      headers: withAuth(),
      body: JSON.stringify({ phone_number, code }),
    });
  },
};

export default authService;
