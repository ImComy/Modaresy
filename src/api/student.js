<<<<<<< HEAD
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

// Utility to add auth token (required for all student routes)
function withAuth(headers = {}) {
  const token = localStorage.getItem("token"); // Adjust based on your token storage
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

// Student-related API calls
export const studentService = {
  // Contact a tutor
  async contactTutor(tutorId) {
    return apiFetch(`/students/contactTutor`, {
      method: "POST",
      headers: withAuth(),
=======
import { apiFetch } from './apiService';

export const studentService = {
  async contactTutor(tutorId) {
    return apiFetch(`/students/contactTutor`, {
      method: "POST",
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
      body: JSON.stringify({ tutorId }),
    });
  },

<<<<<<< HEAD
  // Request enrollment with a tutor
  async requestEnrollment(tutorId) {
    return apiFetch(`/students/requestEnrollment`, {
      method: "POST",
      headers: withAuth(),
=======
  async requestEnrollment(tutorId) {
    return apiFetch(`/students/requestEnrollment`, {
      method: "POST",
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
      body: JSON.stringify({ tutorId }),
    });
  },

<<<<<<< HEAD
  // Add tutor to wishlist
  async addToWishlist(tutorId) {
    return apiFetch(`/students/addWishlist`, {
      method: "POST",
      headers: withAuth(),
=======
  async addToWishlist(tutorId) {
    return apiFetch(`/students/addWishlist`, {
      method: "POST",
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
      body: JSON.stringify({ tutorId }),
    });
  },

<<<<<<< HEAD
  // Remove tutor from wishlist
  async removeFromWishlist(tutorId) {
    return apiFetch(`/students/removeWishlist`, {
      method: "DELETE",
      headers: withAuth(),
=======
  async removeFromWishlist(tutorId) {
    return apiFetch(`/students/removeWishlist`, {
      method: "DELETE",
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
      body: JSON.stringify({ tutorId }),
    });
  },

<<<<<<< HEAD
  // Get student profile
  async getProfile() {
    return apiFetch(`/students/getProfile`, {
      headers: withAuth(),
    });
  },

  // Update student profile
  async updateProfile(updatedInformation) {
    return apiFetch(`/students/updateProfile`, {
      method: "PUT",
      headers: withAuth(),
      body: JSON.stringify({ updated_information: updatedInformation }),
    });
  },
};

export default studentService;
=======
  async getProfile() {
    const data = await apiFetch(`/students/getProfile`);
    const { userdata } = data;
    if (!userdata) {
      throw new Error("User data missing from server response");
    }
    return userdata;
  },

  async updateProfile(updatedInformation) {
    return apiFetch(`/students/updateProfile`, {
      method: "PUT",
      body: JSON.stringify({ updated_information: updatedInformation }),
    });
  },

  async getPlatformStats() {
    return apiFetch(`/users/stats`);
  },
};
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
