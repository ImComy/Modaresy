import validator from 'validator';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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
      credentials: "include", // Include cookies for auth
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

// Utility to add auth token
function withAuth(headers = {}) {
  const token = localStorage.getItem("token");
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

// Validation-related API calls
export const validationService = {
  // Fetch valid districts for a governorate (hypothetical endpoint)
  async getDistricts(governate) {
    return apiFetch(`/constants/districts?governate=${governate}`);
  },

  // Fetch education structure for an education system (hypothetical endpoint)
  async getEducationStructure(educationSystem) {
    return apiFetch(`/constants/educationStructure?educationSystem=${educationSystem}`);
  },

  // Calculate subject profile rating (hypothetical endpoint)
  async calculateSubjectProfileRating(subjectProfileID) {
    return apiFetch(`/tutors/calculateRating/${subjectProfileID}`, {
      headers: withAuth(),
    });
  },

  // Client-side validation for phone numbers
  validatePhoneNumber(num) {
    return validator.isMobilePhone(num, 'ar-EG');
  },

  // Client-side validation for emails
  validateEmail(email) {
    return validator.isEmail(email);
  },
};

export default validationService;