"use client";
import React, { useEffect, useMemo, useState } from "react";
import { apiPost, apiGet } from "@/lib/utils";

import { Plus, X } from "lucide-react";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import * as z from "zod";
import { IFolder } from "@/models/Folder";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newSnippetSchema } from "@/lib/validations";
import { debounce } from "lodash";

type INewSnippet = z.infer<typeof newSnippetSchema>;

export default function SnippetForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<INewSnippet>({
    resolver: zodResolver(newSnippetSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      tags: [],
      parentFolderId: "",
    },
  });
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [foldersList, setFoldersList] = useState<IFolder[]>([] as IFolder[]);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);

  const router = useRouter();

  const tags = watch("tags");

  /**method to add tags */
  const addTag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!showTagsInput) {
      setShowTagsInput(true);
    } else {
      if (tagInput.trim() && !tags?.includes(tagInput)) {
        setValue("tags", [...(tags as string[]), tagInput.trim()]);
        setTagInput("");
      }
      setShowTagsInput(false);
    }
  };

  /**method to remove tags */
  const removeTag = (tagToRemove: string) => {
    const newTags = tags?.filter((tag: string) => tag != tagToRemove);
    setValue("tags", newTags);

    if (newTags?.length === 0) {
      setShowTagsInput(false);
    }
  };

  const onSubmit = async (data: Partial<INewSnippet>) => {
    try {
      const res = await apiPost("/api/add-new-snippet", data);
      console.log("Snippet saved successfully", res);
      reset();
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

  /**method to check title redundancy */
  const checkDuplicateTitle = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value) {
          setIsDuplicate(false);
          return;
        }

        try {
          const res = await apiGet(
            `/api/check-title-redundancy?title=${encodeURIComponent(value)}`
          );
          setIsDuplicate(res?.exists);
        } catch {
          setIsDuplicate(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    fetchFoldersList();
  }, []);

  return (
    <form className="max-w-md mx-auto  p-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Title */}
      <div className="mb-3">
        <label className="text-sm font-medium">Title</label>
        <InputField
          {...register("title")}
          type="text"
          placeholder="Enter snippet title"
          className="mt-1"
          onChange={(e) => {
            checkDuplicateTitle(e.target.value);
          }}
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
        )}
        {isDuplicate && (
          <p className="text-red-500 text-xs mt-1">Title already exists</p>
        )}
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          {...register("description")}
          placeholder="Enter snippet description"
          className="mt-1"
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Code Block */}
      <div className="mb-3">
        <label className="text-sm font-medium">Code</label>
        <Textarea
          {...register("code")}
          placeholder="Paste your code here"
          className="mt-1 bg-gray-900 text-white font-mono"
          rows={5}
        />
        {errors.code && (
          <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
        )}
      </div>

      {/* Tags */}
      <div className="mb-3">
        <label className="text-sm font-medium">Tags</label>
        {/* Display Added Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {tags?.map((tag: string, index: number) => (
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
          {...register("parentFolderId")}
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
