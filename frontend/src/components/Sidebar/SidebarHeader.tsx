// components/Sidebar/SidebarHeader.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  projectName?: string;
  isSidebarOpen: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ projectName, isSidebarOpen, onToggle }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <h2 className={cn("font-semibold text-lg truncate", !isSidebarOpen && "hidden")}>
        {projectName || "Untitled Project"}
      </h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="text-muted-foreground"
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </Button>
    </div>
  );
}
