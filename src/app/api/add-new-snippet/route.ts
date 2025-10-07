import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { newSnippetSchema } from "@/models/Snippet";
import { cacheDel, requireAuth } from "@/lib/infra";
import { JwtPayload } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const user: JwtPayload = requireAuth(req) as JwtPayload;
    const userId = user && user?.userId;

    const client = await clientPromise;
    const db = client.db("snippet_vault_db");

    const reqPayload = await req.json();

    const validationResult = newSnippetSchema.safeParse(reqPayload);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    const newSnippet = {
      ...reqPayload,
      createdAt: new Date(),
    };

    const result = await db.collection("Snippets").insertOne(newSnippet);

    await db
      .collection("Snippets")
      .updateOne(
        { _id: result.insertedId, userId },
        { $set: { snippetId: result.insertedId?.toString() } }
      );

    const parentFolder = await db.collection("Folders").findOneAndUpdate(
      { folderId: reqPayload?.parentFolderId, userId },
      {
        $addToSet: { snippetIds: result.insertedId?.toString() },
        $inc: { totalSnippets: 1 },
      }
    );

    await db
      .collection("Snippets")
      .updateOne(
        { _id: result?.insertedId },
        { $set: { parentFolderName: parentFolder?.title } }
      );

    const cacheKey = `snippets_list:owner:${userId}:folder:all
    }:tags:all`;

    await cacheDel(cacheKey);

    return NextResponse.json(
      { message: "Snippet added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving snippet:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
