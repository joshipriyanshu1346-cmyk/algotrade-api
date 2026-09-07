export type UserRole = "USER" | "ADMIN";
export type AuthProvider = "LOCAL" | "GOOGLE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: Record<string, string[] | unknown>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
