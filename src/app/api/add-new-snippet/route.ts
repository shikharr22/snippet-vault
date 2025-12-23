import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/infra";
import { JwtPayload } from "jsonwebtoken";
import { newSnippetSchema } from "@/lib/validations";
import { ObjectId } from "mongodb";

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
        { message: "Invalid input", errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    /**new id for new snippet */
    const newId = new ObjectId();

    /**updating parent folder snippets count */
    const parentFolder = await db.collection("Folders").findOneAndUpdate(
      { folderId: reqPayload?.parentFolderId, userId },
      {
        $addToSet: { snippetIds: newId?.toString() },
        $inc: { totalSnippets: 1 },
      }
    );

    const newSnippet = {
      ...reqPayload,
      userId,
      createdAt: new Date(),
      _id: newId,
      snippetId: newId?.toString(),
      parentFolderName: parentFolder?.title ?? null,
    };

    await db.collection("Snippets").insertOne(newSnippet);

    // const cacheKey = `snippets_list:owner:${userId}:folder:all:tags:all`;

    // await cacheDel(cacheKey);

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
