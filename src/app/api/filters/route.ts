import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getDb, withCacheLock } from "@/lib/infra";
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
    const cacheKey = `filters:owner:${userId}`;

    // Fetch filters with cache
    const filters = await withCacheLock(
      cacheKey,
      async () => {
        // Get all snippets
        const snippets = await db
          .collection("Snippets")
          .find({ userId }, { projection: { tags: 1 } })
          .toArray();

        const tagsFilter = generateTagsFilter(snippets);

        // const folders = await db
        //   .collection("Folders")
        //   .find({}, { projection: { title: 1, folderId: 1 } })
        //   .toArray();

        // const foldersFilter = generateFoldersFilters(folders);

        return [tagsFilter];
      },
      { ttlSeconds: 60 }
    );

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
