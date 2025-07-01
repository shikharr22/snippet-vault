import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = await client.db("snippet_vault_db");

    /**getting snippet id from URL */
    const url = new URL(req?.url);
    const snippetId = url?.toString()?.split("/")?.pop();

    const snippet = await db
      .collection("Snippets")
      .findOne({ snippetId: snippetId });

    return NextResponse.json(snippet, { status: 200 });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
