"use client";
import { useEffect, useState } from "react";
import { ISnippet } from "@/models/Snippet";
import SnippetCard from "@/components/SnippetCard";
import { apiGet } from "@/lib/utils";

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<ISnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSnippets = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet("/api/snippets");
      setSnippets(data);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 p-4 overflow-y-auto">
        {snippets.map((snippet) => (
          <div className="h-64" key={snippet?.snippetId}>
            <SnippetCard
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
    </div>
  );
}
