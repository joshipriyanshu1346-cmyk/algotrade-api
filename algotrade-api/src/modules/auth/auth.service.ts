import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { comparePassword, hashPassword } from "../../utils/password";
import {
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiryDate,
  signAccessToken,
} from "../../utils/jwt";
import { LoginInput, RegisterInput, normalizeEmail } from "./validation/auth.validation";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  authProvider: "LOCAL" | "GOOGLE";
}

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  authProvider: "LOCAL" | "GOOGLE";
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
  };
}

async function issueTokenPair(userId: string, role: "USER" | "ADMIN"): Promise<TokenPair> {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<{ user: PublicUser; tokens: TokenPair }> {
  const normalizedEmail = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: normalizedEmail,
      passwordHash,
      authProvider: "LOCAL",
    },
  });

  const tokens = await issueTokenPair(user.id, user.role);
  return { user: toPublicUser(user), tokens };
}

export async function login(input: LoginInput): Promise<{ user: PublicUser; tokens: TokenPair }> {
  const normalizedEmail = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user?.passwordHash) {
    // Same error whether the user doesn't exist or signed up via Google —
    // avoids leaking which emails are registered.
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (user.status === "SUSPENDED") {
    throw ApiError.forbidden("This account has been suspended");
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const tokens = await issueTokenPair(user.id, user.role);
  return { user: toPublicUser(user), tokens };
}

export async function loginWithGoogle(idToken: string): Promise<{ user: PublicUser; tokens: TokenPair }> {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw ApiError.unauthorized("Invalid Google token");
  }

  if (!payload?.email || !payload.sub) {
    throw ApiError.unauthorized("Invalid Google token payload");
  }

  const normalizedEmail = normalizeEmail(payload.email);

  if (!payload.email_verified) {
    throw ApiError.unauthorized("Google email is not verified");
  }

  // Match by googleId first, then fall back to matching an existing
  // email/password account so a user can't be duplicated across methods.
  let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });

  if (!user) {
    const existingByEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { googleId: payload.sub },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: payload.name ?? normalizedEmail.split("@")[0],
          email: normalizedEmail,
          googleId: payload.sub,
          authProvider: "GOOGLE",
        },
      });
    }
  }

  if (user.status === "SUSPENDED") {
    throw ApiError.forbidden("This account has been suspended");
  }

  const tokens = await issueTokenPair(user.id, user.role);
  return { user: toPublicUser(user), tokens };
}

export async function rotateRefreshToken(rawToken: string): Promise<TokenPair> {
  const tokenHash = hashRefreshToken(rawToken);
  const stored = await prisma.refreshToken.findFirst({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || user.status === "SUSPENDED") {
    throw ApiError.unauthorized("Account is not available");
  }

  // Revoke the used token (rotation) and issue a new pair.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokenPair(user.id, user.role);
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashRefreshToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");
  return toPublicUser(user);
}
