"use client";
import { useRouter, usePathname } from "next/navigation";
import { Home, History, Folder, Settings, Plus } from "lucide-react";

export default function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t flex justify-around items-center py-3 sm:py-4">
      <NavItem
        icon={
          <Home
            size={24}
            className={
              pathname === "/dashboard" ? "text-blue-600 font-medium" : ""
            }
          />
        }
        label="Home"
        active={pathname === "/dashboard"}
        onClick={() => router.push("/dashboard")}
      />
      <NavItem
        icon={
          <History
            size={24}
            className={
              pathname === "/snippets" ? "text-blue-600 font-medium" : ""
            }
          />
        }
        label="All snippets"
        active={pathname === "/snippets"}
        onClick={() => router.push("/snippets")}
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
        icon={
          <Folder
            size={24}
            className={
              pathname === "/folders" ? "text-blue-600 font-medium" : ""
            }
          />
        }
        label="Folders"
        active={pathname === "/folders"}
        onClick={() => router.push("/folders")}
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
      <span className={active ? "text-blue-600" : ""}>{icon}</span>
      <span className={active ? "text-blue-600 text-xs mt-1" : "text-xs mt-1"}>
        {label}
      </span>
    </button>
  );
}
