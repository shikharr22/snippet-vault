import { requireAuth } from "@/lib/infra";
import clientPromise from "@/lib/mongodb";
import { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user: JwtPayload = requireAuth(req) as JwtPayload;
  const userId = user && user?.userId;

  const title = req?.nextUrl?.searchParams?.get("title");

  if (!title) {
    return NextResponse.json({ exists: false });
  }

  const client = await clientPromise;
  const db = client.db("snippet_vault_db");

  /**checks for existing title , case-insensative */
  const exists = await db
    .collection("Snippets")
    .findOne({ title: { $regex: `^${title}$`, $options: "i" }, userId });

  return NextResponse.json({ exists: !!exists });
}
