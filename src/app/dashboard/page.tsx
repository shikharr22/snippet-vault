"use client";
import FolderCard from "@/components/FolderCard";
import SnippetCard from "@/components/SnippetCard";
import { IFolder } from "@/models/Folder";
import { ISnippet } from "@/models/Snippet";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Skeleton,
  useDisclosure,
} from "@heroui/react";

export default function DashboardPage() {
  /**Folders state */
  const [folders, setFolders] = useState([] as IFolder[]);
  const [isFoldersLoading, setisFoldersLoading] = useState(false);

  /**Snippets state */
  const [snippets, setSnippets] = useState([] as ISnippet[]);
  const [isSnippetsLoading, setisSnippetsLoading] = useState(false);

  // Modal state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newFolderName, setNewFolderName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  /**fetch folders */
  const fetchFolders = async () => {
    setisFoldersLoading(true);
    try {
      const res = await fetch("api/folders", { credentials: "include" });
      const data = await res.json();

      setFolders(data);
    } catch (error) {
      console.error("Error fetching snippets:", error);
    } finally {
      setisFoldersLoading(false);
    }
  };

  /**fetch snippets */
  const fetchSnippets = async () => {
    setisSnippetsLoading(true);
    try {
      const res = await fetch("api/snippets?limit=3", {
        credentials: "include",
      });
      const data = await res.json();

      setSnippets(data?.items);
    } catch (error) {
      console.error("Error fetching snippets:", error);
    } finally {
      setisSnippetsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchSnippets();
  }, []);

  const handleAddFolder = () => {
    onOpen();
  };

  const handleCancel = () => {
    onOpenChange();
    setNewFolderName("");
  };

  const handleSave = async () => {
    if (!newFolderName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderName: newFolderName }),
        credentials: "include",
      });
      if (res.ok) {
        fetchFolders();
        onOpenChange();
        setNewFolderName("");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnippetDelete = () => {
    fetchSnippets();
    fetchFolders();
  };

  const handleFolderDelete = () => {
    fetchFolders();
  };

  return (
    <div className="p-24 w-full mx-auto min-h-screen">
      {/* Modal for adding folder */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-lg font-semibold">
                Add New Folder
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Folder Name"
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  isDisabled={isSaving}
                  variant="flat"
                  autoFocus
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  className="bg-black text-white"
                  onPress={handleSave}
                  isLoading={isSaving}
                >
                  Create Folder
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Folders Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Folders</h2>
        <Button
          isIconOnly
          variant="flat"
          className="bg-gray-100 hover:bg-gray-200"
          onPress={handleAddFolder}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {/* Folder cards */}
        {isFoldersLoading
          ? Array(4)
              .fill(null)
              .map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardBody className="p-4">
                    <Skeleton className="w-full h-16 rounded" />
                  </CardBody>
                </Card>
              ))
          : folders?.map((folder: IFolder) => (
              <FolderCard
                key={folder.folderId}
                id={folder.folderId}
                name={folder.title}
                snippetCount={folder.totalSnippets}
                onFolderDelete={handleFolderDelete}
              />
            ))}
      </div>

      {/* Recent Snippets Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Recent Snippets
        </h2>
        <Button
          variant="light"
          className="text-gray-600 font-medium"
          onPress={() => router.push("/snippets")}
        >
          See all
        </Button>
      </div>
      <div
        className="
          grid gap-4 max-h-76 overflow-y-auto scrollbar-hide
          grid-cols-1
          lg:grid-cols-2
        "
      >
        {/* Recent snippet cards */}
        {isSnippetsLoading ? (
          Array(3)
            .fill(null)
            .map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardBody className="p-4 space-y-3">
                  <Skeleton className="w-3/4 h-5 rounded" />
                  <Skeleton className="w-full h-16 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="w-16 h-6 rounded-full" />
                    <Skeleton className="w-20 h-6 rounded-full" />
                  </div>
                </CardBody>
              </Card>
            ))
        ) : snippets.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500 py-8">
            No snippets found.
          </div>
        ) : (
          snippets?.map((snippet: ISnippet) => (
            <SnippetCard
              key={snippet?.snippetId}
              id={snippet?.snippetId}
              title={snippet?.title}
              description={snippet?.description}
              code={snippet?.code}
              createdAt={snippet?.createdAt}
              tags={snippet?.tags}
              parentFolderName={snippet?.parentFolderName}
              onSnippetDelete={handleSnippetDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
