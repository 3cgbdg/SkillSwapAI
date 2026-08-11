"use client";

import { useEffect } from "react";

import { api } from "@/services/axiosInstance";

/** Keeps the httpOnly session fresh on authenticated routes. */
export default function AuthClientUpload() {
  useEffect(() => {
    void api.post("/auth/refresh").catch(() => {});
  }, []);

  return null;
}
