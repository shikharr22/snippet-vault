import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = await client.db("snippet_vault_db");

    const requestData = await req?.json();

    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(requestData.password, saltRounds);

    // Replace plain password with hashed password
    const userPayload = {
      ...requestData,
      password: hashedPassword,
    };

    const user = await db.collection("Users").insertOne(userPayload);

    await db
      .collection("Users")
      .updateOne(
        { _id: user?.insertedId },
        { $set: { userId: user?.insertedId?.toString() } }
      );

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Internal server error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
