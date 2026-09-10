import { z } from "zod";

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z
    .string()
    .trim()
    .transform((value) => normalizeEmail(value))
    .pipe(z.string().email("Invalid email address")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/\d/, "Password must contain a number"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .transform((value) => normalizeEmail(value))
    .pipe(z.string().email("Invalid email address")),
  password: z.string().min(1, "Password is required"),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "Google idToken is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
