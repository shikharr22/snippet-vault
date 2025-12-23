"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ISnippet } from "@/models/Snippet";
import SnippetCard from "@/components/SnippetCard";
import { apiGet } from "@/lib/utils";
import { IFilter } from "@/models/Filters";
import Filters from "@/components/Filters";

export default function FolderPage() {
  const pathname = usePathname();
  const [snippets, setSnippets] = useState<ISnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<IFilter[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchSnippets = async (
    params?: { [key: string]: string },
    cursor?: string | null
  ) => {
    setIsLoading(true);
    try {
      const folderId = pathname?.split("/").pop() as string;
      let url = `/api/snippets?folderId=${folderId}`;
      if (params) {
        Object.keys(params).forEach((key) => {
          url += `&${key}=${params[key]}`;
        });
      }
      if (cursor) {
        url += `&cursor=${encodeURIComponent(cursor)}`;
      }

      const data = await apiGet(url);

      if (cursor) {
        setSnippets((prev) => [...prev, ...(data?.items || [])]);
      } else {
        setSnippets(data?.items || []);
      }

      setCursor(data?.nextCursor);
      setHasMore(data?.hasMore);
    } catch (error) {
      console.error("Failed to fetch snippets", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch filters from /api/filters
  const fetchFilters = async () => {
    try {
      const data = await apiGet("/api/filters");
      setFilters(data);
    } catch (error) {
      console.error("Failed to fetch filters", error);
    }
  };

  useEffect(() => {
    fetchSnippets({}, cursor);
    fetchFilters();
  }, [pathname]);
  const handleSnippetDelete = () => {
    setCursor(null);
    fetchSnippets();
  };

  return (
    <div className="flex flex-col h-96">
      <Filters page="folder" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="text-lg text-gray-700">Loading...</p>
          </div>
        ) : snippets?.length > 0 ? (
          snippets.map((snippet) => (
            <div className="h-64" key={snippet?.snippetId}>
              <SnippetCard
                id={snippet?.snippetId}
                title={snippet?.title}
                description={snippet?.description}
                code={snippet?.code}
                createdAt={snippet?.createdAt}
                tags={snippet?.tags}
                parentFolderName={snippet?.parentFolderName}
                onSnippetDelete={handleSnippetDelete}
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="text-lg text-gray-700">
              No snippets found for this folder.
            </p>
          </div>
        )}
        {hasMore && (
          <button
            onClick={() => fetchSnippets({}, cursor)}
            disabled={isLoading}
            className="mx-auto my-4 px-4 py-2 bg-blue-200"
          >
            {isLoading ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
