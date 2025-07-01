"use client";
import TopBar from "@/components/TopBar";
import "./globals.css";
import { usePathname } from "next/navigation";
import BottomNavbar from "@/components/BottomNavbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**pages config for app*/
  const pagesConfig: { [key: string]: { [key: string]: string | boolean } } = {
    "/": { label: "Welcome ", showBackButton: false },
    login: { label: "Login ", showBackButton: true },
    signup: { label: "Sign up", showBackButton: true },
    dashboard: { label: "Dashboard ", showBackButton: false },
    "add-new-snippet": { label: "Add new snippet ", showBackButton: true },
    snippet: { label: "Snippet", showBackButton: true },
  };

  /**get the page name from URL*/
  const pathname = usePathname();
  const currentPage = (pathname.split("/")[1] || "") as string;

  return (
    <html lang="en">
      <body>
        {pathname !== "/" ? (
          <TopBar
            sectionName={pagesConfig?.[currentPage]?.label as string}
            showBackButton={pagesConfig[currentPage]?.showBackButton as boolean}
          />
        ) : null}
        <main className="pt-16">
          {" "}
          {/* Adjust padding for fixed navbar */}
          {children}
        </main>
        {pathname !== "/" && pathname !== "/login" && pathname !== "/signup" ? (
          <BottomNavbar />
        ) : null}
      </body>
    </html>
  );
}
