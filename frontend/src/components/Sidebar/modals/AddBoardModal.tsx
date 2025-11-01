// components/Sidebar/modals/AddBoardModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (boardName: string) => void;
}

export function AddBoardModal({ isOpen, onClose, onSubmit }: AddBoardModalProps) {
  const [boardName, setBoardName] = useState("");

  const handleSubmit = () => {
    if (boardName.trim()) {
      onSubmit(boardName);
      setBoardName("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Kanban Board</DialogTitle>
          <DialogDescription>
            Enter a name for your new Kanban board.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Board name"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!boardName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
