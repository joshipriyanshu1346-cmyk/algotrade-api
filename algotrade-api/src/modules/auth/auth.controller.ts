import { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { sendSuccess } from "../../utils/ApiResponse";
import * as authService from "./auth.service";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  path: "/api/auth",
  maxAge: env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...refreshCookieOptions,
    maxAge: undefined,
  });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await authService.register(req.body);
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, "Account created", 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await authService.login(req.body);
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, "Logged in");
  } catch (err) {
    next(err);
  }
}

export async function googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await authService.loginWithGoogle(req.body.idToken);
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, "Logged in with Google");
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawToken) {
      res.status(401).json({ success: false, message: "Missing refresh token", error: {} });
      return;
    }
    const tokens = await authService.rotateRefreshToken(rawToken);
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { accessToken: tokens.accessToken }, "Token refreshed");
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(rawToken);
    clearRefreshCookie(res);
    sendSuccess(res, {}, "Logged out");
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getUserById(req.user!.userId);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}
