"use client";
import { Clipboard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface SnippetCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  tags: string[];
}

export default function SnippetCard({
  id,
  title,
  description,
  tags,
  createdAt,
}: SnippetCardProps) {
  const router = useRouter();

  const handleSnippetCardClick = (id: string) => {
    router.push(`/snippet/${id}`);
  };

  return (
    <div
      className="p-4 bg-white rounded-lg flex flex-col gap-1"
      onClick={() => handleSnippetCardClick(id)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
      <div className="flex justify-between items-center mt-2">
        {tags?.map((tag) => (
          <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">
            {tag}
          </span>
        ))}

        <button className="flex gap-1 items-center text-blue-500 text-xs hover:underline">
          <Clipboard className="w-4 h-4" />
          Copy
        </button>
      </div>
    </div>
  );
}
