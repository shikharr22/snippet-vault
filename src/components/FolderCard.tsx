import { Folder, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiDelete } from "@/lib/utils";

interface FolderCardProps {
  id: string;
  name: string;
  snippetCount: number;
  onFolderDelete?: () => void;
}

export default function FolderCard({
  id,
  name,
  snippetCount,
  onFolderDelete,
}: FolderCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/folder/${id}`);
      if (onFolderDelete) {
        onFolderDelete();
      }
    } catch (error) {
      // Optionally show error
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/folder/${id}`);
  };

  return (
    <div
      className="relative flex flex-col justify-between p-3 w-32 h-24 bg-white rounded-lg shrink-0 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Delete Button */}
      <button
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete folder"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
      <Folder className={`w-5 h-5 mb-2 text-blue-600`} />
      <p className="text-sm font-small w-full truncate">{name}</p>
      <p className="text-xs text-gray-500">{snippetCount} snippets</p>
    </div>
  );
}
