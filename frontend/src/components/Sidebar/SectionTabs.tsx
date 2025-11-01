// components/Sidebar/SectionTabs.tsx
import { FileText, Grid } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionTabsProps {
  activeSection: "docs" | "kanban";
  isSidebarOpen: boolean;
  onSectionChange: (section: "docs" | "kanban") => void;
}

export function SectionTabs({ activeSection, isSidebarOpen, onSectionChange }: SectionTabsProps) {
  return (
    <div className="flex justify-around py-2 border-b">
      <button
        className={cn(
          "flex items-center gap-2",
          isSidebarOpen ? "w-28 px-3" : "w-12 justify-center",
          "h-8 rounded-md text-sm font-medium transition-all",
          activeSection === "docs"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-primary"
        )}
        onClick={() => onSectionChange("docs")}
        aria-label="Documents section"
      >
        <FileText size={20} />
        {isSidebarOpen && <span>Docs</span>}
      </button>

      <button
        className={cn(
          "flex items-center gap-2",
          isSidebarOpen ? "w-28 px-3" : "w-12 justify-center",
          "h-8 rounded-md text-sm font-medium transition-all",
          activeSection === "kanban"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-primary"
        )}
        onClick={() => onSectionChange("kanban")}
        aria-label="Kanban section"
      >
        <Grid size={20} />
        {isSidebarOpen && <span>Kanban</span>}
      </button>
    </div>
  );
}
