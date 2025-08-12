import { apiFetch } from './apiService';

export const tutorService = {
  async getTutors({
    pages = 1, limit = 10, Grade, Sector, Language, Governate, District,
    MinimumRating, MinMonthlyRange, MaxMonthlyRange
  }) {
    return apiFetch(`/tutors/loadTutors/${pages}/${limit}/${Grade || 0}/${Sector || 0}/${Language || 0}/${Governate || 0}/${District || 0}/${MinimumRating || 0}/${MinMonthlyRange || 0}/${MaxMonthlyRange || 0}`);
  },

  async getTutor(tutorID) {
    return apiFetch(`/tutors/loadTutor/${tutorID}`);
  },

  async getSubjectProfileReviews(subjectProfileID, page = 1, limit = 10) {
    return apiFetch(`/tutors/loadTutorReviews/${subjectProfileID}?page=${page}&limit=${limit}`);
  },

  async getSubjectProfile(subjectProfileID) {
    return apiFetch(`/tutors/loadSubjectProfile/${subjectProfileID}`);
  },

  async getSubjectProfiles(tutorID) {
    return apiFetch(`/tutors/loadSubjectProfiles/${tutorID}`);
  },

  async getDashboard() {
    return apiFetch(`/tutors/loadDashboard`);
  },

  async reviewTutor(reviewData) {
    return apiFetch(`/tutors/reviewTutor`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  async getProfile() {
    return apiFetch(`/tutors/getProfile`);
  },

  async updateProfile(updatedInformation) {
    return apiFetch(`/tutors/updateProfile`, {  // Note: starts with /tutors
      method: "PUT",
      body: JSON.stringify({ updated_information: updatedInformation }),
    });
  }
};
