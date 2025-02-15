import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("snippet_vault_db");

    // Extract query parameter safely
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : null; // Convert only if present

    // Build query
    let query = db.collection("Snippets").find({}).sort({ createdAt: -1 });
    if (limit) query = query.limit(limit);

    const snippets = await query.toArray(); // Convert cursor to array

    return NextResponse.json(snippets, { status: 200 });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
