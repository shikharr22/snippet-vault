import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {
  createAccessCookie,
  createRefreshCookie,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
} from "@/lib/auth";
import { getDb } from "@/lib/infra";

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();

    const requestData = await req?.json();

    const user = await db
      .collection("Users")
      .findOne({ username: requestData?.username });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check password using bcrypt
    const isValid = await bcrypt.compare(requestData?.password, user?.password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const accessToken = generateAccessToken(user?.userId);
    const refreshToken = generateRefreshToken();

    await storeRefreshToken(user?.userId, refreshToken, {
      ip: req.headers.get("x-forwarded-for") || "",
    });

    const accessCookie = createAccessCookie(accessToken);
    console.log(accessCookie);
    const refreshCookie = createRefreshCookie(refreshToken);

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);

    return response;
  } catch (error) {
    console.error("Internal server error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
