"use client";
import FolderCard from "@/components/FolderCard";
import SnippetCard from "@/components/SnippetCard";
import { IFolder } from "@/models/Folder";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function DashboardPage() {
  const [folders, setFolders] = useState([] as IFolder[]);
  const [folderLoading, setFolderLoading] = useState(false);

  useEffect(() => {
    const fetchSnippets = async () => {
      setFolderLoading(true);
      try {
        const res = await fetch("api/folders");
        const data = await res.json();

        await new Promise((resolve) => setTimeout(resolve, 5000));

        setFolders(data);
      } catch (error) {
        console.error("Error fetching snippets:", error);
      } finally {
        setFolderLoading(false);
      }
    };

    fetchSnippets();
  }, []);

  const mockRecentSnippets = [
    {
      id: "1",
      title: "Snippet title 1",
      description: "Snippet description 1",
      tag: "Javascript",
    },
    {
      id: "2",
      title: "Snippet title 2",
      description: "Snippet description 2",
      tag: "React",
    },
    {
      id: "3",
      title: "Snippet title 1",
      description: "Snippet description 1",
      tag: "Javascript",
    },
  ];

  return (
    <div className="p-4 max-w-xl mx-auto ">
      {/* Folders Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium ">Folders</h2>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Plus className="w-5 h-5 text-blue-600" />
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
        {/* Folder cards */}
        {folderLoading
          ? Array(4)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between p-3 w-32 h-24 bg-white rounded-lg shrink-0s"
                >
                  <Skeleton width="100%" height="100%" />
                </div>
              ))
          : folders?.map((folder: IFolder) => (
              <FolderCard
                key={folder.folderId}
                id={folder.folderId}
                name={folder.title}
                snippetCount={folder.totalSnippets}
              />
            ))}
      </div>

      {/* Recent Snippets Section */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-medium">Recent Snippets</h2>
        <a href="#" className="text-blue-500 text-sm">
          See all
        </a>
      </div>
      <div
        className="space-y-4 max-h-76 overflow-y-auto scrollbar-hide
      "
      >
        {/* Recent snippet cards */}
        {mockRecentSnippets?.map((snippet) => (
          <SnippetCard key={snippet?.id} {...snippet} />
        ))}
      </div>
    </div>
  );
}
