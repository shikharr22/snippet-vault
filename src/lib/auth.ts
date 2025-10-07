import jwt from "jsonwebtoken";
import crypto from "crypto";
import { serialize } from "cookie";
import type { NextRequest } from "next/server";
import { getDb } from "./infra";

// ENV defaults
const ACCESS_TOKEN_TTL_SECONDS = Number(
  process.env.ACCESS_TOKEN_TTL_SECONDS || 60 * 15
); // 15m
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30); // 30 days
const AUTH_TOKEN_SECRET_KEY =
  process.env.AUTH_TOKEN_SECRET_KEY || "auth_token_secret_key_01";

export function generateAccessToken(request: string) {
  const token = jwt.sign({ userId: request }, AUTH_TOKEN_SECRET_KEY, {
    expiresIn: `${ACCESS_TOKEN_TTL_SECONDS}s`,
  });
  return token;
}

export function generateRefreshToken() {
  // long random token (not JWT). We'll hash before storing.
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ---------- Cookie helpers ----------
export function createAccessCookie(token: string) {
  return serialize("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function createRefreshCookie(token: string) {
  return serialize("refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
  });
}

export function clearAccessCookie() {
  return serialize("accessToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
export function clearRefreshCookie() {
  return serialize("refreshToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// ---------- Refresh token DB helpers ----------
/**
 * Store a refresh token (hashed) for a user.
 * Keep a single active refresh token per device/user or allow multiple rows per user (choose one).
 */
export async function storeRefreshToken(
  userId: string,
  refreshToken: string,
  meta: Record<string, any> = {}
) {
  const db = await getDb();
  const tokenHash = hashToken(refreshToken);
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  // you can store device/user-agent info in meta
  await db.collection("RefreshTokens").insertOne({
    userId,
    tokenHash,
    createdAt: now,
    expiresAt,
    meta,
  });

  return { tokenHash, expiresAt };
}

/**
 * Find refresh token by raw token (hashed) and return the row.
 */
export async function findRefreshToken(refreshToken: string) {
  const db = await getDb();
  const tokenHash = hashToken(refreshToken);
  const row = await db.collection("RefreshTokens").findOne({ tokenHash });
  return row;
}

/**
 * Delete a refresh token (logout) by raw token or by userId to revoke all.
 */
export async function deleteRefreshTokenByHash(tokenHash: string) {
  const db = await getDb();
  await db.collection("RefreshTokens").deleteOne({ tokenHash });
}

export async function deleteRefreshTokensByUser(userId: string) {
  const db = await getDb();
  await db.collection("RefreshTokens").deleteMany({ userId });
}

/**
 * Rotate refresh token (delete old hash & insert new one) - atomic-ish via two ops.
 */
export async function rotateRefreshToken(
  oldToken: string | null,
  userId: string,
  newRefreshToken: string,
  meta: Record<string, any> = {}
) {
  const db = await getDb();
  if (oldToken) {
    const oldHash = hashToken(oldToken);
    await db.collection("RefreshTokens").deleteOne({ tokenHash: oldHash });
  }
  const { tokenHash, expiresAt } = await storeRefreshToken(
    userId,
    newRefreshToken,
    meta
  );
  return { tokenHash, expiresAt };
}

// ---------- Verify access token (improved) ----------
export function verifyAccessTokenFromString(token: string) {
  try {
    const decoded = jwt.verify(token, AUTH_TOKEN_SECRET_KEY);
    console.log("decoded", decoded);
    return decoded;
  } catch (err) {
    throw err;
  }
}

/**
 * Read cookie from NextRequest and verify access token.
 * Throws if invalid or missing.
 */
export function verifyAccessCookies(req: NextRequest) {
  const accessToken = req?.cookies?.get("accessToken")?.value;
  if (!accessToken) throw new Error("No access token found");
  try {
    const decoded = verifyAccessTokenFromString(accessToken);
    return decoded;
  } catch (error) {
    console.error("Error in access token verification", error);
    throw new Error("Error in access token verification");
  }
}
