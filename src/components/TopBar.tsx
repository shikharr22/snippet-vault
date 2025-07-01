"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TopBar = ({
  sectionName,
  showBackButton,
}: {
  sectionName: string;
  showBackButton: boolean;
}) => {
  const router = useRouter();
  console.log("sectionName", sectionName);
  return (
    <div className="flex items-center bg-white shadow-md px-3 py-2 md:px-4 md:py-3 fixed top-0 left-0 right-0 z-50">
      {showBackButton && (
        <button
          className="p-2 rounded-full hover:bg-gray-100 transition md:p-3"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}
      <h1 className="text-lg md:text-xl font-semibold ml-4">{sectionName}</h1>
    </div>
  );
};

export default TopBar;
