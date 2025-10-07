"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ISnippet } from "@/models/Snippet";
import SnippetCard from "@/components/SnippetCard";
import { apiGet } from "@/lib/utils";
import { IFilter } from "@/models/Filters";

export default function FolderPage() {
  const pathname = usePathname();
  const [snippets, setSnippets] = useState<ISnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<IFilter[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string;
  }>();

  const fetchSnippets = async (params?: { [key: string]: string }) => {
    setIsLoading(true);
    try {
      const folderId = pathname?.split("/").pop() as string;
      let url = `/api/snippets?folderId=${folderId}`;
      if (params) {
        Object.keys(params).forEach((key) => {
          url += `&${key}=${params[key]}`;
        });
      }
      const data = await apiGet(url);
      console.log("data", data);
      setSnippets(data);
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

  const handleFilterChange = (filterName: string, selectedValue: string) => {
    setSelectedFilters((prev) => {
      const updatedSelectedFilters = { ...prev, [filterName]: selectedValue };
      fetchSnippets(updatedSelectedFilters);
      return updatedSelectedFilters;
    });

    setFilters((prev) => {
      const updatedFilters: IFilter[] = prev?.map((filter) => {
        if (filter?.value === filterName) {
          filter.selectedValue = selectedValue;
        }
        return filter;
      });

      return updatedFilters;
    });
  };

  useEffect(() => {
    fetchSnippets();
    fetchFilters();
  }, [pathname]);
  const handleSnippetDelete = () => {
    fetchSnippets();
  };

  return (
    <div className="flex flex-col h-96">
      {/* Fixed filters bar at the top */}
      <div className="sticky top-20 z-20 py-2 px-4 flex gap-4 items-center">
        {filters.map((filter: any) => (
          <div className="flex items-center gap-2" key={filter.value}>
            <label className="text-sm font-medium">{filter.label}:</label>
            <select
              className="px-2 py-1 border rounded text-sm"
              onChange={(e) =>
                handleFilterChange(filter?.value, e.target.value)
              }
            >
              <option value="">All</option>
              {filter.options.map((option: any) => (
                <option
                  key={option.value}
                  value={option.label}
                  disabled={option.disabled}
                >
                  {option.text}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
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
      </div>
    </div>
  );
}
