import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getDb, withCacheLock, cacheDel } from "@/lib/infra";
import { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // Validate user
    const user: JwtPayload = requireAuth(req) as JwtPayload;
    const userId = user && user.userId;

    // Connect to DB
    const db = await getDb();

    // Extract folderId from URL
    const url = new URL(req.url);
    const folderId = url.pathname.split("/").pop();

    // Build cache key
    const cacheKey = `folder:owner:${userId}:folderId:${folderId}`;

    // Fetch folder with cache
    const folder = await withCacheLock(
      cacheKey,
      async () => {
        return await db.collection("Folders").findOne({ folderId, userId });
      },
      { ttlSeconds: 60 }
    );

    return NextResponse.json(folder, { status: 200 });
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Validate user
    const user: JwtPayload = requireAuth(req) as JwtPayload;
    const userId = user && user.userId;

    // Connect to DB
    const db = await getDb();

    // Extract folderId from URL
    const url = new URL(req.url);
    const folderId = url.pathname.split("/").pop();

    // Build cache key
    const cacheKey = `folder:owner:${userId}:folderId:${folderId}`;

    // Delete folder with cache lock
    const deletedFolder = await db
      .collection("Folders")
      .findOneAndDelete({ folderId, userId });

    // Update parentFolderId for snippets linked to deleted folder
    deletedFolder?.snippetIds?.forEach(async (snippetId: string) => {
      await db
        .collection("Snippets")
        .updateOne({ snippetId }, { $set: { parentFolderId: "" } });
    });

    await cacheDel(cacheKey);

    return NextResponse.json(
      { message: "Folder deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
