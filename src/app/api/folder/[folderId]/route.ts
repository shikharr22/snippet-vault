import clientPromise from "@/lib/mongodb";
import { verifyAccessCookies } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

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
    const db = await client.db("snippet_vault_db");

    const url = new URL(req?.url);

    const folderId = url?.toString()?.split("/")?.pop();

    const folder = await db.collection("folders").findOne({ folderId });

    return NextResponse.json(folder, { status: 200 });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAuthenticated = verifyAccessCookies(req);
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }
    const client = await clientPromise;
    const db = await client.db("snippet_vault_db");

    const url = new URL(req?.url);

    const folderId = url?.toString()?.split("/")?.pop();

    /**deleting folder */
    const deletedFolder = await db
      .collection("Folders")
      .findOneAndDelete({ folderId });

    /**updating the parent folder id for the snippets ids linked to deleted folder */
    deletedFolder?.snippetIds?.forEach(async (snippetId: string) => {
      await db
        .collection("Snippets")
        .updateOne({ snippetId }, { $set: { parentFolderId: "" } });
    });
    return NextResponse.json(
      { message: "Folder deleted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
