import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";

interface SettingsButtonProps {
  isSidebarOpen: boolean;
}

export function SettingsButton({ isSidebarOpen }: SettingsButtonProps) {
  const router = useRouter();

  return (
    <div className="px-2">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 text-gray-700 hover:text-black hover:bg-gray-100",
          !isSidebarOpen && "justify-center px-2"
        )}
        onClick={() => router.push("/settings")}
        aria-label="Account settings"
      >
        <Settings size={18} />
        {isSidebarOpen && <span>Settings</span>}
      </Button>
    </div>
  );
}
