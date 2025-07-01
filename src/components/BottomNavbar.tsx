"use client";
import { useRouter } from "next/navigation";
import { Home, History, Folder, Settings, Plus } from "lucide-react";

export default function BottomNavbar() {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t flex justify-around items-center py-3 sm:py-4">
      <NavItem
        icon={<Home size={24} />}
        label="Home"
        active
        onClick={() => router.push("/dashboard")}
      />
      <NavItem
        icon={<History size={24} />}
        label="Recent"
        onClick={() => router.push("/recent")}
      />

      <div className="relative -mt-6">
        <button
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition"
          onClick={() => router.push("/add-new-snippet")}
        >
          <Plus size={28} />
        </button>
      </div>

      <NavItem
        icon={<Folder size={24} />}
        label="Folders"
        onClick={() => router.push("/folders")}
      />
      <NavItem
        icon={<Settings size={24} />}
        label="Settings"
        onClick={() => router.push("/settings")}
      />
    </nav>
  );
}

/**component for each navbar item */
function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex flex-col items-center text-gray-500 hover:text-blue-600 transition ${
        active ? "text-blue-600 font-medium" : ""
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
