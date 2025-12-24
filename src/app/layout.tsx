"use client";
import TopBar from "@/components/TopBar";
import "./globals.css";
import { usePathname } from "next/navigation";
import BottomNavbar from "@/components/BottomNavbar";
import { HeroUIProvider } from "@heroui/react";

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
    folder: { label: "Folder", showBackButton: true },
    snippets: { label: "Snippets", showBackButton: true },
    folders: { label: "Folders", showBackButton: true },
  };

  /**get the page name from URL*/
  const pathname = usePathname();
  const currentPage = (pathname.split("/")[1] || "") as string;

  return (
    <html lang="en">
      <body>
        <HeroUIProvider>
          {pathname !== "/" ? (
            <TopBar
              sectionName={pagesConfig?.[currentPage]?.label as string}
              showBackButton={
                pagesConfig[currentPage]?.showBackButton as boolean
              }
            />
          ) : null}
          <main>{children}</main>
          {pathname !== "/" &&
          pathname !== "/login" &&
          pathname !== "/signup" ? (
            <BottomNavbar />
          ) : null}
        </HeroUIProvider>
      </body>
    </html>
  );
}
