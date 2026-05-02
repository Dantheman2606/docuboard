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
import { api } from "@/lib/api";

interface AddDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function AddDocModal({ isOpen, onClose, projectId }: AddDocModalProps) {
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { setDocument } = useDocumentStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isCreating) return;

    setIsCreating(true);
    try {
      // Call the backend directly so we get the real MongoDB ObjectId back
      const newDoc = await api.createDocument({
        title: title.trim(),
        content: "",
        projectId,
      });

      // Persist the new document in the local store so the editor can load it immediately
      setDocument({
        id: newDoc.id,
        title: newDoc.title,
        content: newDoc.content || "",
        projectId: newDoc.projectId,
        createdAt: newDoc.createdAt,
        updatedAt: newDoc.updatedAt,
      });

      setTitle("");
      onClose();

      // Invalidate queries so the sidebar refreshes with the new doc
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["documents", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      ]);

      // Navigate to the new document using the real backend ID
      router.push(`/projects/${projectId}/docs/${newDoc.id}`);
    } catch (err: any) {
      console.error("Failed to create document:", err);
    } finally {
      setIsCreating(false);
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
              disabled={isCreating}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isCreating}>
              {isCreating ? "Creating..." : "Create Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
