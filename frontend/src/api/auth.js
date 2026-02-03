import { apiClient } from "./client";

export const authApi = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await apiClient.post(
      "/auth/login",
      formData,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },

  register: async (userData) => {
    const res = await apiClient.post("/auth/register", userData);
    return res.data;
  },
};
