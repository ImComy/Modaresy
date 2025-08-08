import { apiFetch } from './apiService';

export const studentService = {
  async contactTutor(tutorId) {
    return apiFetch(`/students/contactTutor`, {
      method: "POST",
      body: JSON.stringify({ tutorId }),
    });
  },

  async requestEnrollment(tutorId) {
    return apiFetch(`/students/requestEnrollment`, {
      method: "POST",
      body: JSON.stringify({ tutorId }),
    });
  },

  async getWishlist() {
    try {
      const response = await apiFetch('/students/wishlist');
      return response?.tutorIds || []; // Ensure we always return an array
    } catch (error) {
      console.error('Failed to get wishlist:', error);
      return []; // Return empty array on error
    }
  },

  async addToWishlist(tutorId) {
    return apiFetch('/students/addToWishlist', {
      method: 'POST',
      body: JSON.stringify({ tutorId: String(tutorId) }),
    });
  },

  async removeFromWishlist(tutorId) {
    return apiFetch('/students/removeFromWishlist', {
      method: 'DELETE',
      body: JSON.stringify({ tutorId: String(tutorId) }),
    });
  },
  
  async getProfile() {
    console.log('Calling getProfile API...');
    const data = await apiFetch(`/students/getProfile`);
    console.log('Response from getProfile API:', data);

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

