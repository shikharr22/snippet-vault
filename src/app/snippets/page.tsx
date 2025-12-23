"use client";
import { useEffect, useState } from "react";
import { ISnippet } from "@/models/Snippet";
import SnippetCard from "@/components/SnippetCard";
import { apiGet } from "@/lib/utils";
import Filters from "@/components/Filters";

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<ISnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchSnippets = async (cursor?: string | null) => {
    setIsLoading(true);
    try {
      let url = "/api/snippets";
      const cursorParam = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
      url += cursorParam;
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

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleSnippetDelete = () => {
    setCursor(null);
    fetchSnippets();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!snippets.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">No snippets found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      <Filters page="snippets" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 p-4 overflow-y-auto">
        {snippets?.map((snippet) => (
          <div className="h-64" key={snippet?.snippetId}>
            <SnippetCard
              key={snippet?.snippetId}
              id={snippet?.snippetId}
              title={snippet?.title}
              description={snippet?.description}
              code={snippet?.code}
              createdAt={snippet?.createdAt}
              tags={snippet?.tags}
              onSnippetDelete={handleSnippetDelete}
            />
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => fetchSnippets(cursor)}
          disabled={isLoading}
          className="mx-auto my-4 px-4 py-2 bg-blue-200"
        >
          {isLoading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
