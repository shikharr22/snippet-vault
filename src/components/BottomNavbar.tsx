"use client";
import { useRouter, usePathname } from "next/navigation";
import { Home, History, Folder, Settings, Plus } from "lucide-react";
import { Button } from "@heroui/react";

export default function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 sm:py-3">
      <NavItem
        icon={<Home size={20} />}
        label="Home"
        active={pathname === "/dashboard"}
        onClick={() => router.push("/dashboard")}
      />
      <NavItem
        icon={<History size={20} />}
        label="Snippets"
        active={pathname === "/snippets"}
        onClick={() => router.push("/snippets")}
      />

      <div className="relative -mt-4">
        <Button
          isIconOnly
          className="bg-black text-white w-12 h-12 rounded-full shadow-lg hover:bg-gray-800"
          onPress={() => router.push("/add-new-snippet")}
        >
          <Plus size={24} />
        </Button>
      </div>

      <NavItem
        icon={<Folder size={20} />}
        label="Folders"
        active={pathname === "/folders"}
        onClick={() => router.push("/folders")}
      />
      <NavItem
        icon={<Settings size={20} />}
        label="Settings"
        active={pathname === "/settings"}
        onClick={() => router.push("/settings")}
      />
    </nav>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <Button
      variant="light"
      className={`flex flex-col items-center gap-1 p-2 h-auto min-w-0 ${
        active ? "text-black" : "text-gray-500"
      }`}
      onPress={onClick}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );
}
