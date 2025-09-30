import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAccessCookies } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const isAuthenticated = verifyAccessCookies(req);

    if (!isAuthenticated) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }
    const client = await clientPromise;
    const db = client.db("snippet_vault_db");

    // Extract query parameter safely
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : null;

    const folderIdParam = url.searchParams.get("folderId");

    // Build query
    let query = db.collection("Snippets").find({}).sort({ createdAt: 1 });

    if (folderIdParam) {
      const folderId = folderIdParam.toString();

      query = db
        .collection("Snippets")
        .find({ parentFolderId: folderId })
        .sort({ createdAt: 1 });
    }

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
