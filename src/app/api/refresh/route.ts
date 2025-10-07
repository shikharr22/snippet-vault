// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  findRefreshToken,
  rotateRefreshToken,
  generateAccessToken,
  createAccessCookie,
  createRefreshCookie,
  deleteRefreshTokenByHash,
  generateRefreshToken,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken)
      return NextResponse.json({ error: "no refresh token" }, { status: 401 });

    const stored = await findRefreshToken(refreshToken);
    if (!stored) {
      // invalid token
      return NextResponse.json(
        { error: "invalid refresh token" },
        { status: 401 }
      );
    }
    // check expiry
    if (new Date(stored.expiresAt) < new Date()) {
      // remove expired token
      await deleteRefreshTokenByHash(stored.tokenHash);
      return NextResponse.json(
        { error: "expired refresh token" },
        { status: 401 }
      );
    }

    const userId = String(stored.userId);
    // generate new tokens (rotate)
    const { token: accessToken } = generateAccessToken({ sub: userId });
    const newRefreshToken = generateRefreshToken();
    await rotateRefreshToken(refreshToken, userId, newRefreshToken, {});

    // set cookies
    const accessCookie = createAccessCookie(accessToken);
    const refreshCookie = createRefreshCookie(newRefreshToken);

    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", accessCookie);
    res.headers.append("Set-Cookie", refreshCookie);

    return res;
  } catch (err) {
    console.error("refresh error", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
