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

  async addToWishlist(tutorId) {
    return apiFetch(`/students/addWishlist`, {
      method: "POST",
      body: JSON.stringify({ tutorId }),
    });
  },

  async removeFromWishlist(tutorId) {
    return apiFetch(`/students/removeWishlist`, {
      method: "DELETE",
      body: JSON.stringify({ tutorId }),
    });
  },

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
};
