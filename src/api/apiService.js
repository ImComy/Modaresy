export const API_BASE = "modaresy-production-25d5.up.railway.app";

export async function apiFetch(endpoint, options = {}) {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const rawText = await response.text();

    if (!response.ok) {
      let parsed;
      try {
        parsed = rawText ? JSON.parse(rawText) : {};
      } catch {
        parsed = rawText || { message: rawText };
      }
      const err = new Error(
        parsed?.error || parsed?.message || String(parsed) || "Request failed"
      );
      err.status = response.status;
      err.body = parsed;
      throw err;
    }

    if (response.status === 204 || !rawText) return null;

    try {
      return JSON.parse(rawText);
    } catch {
      return rawText;
    }
  } catch (error) {
    throw error;
  }
}