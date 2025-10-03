"use client";

import { Clipboard, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { apiDelete } from "@/lib/utils";

interface SnippetCardProps {
  id: string;
  title: string;
  description: string;
  code: string;
  createdAt: Date;
  tags: string[];
  parentFolderName: string;
  onSnippetDelete?: () => void;
}

// List of unique bg colors (Tailwind)
const tagColors = [
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-pink-200",
  "bg-purple-200",
  "bg-red-200",
  "bg-indigo-200",
  "bg-teal-200",
  "bg-orange-200",
  "bg-cyan-200",
  "bg-lime-200",
  "bg-fuchsia-200",
  "bg-rose-200",
  "bg-violet-200",
  "bg-emerald-200",
];

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
      className="relative p-4 bg-white rounded-lg flex flex-col gap-2 cursor-pointer"
      onClick={() => handleSnippetCardClick(id)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex justify-center items-center gap-5">
          <button
            className="flex gap-1 items-center text-blue-500 text-xs hover:underline"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete snippet"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2 flex-wrap">
          {tags?.map((tag, idx) => {
            // Assign a unique color for each tag, cycling if more tags than colors
            const colorClass = tagColors[idx % tagColors.length];
            return (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded ${colorClass}`}
              >
                {tag}
              </span>
            );
          })}
        </div>
        <button
          className="flex gap-1 items-center text-blue-500 text-xs hover:underline"
          onClick={handleCopy}
        >
          <Clipboard className="w-5 h-5" />
        </button>
      </div>

      <div className="text-xs text-gray-600">
        Folder:{" "}
        <span className="italic text-gray-800 uppercase">
          {parentFolderName}
        </span>
      </div>

      <div className="text-xs text-gray-800">
        <span className="text-xs text-gray-600">Created : </span>
        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </div>
    </div>
  );
}
