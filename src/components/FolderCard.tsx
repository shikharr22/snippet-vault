import { Folder, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiDelete } from "@/lib/utils";
import { Card, CardBody, Button } from "@heroui/react";

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
    <Card
      className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-32 h-28"
      isPressable
      onPress={handleCardClick}
    >
      <CardBody className="p-3 flex flex-col justify-between relative">
        {/* Delete Button */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="absolute top-1 right-1 w-6 h-6 min-w-0 text-gray-400 hover:text-red-500"
          onPress={handleDelete}
          isLoading={isDeleting}
        >
          <Trash2 className="w-3 h-3" />
        </Button>

        <Folder className="w-6 h-6 text-gray-600 mb-2" />
        <div>
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500">{snippetCount} snippets</p>
        </div>
      </CardBody>
    </Card>
  );
}
