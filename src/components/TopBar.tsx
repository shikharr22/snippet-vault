"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@heroui/react";

const TopBar = ({
  sectionName,
  showBackButton,
}: {
  sectionName: string;
  showBackButton: boolean;
}) => {
  const router = useRouter();

  return (
    <div className="flex items-center bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center w-full">
        {showBackButton && (
          <Button
            isIconOnly
            variant="light"
            className="mr-3"
            onPress={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-xl font-semibold text-gray-900">{sectionName}</h1>
        <div className="ml-auto">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push("/settings")}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
