import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { newSnippetSchema } from "@/models/Snippet";

export async function POST(req: NextRequest) {
  try {
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

    const newSnippet = { ...reqPayload, createdAt: new Date() };

    const result = await db.collection("Snippets").insertOne(newSnippet);

    return NextResponse.json(
      { message: "Snippet added successfully", snippetId: result?.insertedId },
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
