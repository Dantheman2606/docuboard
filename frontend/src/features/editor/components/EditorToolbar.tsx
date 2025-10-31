// /features/editor/components/EditorToolbar.tsx
"use client";

import { Editor } from "@tiptap/react";
import {
  TextFormatting,
  Headings,
  Lists,
  TextAlignment,
  LinkManagement,
  ColorPicker,
  FontOptions,
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
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Headings */}
        <Headings editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Font Options */}
        <FontOptions editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Color Picker */}
        <ColorPicker editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Lists and Quotes */}
        <Lists editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Text Alignment */}
        <TextAlignment editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Link Management */}
        <LinkManagement editor={editor} />
      </div>
    </div>
  );
}
