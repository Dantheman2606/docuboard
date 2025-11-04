// /components/Sidebar/ActivityButton.tsx
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityButtonProps {
  isSidebarOpen: boolean;
  onClick: () => void;
}

export function ActivityButton({ isSidebarOpen, onClick }: ActivityButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 mb-2 rounded-lg transition-all duration-200",
        "text-gray-700 dark:text-gray-300",
        "hover:bg-blue-50 dark:hover:bg-blue-900/20",
        "border border-transparent hover:border-blue-200 dark:hover:border-blue-800",
        isSidebarOpen ? "justify-start" : "justify-center"
      )}
      title={!isSidebarOpen ? "Activity Feed" : undefined}
    >
      <Activity className="w-5 h-5 flex-shrink-0" />
      {isSidebarOpen && (
        <span className="text-sm font-medium">Activity Feed</span>
      )}
    </button>
  );
}
