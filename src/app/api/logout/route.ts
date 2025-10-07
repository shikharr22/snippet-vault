// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  deleteRefreshTokenByHash,
  hashToken,
  clearAccessCookie,
  clearRefreshCookie,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await deleteRefreshTokenByHash(tokenHash);
    }

    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", clearAccessCookie());
    res.headers.append("Set-Cookie", clearRefreshCookie());
    return res;
  } catch (err) {
    console.error("logout error", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
