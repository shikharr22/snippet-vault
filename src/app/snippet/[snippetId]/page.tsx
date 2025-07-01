"use client";
import { InputField } from "@/components/InputField";
import { Textarea } from "@/components/Textarea";
import { ISnippet } from "@/models/Snippet";
import { format } from "date-fns";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Snippet() {
  const pathname = usePathname();
  const [snippet, setSnippet] = useState<ISnippet>({} as ISnippet);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);

  useEffect(() => {
    const fetchSnippet = async () => {
      setIsLoading(true);
      try {
        const snippetId = pathname?.split("/").pop() as string;

        const response = await fetch(`/api/snippet/${snippetId}`);
        const data = await response.json();

        setSnippet(data);
      } catch (error) {
        console.error("Something went wrong", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippet();
  }, [pathname]);

  const handleEdit = () => {
    setIsReadOnly(false);
  };

  const handleSave = async () => {
    try {
      const snippetId = pathname?.split("/").pop() as string;

      await fetch(`/api/snippet/${snippetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snippet),
      });

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
    <>
      <div className="sticky top-0 bg-white z-10 p-4 shadow-md">
        Snippet details
      </div>
      <div className="flex flex-col items-start justify-start min-h-screen p-4 overflow-y-auto">
        <div className="mb-3">
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
          {snippet?.tags?.length ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {snippet?.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center bg-gray-200 px-2 py-1 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div>No tags found</div>
          )}
        </div>
        <div className="mb-3">
          <label className="text-sm font-medium">Created By</label>
          <span className="flex flex-wrap gap-2 mt-2">
            {" "}
            {snippet.createdBy}
          </span>
        </div>
        <div className="mb-3">
          <label className="text-sm font-medium">Created on</label>
          <span className="flex flex-wrap gap-2 mt-2">
            {snippet.createdAt &&
              format(new Date(snippet.createdAt), "MMMM dd, yyyy")}
          </span>
        </div>
        <div className="flex justify-center items-center w-full mt-4">
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
    </>
  );
}
