const BASE_URL = "http://localhost:5053/api";

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Error en la petición: ${response.status}`,
      );
    }
    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    console.error(`API Error en ${endpoint}:`, error.message);
    throw error;
  }
};
