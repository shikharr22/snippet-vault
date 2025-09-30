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

export async function POST(req: NextRequest) {
  try {
    const isAuthenticated = verifyAccessCookies(req);

    if (!isAuthenticated) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }
    const requestData = await req.json();
    const newFolderName = requestData?.folderName;

    if (!newFolderName) {
      return NextResponse.json(
        { message: "Missing 'new_folder' parameter" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("snippet_vault_db");
    const newFolder = {
      title: newFolderName,
      createdAt: new Date(),
      snippetIds: [],
      totalSnippets: 0,
    };
    const result = await db.collection("Folders").insertOne(newFolder);

    await db
      .collection("Folders")
      .updateOne(
        { _id: result.insertedId },
        { $set: { folderId: result.insertedId?.toString() } }
      );

    return NextResponse.json({ message: "Folder created" }, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
