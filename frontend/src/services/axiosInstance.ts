import axios, { AxiosError } from "axios";
import { showErrorToast } from "@/utils/toast";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalReq = error.config;

    // Handle 401 Unauthorized
    if (
      error.response?.status === 401 &&
      !originalReq._retry &&
      !originalReq.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalReq);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalReq._retry = true;
      isRefreshing = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalReq);
      } catch (err) {
        processQueue(err as AxiosError);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Process original error message
    if (error.response?.data?.message) {
      const msg = error.response.data.message;
      error.message = Array.isArray(msg) ? msg.join(", ") : msg;
    }

    // Standardize throttle/unauthorized toasts to avoid spamming
    if (error.response?.status === 429) {
      showErrorToast(error.message, "throttle-error");
    } else if (error.response?.status === 401) {
      showErrorToast(error.message, "auth-error");
    }

    return Promise.reject(error);
  }
);
