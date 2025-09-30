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

export async function PUT(req: NextRequest) {
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

    /**getting snippet id from URL */
    const url = new URL(req?.url);
    const snippetId = url?.toString()?.split("/")?.pop();
    const updatedSnippet = await req?.json();

    // Remove _id from updatedSnippet to avoid immutable field error
    if ("_id" in updatedSnippet) {
      delete updatedSnippet._id;
    }

    /**updating the current snippet */
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

    /**check if the parent folder is updated */
    if (currentParentFolder?.folderId !== snippet?.parentFolderId) {
      await db.collection("Folders").updateOne(
        { folderId: currentParentFolder?.folderId },
        {
          $pull: { snippetIds: snippet?.snippetId },
          $inc: { totalSnippets: -1 },
        }
      );

      await db.collection("Folders").updateOne(
        { folderId: snippet?.parentFolderId },
        {
          $addToSet: { snippetIds: snippetId },
          $inc: { totalSnippets: 1 },
        }
      );
    }

    return NextResponse.json(
      { message: "Snippet updated succesfully" },
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
    const snippetId = url?.toString()?.split("/").pop();

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

    return NextResponse.json(
      { message: "Snippet deleted succesfully" },
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
