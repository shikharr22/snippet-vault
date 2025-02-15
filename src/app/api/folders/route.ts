import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("snippet_vault_db");
    const folders = await db.collection("Folders").find({}).toArray();

    return NextResponse.json(folders, { status: 200 });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
