import { NextRequest, NextResponse } from "next/server";
import { getDb, requireAuth } from "@/lib/infra";
import { JwtPayload } from "jsonwebtoken";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    /**fetching user id from access token */
    const user: JwtPayload = requireAuth(req) as JwtPayload;
    const userId = user && user?.userId;

    /**connecting to db once authenticated */
    const db = await getDb();

    // Extract query parameters safely
    const url = new URL(req.url);
    let limitParam = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit") ?? "")
      : 2;
    const folderIdParam = url.searchParams.get("folderId") ?? "";
    const tagParam = url.searchParams.get("tags") ?? "";
    const cursor = url.searchParams.get("cursor") ?? null;

    /**Max limit to prevent excessive limit value */
    const maxLimit = 100;
    limitParam = Math.min(limitParam, maxLimit);

    // normalize tags for query + cache key
    const tagsArr = tagParam
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // build mongo query (keeps your original logic)
    const mongoQuery: { [key: string]: string | string[] | unknown } = {
      userId,
    };

    if (folderIdParam) {
      mongoQuery.parentFolderId = folderIdParam.toString();
    }
    if (tagsArr.length === 1) {
      mongoQuery.tags = tagsArr[0];
    } else if (tagsArr.length > 1) {
      mongoQuery.tags = { $in: tagsArr };
    }

    if (cursor) {
      /**fetch snippets with Id greater than cursor date */
      const cursorDate = new Date(cursor);
      if (isNaN(cursorDate.getTime())) {
        return NextResponse.json(
          { message: "Invalid cursor" },
          { status: 400 }
        );
      }
      mongoQuery.createdAt = { $gt: cursorDate };
    }

    /**tags key for cache */
    // const tagsKey = tagsArr.length ? tagsArr.join(",") : "all";

    // cache key includes user (so private lists can be cached per-user),
    // folder, tags, limit and sort direction to avoid collisions
    // const cacheKey = `snippets_list:owner:${userId}:folder:${
    //   folderIdParam || "all"
    // }:tags:${tagsKey || "all"}`;

    // fetch using cache-aside with stampede protection
    let res = db.collection("Snippets").find(mongoQuery).sort({ createdAt: 1 });

    if (limitParam) {
      /**limitParam + 1 used to check if more snippets are there */
      res = res.limit(limitParam + 1);
    }

    const snippets = await res.toArray();

    const hasMore = snippets.length > limitParam;
    const items = hasMore ? snippets.slice(0, -1) : snippets;
    const nextCursor =
      hasMore && items ? items[items.length - 1].createdAt : null;

    return NextResponse.json({ items, nextCursor, hasMore }, { status: 200 });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
