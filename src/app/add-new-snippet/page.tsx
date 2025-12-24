"use client";
import React, { useEffect, useMemo, useState } from "react";
import { apiPost, apiGet } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import * as z from "zod";
import { IFolder } from "@/models/Folder";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newSnippetSchema } from "@/lib/validations";
import { debounce } from "lodash";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";

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
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 flex justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Add New Snippet
            </h1>
            <p className="text-gray-600">Create and save your code snippet</p>
          </CardHeader>
          <CardBody className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <Input
                {...register("title")}
                label="Title"
                placeholder="Enter snippet title"
                variant="flat"
                isInvalid={!!errors.title || isDuplicate}
                errorMessage={
                  errors.title?.message ||
                  (isDuplicate ? "Title already exists" : "")
                }
                onChange={(e) => {
                  checkDuplicateTitle(e.target.value);
                }}
              />

              {/* Description */}
              <Textarea
                {...register("description")}
                label="Description"
                placeholder="Enter snippet description"
                variant="flat"
                isInvalid={!!errors.description}
                errorMessage={errors.description?.message}
                minRows={3}
              />

              {/* Code Block */}
              <Textarea
                {...register("code")}
                label="Code"
                placeholder="Paste your code here"
                variant="flat"
                isInvalid={!!errors.code}
                errorMessage={errors.code?.message}
                classNames={{
                  input: "bg-gray-900 text-gray-100 font-mono text-sm",
                  inputWrapper: "bg-gray-900",
                }}
                minRows={8}
              />

              {/* Tags */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Tags
                </label>

                {/* Display Added Tags */}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, index: number) => (
                      <Chip
                        key={index}
                        onClose={() => removeTag(tag)}
                        variant="flat"
                        color="primary"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="flex gap-2">
                  {showTagsInput && (
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter tag"
                      variant="flat"
                      size="sm"
                      className="flex-1"
                    />
                  )}
                  <Button
                    variant={showTagsInput ? "solid" : "flat"}
                    color="primary"
                    size="sm"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={addTag}
                  >
                    {showTagsInput ? "Add" : "Add Tag"}
                  </Button>
                </div>
              </div>

              {/* Parent Folder */}
              <Select
                {...register("parentFolderId")}
                label="Parent Folder"
                placeholder="Select a folder"
                variant="flat"
              >
                {foldersList?.map((folder) => (
                  <SelectItem key={folder.folderId} value={folder.folderId}>
                    {folder.title}
                  </SelectItem>
                ))}
              </Select>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="light"
                  onPress={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-black text-white flex-1"
                  size="lg"
                >
                  Save Snippet
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
