const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const defaultHeaders = {
  "Content-Type": "application/json",
};

// Utility function to handle fetch requests
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include", // Include cookies for backend's cookie-based auth
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || "Request failed");
    }
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Utility to add auth token (for routes requiring verifyToken)
function withAuth(headers = {}) {
  const token = localStorage.getItem("token"); // Adjust based on your token storage
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

// Authentication-related API calls
export const authService = {
  // Login user and store token
  async login(email, password) {
    const response = await apiFetch(`/users/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      credentials: "include", // Send cookies for backend to set token
    });
    // Assuming backend returns { token } on successful login
    if (response.token) {
      localStorage.setItem("token", response.token); // Store token
    }
    return response;
  },

  // Logout user
  async logout() {
    const response = await apiFetch(`/users/logout`, {
      method: "POST",
      credentials: "include", // Clear cookie-based token
    });
    localStorage.removeItem("token"); // Clear stored token
    return response;
  },

  // Send verification code
  async sendVerificationCode(email, type) {
    return apiFetch(`/users/sendVerificationCode`, {
      method: "POST",
      body: JSON.stringify({ email, type }),
    });
  },

  // Verify user account
  async verifyUserAccount(phone_number, code) {
    return apiFetch(`/users/verifyUserAccount`, {
      method: "POST",
      body: JSON.stringify({ phone_number, code }),
    });
  },

  // Get user profile (requires authentication)
  async getProfile() {
    return apiFetch(`/users/getProfile`, {
      headers: withAuth(),
    });
  },
};

export default authService;