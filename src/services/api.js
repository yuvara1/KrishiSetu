import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLogout = error.config?.url?.includes("/auth/logout");
    const isAuthEndpoint = error.config?.url?.includes("/auth/");

    if (error.response?.status === 401 && !isLogout && !isAuthEndpoint) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (!isLogout) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    }

    return Promise.reject(error);
  },
);
export default api;
