"use client";
import FolderCard from "@/components/FolderCard";
import SnippetCard from "@/components/SnippetCard";
import { IFolder } from "@/models/Folder";
import { ISnippet } from "@/models/Snippet";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  /**fetch folders */
  const fetchFolders = async () => {
    setisFoldersLoading(true);
    try {
      const res = await fetch("api/folders", { credentials: "include" });
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
      const res = await fetch("api/snippets?limit=3", {
        credentials: "include",
      });
      const data = await res.json();

      setSnippets(data);
    } catch (error) {
      console.error("Error fetching snippets:", error);
    } finally {
      setisSnippetsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchSnippets();
  }, []);

  const handleAddFolder = () => {
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setNewFolderName("");
  };

  const handleSave = async () => {
    if (!newFolderName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderName: newFolderName }),
        credentials: "include",
      });
      if (res.ok) {
        fetchFolders();
        setShowModal(false);
        setNewFolderName("");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnippetDelete = () => {
    fetchSnippets();
    fetchFolders();
  };

  const handleFolderDelete = () => {
    fetchFolders();
  };

  return (
    <div className="p-4 w-full">
      {/* Modal for adding folder */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col">
            <h3 className="text-lg font-medium mb-4">Add New Folder</h3>
            <input
              type="text"
              className="border rounded px-3 py-2 mb-4"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              disabled={isSaving}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleSave}
                disabled={isSaving}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Folders Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium ">Folders</h2>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={handleAddFolder}
        >
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
                onFolderDelete={handleFolderDelete}
              />
            ))}
      </div>

      {/* Recent Snippets Section */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-medium">Recent Snippets</h2>
        <div
          className="text-blue-500 text-sm cursor-pointer"
          onClick={() => router.push("/snippets")}
        >
          See all
        </div>
      </div>
      <div
        className="
          grid gap-4 max-h-76 overflow-y-auto scrollbar-hide
          grid-cols-1
          lg:grid-cols-2
        "
      >
        {/* Recent snippet cards */}
        {isSnippetsLoading ? (
          Array(3)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="flex flex-col justify-between p-3 w-full h-24 bg-white rounded-lg shrink-0s"
              >
                <Skeleton width="100%" height="100%" />
              </div>
            ))
        ) : snippets.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500 py-8">
            No snippets found.
          </div>
        ) : (
          snippets.map((snippet: ISnippet) => (
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
          ))
        )}
      </div>
    </div>
  );
}
