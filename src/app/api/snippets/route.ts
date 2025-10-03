import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAccessCookies } from "@/lib/utils";
import { getDb, getRedis, requireAuth, withCacheLock } from "@/lib/infra";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    /**fetching user id from access token */
    const user: any = requireAuth(req);
    const userId = user && user?.userId;

    /**connecting to db once authenticated */
    const db = await getDb();

    // Extract query parameters safely
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit") ?? "")
      : null;
    const folderIdParam = url.searchParams.get("folderId") ?? "";
    const tagParam = url.searchParams.get("tags") ?? "";

    // normalize tags for query + cache key
    const tagsArr = tagParam
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // build mongo query (keeps your original logic)
    const mongoQuery: any = {};
    if (folderIdParam) {
      mongoQuery.parentFolderId = folderIdParam.toString();
    }
    if (tagsArr.length === 1) {
      mongoQuery.tags = tagsArr[0];
    } else if (tagsArr.length > 1) {
      mongoQuery.tags = { $in: tagsArr };
    }

    /**tags key for cache */
    const tagsKey = tagsArr.length ? tagsArr.join(",") : "all";

    // cache key includes user (so private lists can be cached per-user),
    // folder, tags, limit and sort direction to avoid collisions
    const cacheKey = `snippets_list:owner:${userId}:folder:${
      folderIdParam || "all"
    }:tags:${tagsKey}:limit:${limitParam ?? "all"}:sort:createdAt:1`;

    // fetch using cache-aside with stampede protection
    const snippets = await withCacheLock(
      cacheKey,
      async () => {
        let res = db
          .collection("Snippets")
          .find(mongoQuery)
          .sort({ createdAt: 1 });

        if (limitParam) res = res.limit(limitParam);

        const items = await res.toArray();

        // return the raw array (matches previous behavior)
        return items;
      },
      { ttlSeconds: 60 }
    );

    return NextResponse.json(snippets, { status: 200 });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
