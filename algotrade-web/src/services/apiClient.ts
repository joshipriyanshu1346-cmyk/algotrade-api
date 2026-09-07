import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "./tokenStore";

const API_URL = import.meta.env.VITE_API_URL ?? "https://algotrade-api-bvbz.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post(
    `${API_URL}/api/auth/refresh`,
    {},
    { withCredentials: true }
  );
  const newToken = data.data.accessToken as string;
  tokenStore.set(newToken);
  return newToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      const isAuthEndpoint =
        original.url?.includes("/api/auth/login") ||
        original.url?.includes("/api/auth/register") ||
        original.url?.includes("/api/auth/google") ||
        original.url?.includes("/api/auth/refresh");

      if (isAuthEndpoint) {
        throw error;
      }

      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        tokenStore.set(null);
        throw error;
      }
    }

    throw error;
  }
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: Record<string, string[]> } | undefined;
    if (data?.message) return data.message;
    if (data?.error && typeof data.error === "object") {
      const firstField = Object.values(data.error)[0];
      if (Array.isArray(firstField) && firstField[0]) return firstField[0];
    }
  }
  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: Record<string, string[]> } | undefined;
    if (data?.error && typeof data.error === "object") {
      const errors: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(data.error)) {
        if (Array.isArray(value)) errors[key] = value;
      }
      return errors;
    }
  }
  return {};
}
