import { Clipboard } from "lucide-react";

interface SnippetCardProps {
  id: string;
  title: string;
  description: string;
  tag: string;
}

export default function SnippetCard({
  title,
  description,
  tag,
}: SnippetCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-gray-500">{tag}</span>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
      <button className="mt-2 flex gap-4 items-center text-blue-500 text-xs hover:underline">
        <span className="flex">
          <Clipboard className="w-4 h-4 mr-1" /> Copy
        </span>
      </button>
    </div>
  );
}
