import { Clipboard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SnippetCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  tag: string;
}

export default function SnippetCard({
  title,
  description,
  tag,
  createdAt,
}: SnippetCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{tag}</span>
        <button className="flex gap-1 items-center text-blue-500 text-xs hover:underline">
          <Clipboard className="w-4 h-4" />
          Copy
        </button>
      </div>
    </div>
  );
}
