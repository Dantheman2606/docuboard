// /features/editor/components/toolbarComponents/Headings.tsx
import { Editor } from "@tiptap/react";
import { Heading1, Heading2, Heading3 } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";

interface HeadingsProps {
  editor: Editor;
}

export function Headings({ editor }: HeadingsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        icon={<Heading1 size={16} />}
        label="Heading 1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        icon={<Heading2 size={16} />}
        label="Heading 2"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        icon={<Heading3 size={16} />}
        label="Heading 3"
      />
    </div>
  );
}
