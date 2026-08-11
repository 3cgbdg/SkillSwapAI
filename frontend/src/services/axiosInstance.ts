import axios, { AxiosError } from "axios";
import { showErrorToast } from "@/utils/toast";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
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

    // #region agent log
    if (typeof window !== "undefined") {
      fetch(
        "http://127.0.0.1:7877/ingest/c055a23c-4c84-4eb5-84c0-8abae4e46ddd",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "ee6149",
          },
          body: JSON.stringify({
            sessionId: "ee6149",
            hypothesisId: "H2",
            location: "axiosInstance.ts:interceptor",
            message: "API error",
            data: {
              status: error.response?.status,
              url: originalReq?.url,
              message: error.message,
            },
            timestamp: Date.now(),
          }),
        }
      ).catch(() => {});
    }
    // #endregion

    // Standardize throttle/unauthorized toasts to avoid spamming
    const isAuthPage =
      typeof window !== "undefined" &&
      (window.location.pathname === "/auth/login" ||
        window.location.pathname === "/auth/signup");

    if (error.response?.status === 429) {
      showErrorToast(error.message, "throttle-error");
    } else if (error.response?.status === 401 && !isAuthPage) {
      showErrorToast(error.message, "auth-error");
    }

    return Promise.reject(error);
  }
);
