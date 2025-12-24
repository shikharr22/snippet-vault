"use client";
import { IFolder } from "@/models/Folder";
import { ISnippet } from "@/models/Snippet";
import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { apiPut } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Edit, Save, Calendar, Plus } from "lucide-react";
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
  Spinner,
} from "@heroui/react";

export default function Snippet() {
  const pathname = usePathname();
  const [snippet, setSnippet] = useState<ISnippet>({} as ISnippet);
  const [foldersList, setFoldersList] = useState<IFolder[]>([] as IFolder[]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  // Tag input state for editing tags
  const [tagInput, setTagInput] = useState("");
  const [showTagsInput, setShowTagsInput] = useState(false);

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
      setIsReadOnly(true);
    } catch (error) {
      console.error("Failed to save snippet", error);
    }
  };

  /**method to add tags */
  const addTag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!showTagsInput) {
      setShowTagsInput(true);
    } else {
      if (tagInput.trim() && !snippet?.tags?.includes(tagInput)) {
        setSnippet({
          ...snippet,
          tags: [...(snippet.tags || []), tagInput.trim()],
        } as ISnippet);
        setTagInput("");
      }
      setShowTagsInput(false);
    }
  };

  /**method to remove tags */
  const removeTag = (tagToRemove: string) => {
    const newTags = snippet?.tags?.filter((tag: string) => tag !== tagToRemove);
    setSnippet({
      ...snippet,
      tags: newTags,
    } as ISnippet);

    if (newTags?.length === 0) {
      setShowTagsInput(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-lg text-gray-700">Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (!snippet.snippetId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-700">Snippet not found.</p>
          <Button
            color="primary"
            variant="flat"
            className="mt-4"
            onPress={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 flex justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Snippet Details
              </h1>
              <p className="text-gray-600">View and edit your code snippet</p>
            </div>
            <div className="flex gap-2">
              {isReadOnly ? (
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Edit className="w-4 h-4" />}
                  onPress={handleEdit}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  className="bg-black text-white"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={handleSave}
                >
                  Save
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Title */}
            <Input
              label="Title"
              placeholder="Enter snippet title"
              variant="flat"
              value={snippet?.title || ""}
              isReadOnly={isReadOnly}
              onChange={(e) =>
                setSnippet(
                  (prev: ISnippet) =>
                    ({ ...prev, title: e.target.value } as ISnippet)
                )
              }
            />

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Enter snippet description"
              variant="flat"
              value={snippet?.description || ""}
              isReadOnly={isReadOnly}
              onChange={(e) =>
                setSnippet(
                  (prev: ISnippet) =>
                    ({ ...prev, description: e.target.value } as ISnippet)
                )
              }
              minRows={3}
            />

            {/* Code Block */}
            <Textarea
              label="Code"
              placeholder="Paste your code here"
              variant="flat"
              value={snippet?.code || ""}
              isReadOnly={isReadOnly}
              onChange={(e) =>
                setSnippet(
                  (prev: ISnippet) =>
                    ({ ...prev, code: e.target.value } as ISnippet)
                )
              }
              classNames={{
                input: "bg-gray-900 text-gray-100 font-mono text-sm",
                inputWrapper: "bg-gray-900",
              }}
              minRows={8}
            />

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Tags</label>

              {/* Display Added Tags */}
              {snippet?.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag: string, index: number) => (
                    <Chip
                      key={index}
                      onClose={!isReadOnly ? () => removeTag(tag) : undefined}
                      variant="flat"
                      color="primary"
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              {!isReadOnly && (
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
              )}
            </div>

            {/* Parent Folder */}
            <Select
              label="Parent Folder"
              placeholder="Select a folder"
              variant="flat"
              selectedKeys={
                snippet?.parentFolderId ? [snippet.parentFolderId] : []
              }
              isDisabled={isReadOnly}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                setSnippet(
                  (prev: ISnippet) =>
                    ({ ...prev, parentFolderId: selectedKey } as ISnippet)
                );
              }}
            >
              {foldersList?.map((folder) => (
                <SelectItem key={folder.folderId} value={folder.folderId}>
                  {folder.title}
                </SelectItem>
              ))}
            </Select>

            {/* Metadata */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                  Created on
                </label>
                <span className="text-sm text-gray-600">
                  {snippet.createdAt &&
                    format(new Date(snippet.createdAt), "MMMM dd, yyyy")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="light"
                onPress={() => router.back()}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                color="primary"
                variant="flat"
                onPress={() => router.push("/dashboard")}
                className="flex-1"
              >
                Dashboard
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
