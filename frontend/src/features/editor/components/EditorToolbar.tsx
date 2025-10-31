// /features/editor/components/EditorToolbar.tsx
"use client";

import { Editor } from "@tiptap/react";
import {
  ToolbarDivider,
  TextFormatting,
  Headings,
  Lists,
  TextAlignment,
  LinkManagement,
} from "./toolbarComponents";

interface EditorToolbarProps {
  editor: Editor | null;
}

// Main Toolbar Component
export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-1 p-2">
        {/* Text Formatting */}
        <TextFormatting editor={editor} />
        
        <ToolbarDivider />
        
        {/* Headings */}
        <Headings editor={editor} />
        
        <ToolbarDivider />
        
        {/* Lists and Quotes */}
        <Lists editor={editor} />
        
        <ToolbarDivider />
        
        {/* Text Alignment */}
        <TextAlignment editor={editor} />
        
        <ToolbarDivider />
        
        {/* Link Management */}
        <LinkManagement editor={editor} />
      </div>
    </div>
  );
}
