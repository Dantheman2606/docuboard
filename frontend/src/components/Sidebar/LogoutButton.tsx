// components/Sidebar/LogoutButton.tsx
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  isSidebarOpen: boolean;
}

export function LogoutButton({ isSidebarOpen }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="border-t p-2 mt-auto">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
          !isSidebarOpen && "justify-center px-2"
        )}
        onClick={handleLogout}
        aria-label="Logout"
      >
        <LogOut size={18} />
        {isSidebarOpen && <span>Logout</span>}
      </Button>
    </div>
  );
}
