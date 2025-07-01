"use client";
import React, { useState } from "react";

import { Plus, X } from "lucide-react";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import * as z from "zod";
import { newSnippetSchema } from "@/models/Snippet";

type INewSnippet = z.infer<typeof newSnippetSchema>;

export default function SnippetForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    code: "",
    tags: [],
  } as INewSnippet);
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  // const [errors, setErrors] = useState<Record<string, string>>({});

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
      const res = await fetch("/api/add-new-snippet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (res?.ok) {
        const data = await res?.json;
        console.log("Snippet saved successfully", data);
      }
    } catch (error) {
      console.error("Error saving snippet", error);
    }
  };

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
      {/* Save button */}
      <Button type="submit" className="bg-blue-500 text-white">
        Save
      </Button>

      {/* Folder */}
      {/* <Card className="mt-3">
        <CardContent className="p-3 flex items-center gap-2">
          <Folder size={18} />
          <span className="text-sm">JavaScript</span>
        </CardContent>
      </Card> */}
    </form>
  );
}
