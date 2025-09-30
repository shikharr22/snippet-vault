"use client";
import { InputField } from "@/components/InputField";
import { Textarea } from "@/components/Textarea";
import { IFolder } from "@/models/Folder";
import { ISnippet } from "@/models/Snippet";
import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { apiPut } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Snippet() {
  const pathname = usePathname();
  const [snippet, setSnippet] = useState<ISnippet>({} as ISnippet);
  const [foldersList, setFoldersList] = useState<IFolder[]>([] as IFolder[]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  // Tag input state for editing tags
  const [tagInput, setTagInput] = useState("");

  const router = useRouter();

  const fetchSnippet = async () => {
    setIsLoading(true);
    try {
      const snippetId = pathname?.split("/").pop() as string;

      const response = await fetch(`/api/snippet/${snippetId}`, {
        credentials: "include",
      });
      const data = await response.json();

      setSnippet(data);
    } catch (error) {
      console.error("Something went wrong", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFoldersList = async () => {
    try {
      const response = await fetch(`/api/folders`, { credentials: "include" });
      const data = await response.json();

      setFoldersList(data);
    } catch (error) {
      console.error("Something went wrong", error);
    }
  };

  useEffect(() => {
    fetchFoldersList();
    fetchSnippet();
  }, [pathname]);

  const handleEdit = () => {
    setIsReadOnly(false);
  };

  const handleSave = async () => {
    try {
      const snippetId = pathname?.split("/").pop() as string;
      await apiPut(`/api/snippet/${snippetId}`, snippet);
      router.push("/dashboard");
      setIsReadOnly(true);
    } catch (error) {
      console.error("Failed to save snippet", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!snippet.snippetId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Snippet not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600]">
      <div className="sticky top-0 z-10 p-4 flex justify-between items-center">
        <span className="w-1/2">Snippet details</span>
        <div className="flex justify-end items-center gap-2 w-full mt-4">
          {/* Edit Button */}
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          {/* Save Button */}
          {!isReadOnly && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col items-start justify-start flex-1 p-4 overflow-y-auto">
        <div className="mb-3">
          {/* Title */}
          <label className="text-sm font-medium">Title</label>
          <InputField
            name="title"
            type="text"
            placeholder="Enter snippet title"
            value={snippet?.title}
            readOnly={isReadOnly}
            onChange={(e) =>
              setSnippet(
                (prev: ISnippet) =>
                  ({ ...prev, title: e.target.value } as ISnippet)
              )
            }
            className="mt-1"
          />
        </div>
        {/* Description */}
        <div className="mb-3">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            name="description"
            placeholder="Enter snippet description"
            value={snippet?.description}
            readOnly={isReadOnly}
            onChange={(e) =>
              setSnippet(
                (prev: ISnippet) =>
                  ({ ...prev, description: e.target.value } as ISnippet)
              )
            }
            className="mt-1"
          />
        </div>
        {/* Code Block */}
        <div className="mb-3 w-full">
          <label className="text-sm font-medium">Code</label>
          <Textarea
            name="code"
            placeholder="Paste your code here"
            value={snippet?.code}
            readOnly={isReadOnly}
            onChange={(e) =>
              setSnippet(
                (prev: ISnippet) =>
                  ({ ...prev, code: e.target.value } as ISnippet)
              )
            }
            className="mt-1 bg-gray-900 text-white font-mono"
            rows={5}
          />
        </div>
        {/* Tags */}
        <div className="mb-3">
          <label className="text-sm font-medium">Tags</label>
          {/* Display Added Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {snippet?.tags?.map((tag, index) => (
              <span
                key={index}
                className="flex items-center bg-gray-200 px-2 py-1 rounded text-sm"
              >
                {tag}
                {!isReadOnly && (
                  <button
                    type="button"
                    className="ml-1 text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      setSnippet({
                        ...snippet,
                        tags: snippet.tags.filter((t) => t !== tag),
                      } as ISnippet);
                    }}
                  >
                    &#10005;
                  </button>
                )}
              </span>
            ))}
          </div>
          {/* Add Tag Input */}
          {!isReadOnly && (
            <div className="flex items-end gap-2 mt-1">
              <input
                type="text"
                placeholder="Enter tag"
                className="flex-1 p-1 text-xs border rounded"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <button
                type="button"
                className="flex items-center px-2 py-1 border rounded text-xs bg-gray-100 hover:bg-gray-200"
                onClick={() => {
                  if (
                    tagInput.trim() &&
                    !snippet?.tags?.includes(tagInput.trim())
                  ) {
                    setSnippet({
                      ...snippet,
                      tags: [...snippet.tags, tagInput.trim()],
                    } as ISnippet);
                    setTagInput("");
                  }
                }}
              >
                Add tag
              </button>
            </div>
          )}
        </div>

        {/* Folder Select Dropdown */}
        <div className="mb-3">
          <label className="text-sm font-medium">Parent folder</label>
          <select
            name="folder"
            value={snippet?.parentFolderId}
            disabled={isReadOnly}
            onChange={(e) =>
              setSnippet(
                (prev: ISnippet) =>
                  ({ ...prev, parentFolderId: e.target.value } as ISnippet)
              )
            }
            className="mt-1 px-2 py-1 border rounded w-full"
          >
            <option key="" value="">
              Select folder
            </option>
            {foldersList?.map((folder) => (
              <option key={folder?.folderId} value={folder?.folderId}>
                {folder?.title}
              </option>
            ))}

            {/* Add more folder options as needed */}
          </select>
        </div>
        {/* <div className="mb-3">
          <label className="text-sm font-medium">Created By</label>
          <span className="flex flex-wrap gap-2 mt-2">
            {" "}
            {snippet.createdBy}
          </span>
        </div> */}
        <div className="mb-3">
          <label className="text-sm font-medium">Created on</label>
          <span className="flex flex-wrap gap-2 mt-2">
            {snippet.createdAt &&
              format(new Date(snippet.createdAt), "MMMM dd, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}
