import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getDb } from "@/lib/infra";
import { IFilter } from "@/models/Filters";
import { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // Validate user
    const user: JwtPayload = requireAuth(req) as JwtPayload;
    const userId = user && user.userId;

    // Connect to DB
    const db = await getDb();

    // Build cache key
    // const cacheKey = `filters:owner:${userId}`;

    const { searchParams } = new URL(req?.url);
    const page = searchParams?.get("page")?.toString();

    if (!page) {
      return NextResponse.json(
        { message: "Invalid page param" },
        { status: 400 }
      );
    }

    // Get all snippets with tags and parent folders name
    const snippets = await db
      .collection("Snippets")
      .find(
        { userId },
        { projection: { tags: 1, parentFolderName: 1, parentFolderId: 1 } }
      )
      .toArray();

    const tagsFilter = generateTagsFilter(snippets);
    let foldersFilter = {};
    if (page === "snippets") {
      foldersFilter = generateFoldersFilter(snippets);
    }

    const filters = {
      ...(tagsFilter ? { tags: tagsFilter } : {}),
      ...(foldersFilter ? { folders: foldersFilter } : {}),
    };

    return NextResponse.json(filters, { status: 200 });
  } catch (error) {
    console.error("Internal server error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
// ...existing code...

export const FiltersMap = ["tags"];

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
  }));

  const tagsFilter: IFilter = {
    label: "Tags",
    value: "tags",
    options: tagsOptions,
    selectedValue: "",
  };

  return tagsFilter;
}

function generateFoldersFilter(snippets: Array<any>): IFilter {
  // Collect all tags into a Set for uniqueness
  const foldersMap = new Map<string, string>();
  snippets.forEach((snippet) => {
    foldersMap.set(snippet?.parentFolderId, snippet?.parentFolderName);
  });

  // Format as [{text, value}]
  const foldersOptions = Array.from(foldersMap.entries()).map(([id, name]) => ({
    text: name,
    value: id,
  }));

  const foldersFilter: IFilter = {
    label: "Folders",
    value: "folders",
    options: foldersOptions,
    selectedValue: "",
  };

  return foldersFilter;
}

// function generateFoldersFilters(folders: Array<any>): IFilter {
//   // Collect all folder titles and ids
//   const foldersOptions = folders.map((folder) => ({
//     text: folder.title,
//     value: folder.folderId,
//     disabled: false,
//   }));

//   const foldersFilter: IFilter = {
//     label: "Folders",
//     value: "folders",
//     options: foldersOptions,
//     selectedValue: "",
//   };

//   return foldersFilter;
// }
