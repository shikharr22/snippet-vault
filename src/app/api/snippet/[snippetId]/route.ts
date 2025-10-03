import { cacheDel, getDb, requireAuth, withCacheLock } from "@/lib/infra";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Validate user
    const user: any = requireAuth(req);
    const userId = user && user.userId;

    // Connect to DB
    const db = await getDb();

    // Get snippetId from URL
    const url = new URL(req.url);
    const snippetId = url.pathname.split("/").pop();

    // Build cache key
    const cacheKey = `snippet:owner:${userId}:snippetId:${snippetId}`;

    // Fetch snippet with cache
    const snippet = await withCacheLock(
      cacheKey,
      async () => {
        return await db.collection("Snippets").findOne({ snippetId });
      },
      { ttlSeconds: 60 }
    );

    return NextResponse.json(snippet, { status: 200 });
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Validate user
    const user: any = requireAuth(req);
    const userId = user && user.userId;

    // Connect to DB
    const db = await getDb();

    // Get snippetId from URL
    const url = new URL(req.url);
    const snippetId = url.pathname.split("/").pop();
    const updatedSnippet = await req.json();

    // Remove _id from updatedSnippet to avoid immutable field error
    if ("_id" in updatedSnippet) {
      delete updatedSnippet._id;
    }

    // Update the current snippet
    const snippet = await db
      .collection("Snippets")
      .findOneAndUpdate(
        { snippetId },
        { $set: updatedSnippet },
        { returnDocument: "after" }
      );

    const currentParentFolder = await db
      .collection("Folders")
      .findOne({ snippetIds: snippetId });

    // Check if the parent folder is updated
    if (currentParentFolder?.folderId !== snippet?.parentFolderId) {
      await db.collection("Folders").updateOne(
        { folderId: currentParentFolder?.folderId },
        {
          $pull: { snippetIds: snippet?.snippetId },
          $inc: { totalSnippets: -1 },
        }
      );

      const folder = await db.collection("Folders").findOneAndUpdate(
        { folderId: snippet?.parentFolderId },
        {
          $addToSet: { snippetIds: snippetId },
          $inc: { totalSnippets: 1 },
        }
      );

      await db
        .collection("Snippets")
        .updateOne(
          { snippetId: snippet?.snippetId },
          { $set: { parentFolderName: folder?.title } }
        );
    }

    // Invalidate cache for this snippet
    const cacheKey = `snippet:owner:${userId}:snippetId:${snippetId}`;
    await cacheDel(cacheKey);

    return NextResponse.json(
      { message: "Snippet updated succesfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error updating snippet:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Validate user
    const user: any = requireAuth(req);
    const userId = user && user.userId;

    // Connect to DB
    const db = await getDb();

    // Get snippetId from URL
    const url = new URL(req.url);
    const snippetId = url.pathname.split("/").pop();

    // Check if snippet exists
    const snippet = await db.collection("Snippets").findOne({ snippetId });
    if (!snippet) {
      return NextResponse.json(
        { message: "Snippet not found" },
        { status: 404 }
      );
    }

    const deletedSnippet = await db
      .collection("Snippets")
      .findOneAndDelete({ snippetId });

    await db.collection("Folders").updateOne(
      { folderId: deletedSnippet?.parentFolderId },
      {
        $pull: { snippetIds: deletedSnippet?.snippetId },
        $inc: { totalSnippets: -1 },
      }
    );

    // Invalidate cache for this snippet
    const cacheKey = `snippet:owner:${userId}:snippetId:${snippetId}`;
    await cacheDel(cacheKey);

    return NextResponse.json(
      { message: "Snippet deleted succesfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
