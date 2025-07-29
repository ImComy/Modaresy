<<<<<<< HEAD
// apiService.js
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

// Utility to add auth token if available
function withAuth(headers = {}) {
  const token = localStorage.getItem("token"); // Adjust based on how you store tokens
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

// Tutor-related API calls
export const tutorService = {
  // Fetch tutors with filters
  async getTutors({
    pages = 1,
    limit = 10,
    Grade,
    Sector,
    Language,
    Governate,
    District,
    MinimumRating,
    MinMonthlyRange,
    MaxMonthlyRange,
  }) {
    const query = new URLSearchParams({
      pages,
      limit,
      ...(Grade && { Grade }),
      ...(Sector && { Sector }),
      ...(Language && { Language }),
      ...(Governate && { Governate }),
      ...(District && { District }),
      ...(MinimumRating && { MinimumRating }),
      ...(MinMonthlyRange && { MinMonthlyRange }),
      ...(MaxMonthlyRange && { MaxMonthlyRange }),
    }).toString();
    return apiFetch(`/tutors/loadTutors/${pages}/${limit}/${Grade || 0}/${Sector || 0}/${Language || 0}/${Governate || 0}/${District || 0}/${MinimumRating || 0}/${MinMonthlyRange || 0}/${MaxMonthlyRange || 0}`);
  },

  // Fetch a single tutor by ID
=======
import { apiFetch } from './apiService';

export const tutorService = {
  async getTutors({
    pages = 1, limit = 10, Grade, Sector, Language, Governate, District,
    MinimumRating, MinMonthlyRange, MaxMonthlyRange
  }) {
    return apiFetch(`/tutors/loadTutors/${pages}/${limit}/${Grade || 0}/${Sector || 0}/${Language || 0}/${Governate || 0}/${District || 0}/${MinimumRating || 0}/${MinMonthlyRange || 0}/${MaxMonthlyRange || 0}`);
  },

>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
  async getTutor(tutorID) {
    return apiFetch(`/tutors/loadTutor/${tutorID}`);
  },

<<<<<<< HEAD
  // Fetch subject profile reviews
=======
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
  async getSubjectProfileReviews(subjectProfileID, page = 1, limit = 10) {
    return apiFetch(`/tutors/loadTutorReviews/${subjectProfileID}?page=${page}&limit=${limit}`);
  },

<<<<<<< HEAD
  // Fetch a single subject profile
=======
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
  async getSubjectProfile(subjectProfileID) {
    return apiFetch(`/tutors/loadSubjectProfile/${subjectProfileID}`);
  },

<<<<<<< HEAD
  // Fetch all subject profiles for a tutor
=======
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
  async getSubjectProfiles(tutorID) {
    return apiFetch(`/tutors/loadSubjectProfiles/${tutorID}`);
  },

<<<<<<< HEAD
  // Fetch teacher dashboard (requires authentication)
  async getDashboard() {
    return apiFetch(`/tutors/loadDashboard`, {
      headers: withAuth(),
    });
  },

  // Review a tutor (requires authentication)
  async reviewTutor(reviewData) {
    return apiFetch(`/tutors/reviewTutor`, {
      method: "POST",
      headers: withAuth(),
=======
  async getDashboard() {
    return apiFetch(`/tutors/loadDashboard`);
  },

  async reviewTutor(reviewData) {
    return apiFetch(`/tutors/reviewTutor`, {
      method: "POST",
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
      body: JSON.stringify(reviewData),
    });
  },

<<<<<<< HEAD
  // Get teacher profile (requires authentication)
  async getProfile() {
    return apiFetch(`/tutors/getProfile`, {
      headers: withAuth(),
    });
  },

  // Update teacher profile (requires authentication)
  async updateProfile(updatedInformation) {
    return apiFetch(`/tutors/updateProfile`, {
      method: "PUT",
      headers: withAuth(),
=======
  async getProfile() {
    return apiFetch(`/tutors/getProfile`);
  },

  async updateProfile(updatedInformation) {
    return apiFetch(`/tutors/updateProfile`, {
      method: "PUT",
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
      body: JSON.stringify({ updated_information: updatedInformation }),
    });
  },
};
<<<<<<< HEAD

export default tutorService;
=======
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09
