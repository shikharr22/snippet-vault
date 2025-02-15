"use client";
import FolderCard from "@/components/FolderCard";
import SnippetCard from "@/components/SnippetCard";
import { IFolder } from "@/models/Folder";
import { ISnippet } from "@/models/Snippet";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function DashboardPage() {
  /**Folders state */
  const [folders, setFolders] = useState([] as IFolder[]);
  const [isFoldersLoading, setisFoldersLoading] = useState(false);

  /**Snippets state */
  const [snippets, setSnippets] = useState([] as ISnippet[]);
  const [isSnippetsLoading, setisSnippetsLoading] = useState(false);

  useEffect(() => {
    /**fetch folders */
    const fetchFolders = async () => {
      setisFoldersLoading(true);
      try {
        const res = await fetch("api/folders");
        const data = await res.json();

        setFolders(data);
      } catch (error) {
        console.error("Error fetching snippets:", error);
      } finally {
        setisFoldersLoading(false);
      }
    };

    /**fetch snippets */
    const fetchSnippets = async () => {
      setisSnippetsLoading(true);
      try {
        const res = await fetch("api/snippets?limit=3");
        const data = await res.json();

        setSnippets(data);
      } catch (error) {
        console.error("Error fetching snippets:", error);
      } finally {
        setisSnippetsLoading(false);
      }
    };

    fetchFolders();
    fetchSnippets();
  }, []);

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
        {isFoldersLoading
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
        {isSnippetsLoading
          ? Array(3)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between p-3 w-full h-24 bg-white rounded-lg shrink-0s"
                >
                  <Skeleton width="100%" height="100%" />
                </div>
              ))
          : snippets?.map((snippet: ISnippet) => (
              <SnippetCard
                key={snippet?.snippetId}
                id={snippet?.snippetId}
                title={snippet?.title}
                description={snippet?.description}
                createdAt={snippet?.createdAt}
                tag={snippet?.tag}
              />
            ))}
      </div>
    </div>
  );
}
