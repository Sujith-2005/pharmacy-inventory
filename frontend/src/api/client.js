import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://pharmacy-inventory-backend.onrender.com",
  withCredentials: true,
});

// Attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth failure
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response || error);
    return Promise.reject(error);
  }
);
