// components/Sidebar/BackToProjectsButton.tsx
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackToProjectsButtonProps {
  isSidebarOpen: boolean;
  onNavigate: () => void;
}

export function BackToProjectsButton({ isSidebarOpen, onNavigate }: BackToProjectsButtonProps) {
  return (
    <div className="px-2 py-2 border-b">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          !isSidebarOpen && "justify-center px-2"
        )}
        onClick={onNavigate}
        aria-label="Back to projects"
      >
        <Home size={18} />
        {isSidebarOpen && <span>All Projects</span>}
      </Button>
    </div>
  );
}
