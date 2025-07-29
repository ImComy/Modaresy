<<<<<<< HEAD
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
=======
import { apiFetch } from './apiService';
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09

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
<<<<<<< HEAD
=======
    } else {
      throw new Error("No token returned from server");
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
    }

    return response;
  },

  // Logout
  async logout() {
    const response = await apiFetch(`/users/logout`, {
      method: "DELETE",
<<<<<<< HEAD
      headers: withAuth(),
=======
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
    });
    localStorage.removeItem("token");
    return response;
  },

  // Send verification code
  async sendVerificationCode(email, type) {
    return apiFetch(`/users/sendVerificationCode`, {
      method: "POST",
<<<<<<< HEAD
      headers: withAuth(),
=======
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
      body: JSON.stringify({ email, type }),
    });
  },

  // Verify account
  async verifyUserAccount(phone_number, code) {
    return apiFetch(`/users/verifyUserAccount`, {
      method: "POST",
<<<<<<< HEAD
      headers: withAuth(),
      body: JSON.stringify({ phone_number, code }),
    });
  },
};

export default authService;
=======
      body: JSON.stringify({ phone_number, code }),
    });
  },

  // Update password
  async updatePassword(currentPassword, newPassword) {
    return apiFetch(`/users/updatePassword`, {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },
};

export default authService;
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
