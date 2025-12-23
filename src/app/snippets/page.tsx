"use client";
import { useEffect, useState } from "react";
import { ISnippet } from "@/models/Snippet";
import SnippetCard from "@/components/SnippetCard";
import { apiGet } from "@/lib/utils";
import Filters from "@/components/Filters";
import { Button, Spinner } from "@heroui/react";

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

  if (isLoading && !snippets.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="text-gray-600 mt-4">Loading snippets...</p>
      </div>
    );
  }

  if (!snippets.length && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">No snippets found.</p>
        <p className="text-gray-500 mt-2">
          Create your first snippet to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Filters page="snippets" />
      <div className="flex-1 p-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets?.map((snippet) => (
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
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                variant="flat"
                onPress={() => fetchSnippets(cursor)}
                isLoading={isLoading}
                className="min-w-32"
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
