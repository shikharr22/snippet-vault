import { Folder } from "lucide-react";

interface FolderCardProps {
  id: string;
  name: string;
  snippetCount: number;
}

export default function FolderCard({ name, snippetCount }: FolderCardProps) {
  return (
    <div className="flex flex-col justify-between p-3 w-32 h-24 bg-white rounded-lg shrink-0">
      <Folder className={`w-5 h-5 mb-2 text-blue-600`} />
      <p className="text-sm font-small w-full truncate">{name}</p>
      <p className="text-xs text-gray-500">{snippetCount} snippets</p>
    </div>
  );
}
