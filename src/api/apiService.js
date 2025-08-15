export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function apiFetch(endpoint, options = {}) {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    // Debug logs
    console.log('Making request to:', `${API_BASE}${endpoint}`);
    console.log('Request options:', { ...options, headers });

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // If not OK, try to parse error JSON or fallback
    if (!response.ok) {
      const errorData = await response.text().then(t => t ? JSON.parse(t) : {});
      console.error('API Error Response:', errorData);
      throw new Error(errorData.error || 'Request failed');
    }

    // Avoid parsing JSON if there's no content
    if (response.status === 204) {
      return null;
    }

    // Parse JSON only if there is a body
    const text = await response.text();
    return text ? JSON.parse(text) : null;

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
