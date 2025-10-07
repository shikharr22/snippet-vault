import { NextRequest, NextResponse } from "next/server";
import { cacheDel, getDb, requireAuth, withCacheLock } from "@/lib/infra";
import { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const user: JwtPayload = requireAuth(req) as JwtPayload;
    const userId = user && user?.userId;

    const db = await getDb();

    const cacheKey = `folders_list:owner:${userId}:all`;

    const folders = await withCacheLock(
      cacheKey,
      async () => {
        return await db.collection("Folders").find({ userId }).toArray();
      },

      { ttlSeconds: 60 }
    );

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
    const user: any = requireAuth(req);
    const userId = user && user?.userId;
    console.log(userId);
    const requestData = await req.json();
    const newFolderName = requestData?.folderName;

    if (!newFolderName) {
      return NextResponse.json(
        { message: "Missing 'new_folder' parameter" },
        { status: 400 }
      );
    }

    const db = await getDb();

    const newFolder = {
      title: newFolderName,
      createdAt: new Date(),
      snippetIds: [],
      totalSnippets: 0,
      userId,
    };
    const result = await db.collection("Folders").insertOne(newFolder);

    await db
      .collection("Folders")
      .updateOne(
        { _id: result.insertedId },
        { $set: { folderId: result.insertedId?.toString() } }
      );

    const cacheKey = `folders_list:owner:${userId}:all`;

    /**deleting previous cache of folders */
    await cacheDel(cacheKey);

    return NextResponse.json({ message: "Folder created" }, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
