// /features/editor/components/AddDocModal.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentStore } from "@/stores/documentStore";

interface AddDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function AddDocModal({ isOpen, onClose, projectId }: AddDocModalProps) {
  const [title, setTitle] = useState("");
  const { addDocument } = useDocumentStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const newDoc = await addDocument(projectId, title.trim());
      setTitle("");
      onClose();
      
      // Invalidate and refetch queries to ensure data is fresh
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["documents", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      ]);
      
      // Small delay to ensure backend has fully processed the request
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Navigate to the new document
      router.push(`/projects/${projectId}/docs/${newDoc.id}`);
    }
  };

  const handleClose = () => {
    setTitle("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <label
              htmlFor="doc-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Document Title
            </label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
