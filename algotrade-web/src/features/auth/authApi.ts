import { api } from "../../services/apiClient";
import type {
  ApiSuccess,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../../types/auth";

export async function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<ApiSuccess<AuthResponse>>("/api/auth/login", credentials);
  return data.data;
}

export async function registerRequest(credentials: RegisterCredentials): Promise<AuthResponse> {
  const { data } = await api.post<ApiSuccess<AuthResponse>>("/api/auth/register", credentials);
  return data.data;
}

export async function googleAuthRequest(idToken: string): Promise<AuthResponse> {
  const { data } = await api.post<ApiSuccess<AuthResponse>>("/api/auth/google", { idToken });
  return data.data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/api/auth/logout");
}

export async function fetchMeRequest(): Promise<User> {
  const { data } = await api.get<ApiSuccess<{ user: User }>>("/api/auth/me");
  return data.data.user;
}

export async function refreshRequest(): Promise<string> {
  const { data } = await api.post<ApiSuccess<{ accessToken: string }>>("/api/auth/refresh");
  return data.data.accessToken;
}
