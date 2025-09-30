"use client";
import React, { useEffect, useState } from "react";
import { apiPost, apiGet } from "@/lib/utils";

import { Plus, X } from "lucide-react";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import * as z from "zod";
import { newSnippetSchema } from "@/models/Snippet";
import { IFolder } from "@/models/Folder";
import { useRouter } from "next/navigation";

type INewSnippet = z.infer<typeof newSnippetSchema>;

export default function SnippetForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    code: "",
    tags: [],
    parentFolderId: "",
  } as INewSnippet);
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [foldersList, setFoldersList] = useState<IFolder[]>([] as IFolder[]);
  const router = useRouter();

  /**method to add tags */
  const addTag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!showTagsInput) {
      setShowTagsInput(true);
    } else {
      if (tagInput.trim() && !form?.tags?.includes(tagInput)) {
        setForm({ ...form, tags: [...form?.tags, tagInput.trim()] });
        setTagInput("");
      }
      setShowTagsInput(false);
    }
  };

  /**method to remove tags */
  const removeTag = (tagToRemove: string) => {
    setForm(() => {
      if (form?.tags?.length === 1) {
        setShowTagsInput(false);
      }
      return {
        ...form,
        tags: form?.tags?.filter((tag) => tag !== tagToRemove),
      };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e?.target?.name]: e?.target?.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await apiPost("/api/add-new-snippet", form);
      console.log("Snippet saved successfully", data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving snippet", error);
    }
  };

  const fetchFoldersList = async () => {
    try {
      const data = await apiGet("/api/folders");
      setFoldersList(data);
    } catch (error) {
      console.error("Something went wrong", error);
    }
  };

  useEffect(() => {
    fetchFoldersList();
  }, []);

  return (
    <form className="max-w-md mx-auto  p-4" onSubmit={handleSubmit}>
      {/* Title */}
      <div className="mb-3">
        <label className="text-sm font-medium">Title</label>
        <InputField
          name="title"
          type="text"
          placeholder="Enter snippet title"
          value={form?.title}
          onChange={handleChange}
          className="mt-1"
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          name="description"
          placeholder="Enter snippet description"
          value={form?.description}
          onChange={handleChange}
          className="mt-1"
        />
      </div>

      {/* Code Block */}
      <div className="mb-3">
        <label className="text-sm font-medium">Code</label>
        <Textarea
          name="code"
          placeholder="Paste your code here"
          value={form?.code}
          onChange={handleChange}
          className="mt-1 bg-gray-900 text-white font-mono"
          rows={5}
        />
      </div>

      {/* Tags */}
      <div className="mb-3">
        <label className="text-sm font-medium">Tags</label>
        {/* Display Added Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {form?.tags?.map((tag, index) => (
            <span
              key={index}
              className="flex items-center bg-gray-200 px-2 py-1 rounded text-sm"
            >
              {tag}
              <X
                size={14}
                className="ml-1 cursor-pointer text-gray-600 hover:text-gray-800"
                onClick={() => removeTag(tag)}
              />
            </span>
          ))}
        </div>
        <div className="flex items-end gap-2 mt-1">
          {showTagsInput ? (
            <InputField
              name="tags"
              type="text"
              placeholder="Enter tag"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
              }}
              className="flex-1 p-1 text-xs"
            />
          ) : null}
          <Button
            className="flex items-center mt-2"
            variant="outline"
            size="sm"
            onClick={addTag}
          >
            <Plus size={18} className="" />
            {showTagsInput ? null : <span>Add tag</span>}
          </Button>
        </div>
      </div>
      <div className="mb-3">
        <label className="text-sm font-medium">Parent folder</label>

        <select
          name="folder"
          value={form?.parentFolderId}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, parentFolderId: e.target.value }))
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
      {/* Save button */}
      <Button type="submit" className="bg-blue-500 text-white">
        Save
      </Button>
    </form>
  );
}
