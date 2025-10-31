// /features/editor/components/toolbarComponents/LinkManagement.tsx
import { Editor } from "@tiptap/react";
import { Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToolbarButton } from "./ToolbarButton";

interface LinkManagementProps {
  editor: Editor;
}

export function LinkManagement({ editor }: LinkManagementProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const setLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    // Add https:// if no protocol is specified
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().setLink({ href: url }).run();
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  if (showLinkInput) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          placeholder="Enter URL..."
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setLink();
            }
            if (e.key === "Escape") {
              setShowLinkInput(false);
              setLinkUrl("");
            }
          }}
          className="h-7 px-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
        <Button
          type="button"
          size="sm"
          onClick={setLink}
          className="h-7 px-2 text-xs"
        >
          Add
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setShowLinkInput(false);
            setLinkUrl("");
          }}
          className="h-7 px-2 text-xs"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          setLinkUrl(previousUrl || "");
          setShowLinkInput(true);
        }}
        isActive={editor.isActive("link")}
        icon={<LinkIcon size={16} />}
        label="Add Link"
      />
      {editor.isActive("link") && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeLink}
          className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Remove Link
        </Button>
      )}
    </div>
  );
}
