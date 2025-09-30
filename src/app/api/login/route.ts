import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("snippet_vault_db");

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

    const auth_token_secret_key = process.env.AUTH_TOKEN_SECRET_KEY as string;

    console.log(auth_token_secret_key);

    const accessToken = jwt.sign(
      { userId: user?.userId },
      auth_token_secret_key,
      {
        expiresIn: "2hr",
      }
    );

    const refreshToken = jwt.sign(
      { userId: user?.userId },
      auth_token_secret_key,
      {
        expiresIn: "24hr",
      }
    );

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60,
    });

    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Internal server error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
