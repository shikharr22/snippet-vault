"use client";
import { useEffect, useState } from "react";
import { IFolder } from "@/models/Folder";
import FolderCard from "@/components/FolderCard";
import { apiGet } from "@/lib/utils";

export default function FoldersPage() {
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet("/api/folders");
      setFolders(data);
    } catch (error) {
      console.error("Failed to fetch folders", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleFolderDelete = () => {
    fetchFolders();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!folders.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">No folders found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 flex-1 p-4 overflow-y-auto">
        {folders.map((folder) => (
          <FolderCard
            key={folder.folderId}
            id={folder.folderId}
            name={folder.title}
            snippetCount={folder.totalSnippets}
            onFolderDelete={handleFolderDelete}
          />
        ))}
      </div>
    </div>
  );
}
