import { Button } from "@/components/ui/button";
import { Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";

interface ProjectSettingsButtonProps {
  isSidebarOpen: boolean;
  projectId: string;
}

export function ProjectSettingsButton({ isSidebarOpen, projectId }: ProjectSettingsButtonProps) {
  const router = useRouter();

  return (
    <div className="px-2">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 text-gray-700 hover:text-black hover:bg-gray-100",
          !isSidebarOpen && "justify-center px-2"
        )}
        onClick={() => router.push(`/projects/${projectId}/settings`)}
        aria-label="Project settings"
      >
        <Sliders size={18} />
        {isSidebarOpen && <span>Project Settings</span>}
      </Button>
    </div>
  );
}
