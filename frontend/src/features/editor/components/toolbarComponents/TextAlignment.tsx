// /features/editor/components/toolbarComponents/TextAlignment.tsx
import { Editor } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";

interface TextAlignmentProps {
  editor: Editor;
}

export function TextAlignment({ editor }: TextAlignmentProps) {
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        icon={<AlignLeft size={16} />}
        label="Align Left"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        icon={<AlignCenter size={16} />}
        label="Align Center"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        icon={<AlignRight size={16} />}
        label="Align Right"
      />
    </div>
  );
}
