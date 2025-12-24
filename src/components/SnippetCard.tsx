"use client";

import { Clipboard, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { apiDelete } from "@/lib/utils";
import { Card, CardBody, Button, Chip } from "@heroui/react";

interface SnippetCardProps {
  id: string;
  title: string;
  description: string;
  code: string;
  createdAt: Date;
  tags: string[];
  parentFolderName?: string;
  onSnippetDelete?: () => void;
}

// List of unique chip colors
const tagColors = ["primary", "secondary", "success", "warning", "danger"];

export default function SnippetCard({
  id,
  title,
  description,
  code,
  tags,
  createdAt,
  parentFolderName,
  onSnippetDelete,
}: SnippetCardProps) {
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSnippetCardClick = (id: string) => {
    router.push(`/snippet/${id}`);
  };

  // Copy code to clipboard
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopied(false);
    }
  };

  // Delete snippet
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/snippet/${id}`);
      if (onSnippetDelete) {
        onSnippetDelete();
      }
    } catch (error) {
      // Optionally show error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={() => handleSnippetCardClick(id)}
    >
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <div className="flex gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-500 hover:text-gray-700"
              onPress={handleCopy}
            >
              <Clipboard className="w-4 h-4" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-500 hover:text-red-500"
              onPress={handleDelete}
              isLoading={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        {tags && tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag, idx) => {
              const colorVariant = tagColors[idx % tagColors.length] as any;
              return (
                <Chip
                  key={tag}
                  size="sm"
                  variant="flat"
                  color={colorVariant}
                  className="text-xs"
                >
                  {tag}
                </Chip>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500">
          {parentFolderName && (
            <span className="font-medium">{parentFolderName}</span>
          )}
          <span>
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
