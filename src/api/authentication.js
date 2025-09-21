import { apiFetch } from './apiService';

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
    } else {
      throw new Error("No token returned from server");
    }

    return response;
  },

  // Logout
  async logout() {
    const response = await apiFetch(`/users/logout`, {
      method: "DELETE",
    });
    localStorage.removeItem("token");
    return response;
  },

  // Send verification code
  async sendVerificationCode(email, type) {
    return apiFetch(`/users/sendVerificationCode`, {
      method: "POST",
      body: JSON.stringify({ email, type }),
    });
  },

  // Verify account
  async verifyUserAccount(phone_number, code) {
    return apiFetch(`/users/verifyUserAccount`, {
      method: "POST",
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

  async handleDeleteAccount() {
    // Return apiFetch promise; caller is responsible for logout/navigation/toasts
    return apiFetch('/users/deleteAccount', { method: 'DELETE' });
  },
};

export default authService;