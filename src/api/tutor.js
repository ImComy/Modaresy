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
  async getTutor(tutorID) {
    return apiFetch(`/tutors/loadTutor/${tutorID}`);
  },

  // Fetch subject profile reviews
  async getSubjectProfileReviews(subjectProfileID, page = 1, limit = 10) {
    return apiFetch(`/tutors/loadTutorReviews/${subjectProfileID}?page=${page}&limit=${limit}`);
  },

  // Fetch a single subject profile
  async getSubjectProfile(subjectProfileID) {
    return apiFetch(`/tutors/loadSubjectProfile/${subjectProfileID}`);
  },

  // Fetch all subject profiles for a tutor
  async getSubjectProfiles(tutorID) {
    return apiFetch(`/tutors/loadSubjectProfiles/${tutorID}`);
  },

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
      body: JSON.stringify(reviewData),
    });
  },

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
      body: JSON.stringify({ updated_information: updatedInformation }),
    });
  },
};

export default tutorService;