import clientPromise from "@/lib/mongodb";
import { verifyAccessCookies } from "@/lib/utils";
import { IFilter } from "@/models/Filters";
import { ISnippet } from "@/models/Snippet";
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

    // Get all snippets
    const snippets = await db
      .collection("Snippets")
      .find({}, { projection: { tags: 1 } })
      .toArray();

    const tagsFilter = generateTagsFilter(snippets);

    const folders = await db
      .collection("Folders")
      .find({}, { projection: { title: 1, folderId: 1 } })
      .toArray();

    const foldersFilter = generateFoldersFilters(folders);

    return NextResponse.json([tagsFilter, foldersFilter], { status: 200 });
  } catch (error) {
    console.log("Internal server error");
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const FiltersMap = ["tags", "folders"];

function generateTagsFilter(snippets: Array<any>): IFilter {
  // Collect all tags into a Set for uniqueness
  const tagSet = new Set<string>();
  snippets.forEach((snippet) => {
    if (Array.isArray(snippet.tags)) {
      snippet.tags.forEach((tag: string) => tagSet.add(tag));
    }
  });

  // Format as [{text, value}]
  const tagsOptions = Array.from(tagSet).map((tag) => ({
    text: tag,
    value: tag,
    disabled: false,
  }));

  const tagsFilter: IFilter = {
    label: "Tags",
    value: "tags",
    options: tagsOptions,
    selectedValue: "",
  };

  return tagsFilter;
}

function generateFoldersFilters(folders: Array<any>): IFilter {
  // Collect all folder titles and ids
  const foldersOptions = folders.map((folder) => ({
    text: folder.title,
    value: folder.folderId,
    disabled: false,
  }));

  const foldersFilter: IFilter = {
    label: "Folders",
    value: "folders",
    options: foldersOptions,
    selectedValue: "",
  };

  return foldersFilter;
}
