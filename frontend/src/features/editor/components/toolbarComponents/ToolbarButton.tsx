// /features/editor/components/toolbarComponents/ToolbarButton.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  icon,
  label,
  className,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-primary/10 text-primary",
        className
      )}
      title={label}
    >
      {icon}
    </Button>
  );
}
