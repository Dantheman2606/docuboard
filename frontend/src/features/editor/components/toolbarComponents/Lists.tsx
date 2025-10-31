// /features/editor/components/toolbarComponents/Lists.tsx
import { Editor } from "@tiptap/react";
import { List, ListOrdered, Quote } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";

interface ListsProps {
  editor: Editor;
}

export function Lists({ editor }: ListsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        icon={<List size={16} />}
        label="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        icon={<ListOrdered size={16} />}
        label="Numbered List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        icon={<Quote size={16} />}
        label="Quote"
      />
    </div>
  );
}
