import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalReq = error.config;
    if (
      error.response?.status === 401 &&
      !originalReq._retry &&
      !originalReq.url.includes("/auth/refresh")
    ) {
      originalReq._retry = true;
      try {
        // Wait a bit before retrying to ensure backend is ready
        await new Promise((resolve) => setTimeout(resolve, 300));
        await api.post("/auth/refresh");
        return api(originalReq);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
