// /features/editor/components/toolbarComponents/FontOptions.tsx
import { Editor } from "@tiptap/react";
import { Type } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface FontOptionsProps {
  editor: Editor;
}

const fontFamilies = [
  { name: "Default", value: "" },
  { name: "Sans Serif", value: "ui-sans-serif, system-ui, sans-serif" },
  { name: "Serif", value: "ui-serif, Georgia, serif" },
  { name: "Monospace", value: "ui-monospace, monospace" },
  { name: "Comic Sans", value: "Comic Sans MS, cursive" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Courier", value: "Courier New, monospace" },
];

export function FontOptions({ editor }: FontOptionsProps) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const setFontFamily = (fontFamily: string) => {
    if (fontFamily) {
      editor.chain().focus().setFontFamily(fontFamily).run();
    } else {
      editor.chain().focus().unsetFontFamily().run();
    }
    setShowFontMenu(false);
  };

  const currentFont = editor.getAttributes("textStyle").fontFamily || "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFontMenu(false);
      }
    };

    if (showFontMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFontMenu]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowFontMenu(!showFontMenu)}
        className="h-8 px-2 gap-1"
        title="Font Family"
      >
        <Type size={16} />
        <span className="text-xs max-w-[60px] truncate">
          {fontFamilies.find((f) => f.value === currentFont)?.name || "Font"}
        </span>
      </Button>

      {showFontMenu && (
        <div className="absolute top-full left-0 mt-1 z-50 flex flex-col bg-white dark:bg-slate-800 rounded-md border shadow-lg p-1 min-w-[180px]">
          {fontFamilies.map((font) => (
            <Button
              key={font.value}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFontFamily(font.value)}
              className={`justify-start h-8 px-3 text-sm ${
                currentFont === font.value
                  ? "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                  : ""
              }`}
              style={{ fontFamily: font.value || "inherit" }}
            >
              {font.name}
            </Button>
          ))}
          <div className="border-t my-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFontMenu(false)}
            className="h-7 px-3 text-xs"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
