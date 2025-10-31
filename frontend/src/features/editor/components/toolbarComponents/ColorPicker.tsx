// /features/editor/components/toolbarComponents/ColorPicker.tsx
import { Editor } from "@tiptap/react";
import { Palette, Highlighter, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToolbarButton } from "./ToolbarButton";

interface ColorPickerProps {
  editor: Editor;
}

const textColors = [
  "#000000", // black
  "#374151", // gray
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // green
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
];

const highlightColors = [
  "#FEF3C7", // yellow
  "#DBEAFE", // blue
  "#D1FAE5", // green
  "#FCE7F3", // pink
  "#E0E7FF", // indigo
  "#FED7AA", // orange
  "#E9D5FF", // purple
  "#F3F4F6", // gray
];

export function ColorPicker({ editor }: ColorPickerProps) {
  const [showTextColors, setShowTextColors] = useState(false);
  const [showHighlightColors, setShowHighlightColors] = useState(false);

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowTextColors(false);
  };

  const removeTextColor = () => {
    editor.chain().focus().unsetColor().run();
    setShowTextColors(false);
  };

  const setHighlightColor = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
    setShowHighlightColors(false);
  };

  const removeHighlight = () => {
    editor.chain().focus().unsetHighlight().run();
    setShowHighlightColors(false);
  };

  if (showTextColors) {
    return (
      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-md border">
        <div className="flex gap-1">
          {textColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setTextColor(color)}
              className="w-6 h-6 rounded border-2 border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={`Set text color to ${color}`}
            />
          ))}
        </div>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeTextColor}
          className="h-6 w-6 p-0 text-slate-600 hover:text-red-600"
          title="Remove color"
        >
          <X size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowTextColors(false)}
          className="h-6 px-2 text-xs"
        >
          Close
        </Button>
      </div>
    );
  }

  if (showHighlightColors) {
    return (
      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-md border">
        <div className="flex gap-1">
          {highlightColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setHighlightColor(color)}
              className="w-6 h-6 rounded border-2 border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={`Set highlight color to ${color}`}
            />
          ))}
        </div>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeHighlight}
          className="h-6 w-6 p-0 text-slate-600 hover:text-red-600"
          title="Remove highlight"
        >
          <X size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowHighlightColors(false)}
          className="h-6 px-2 text-xs"
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        onClick={() => setShowTextColors(true)}
        isActive={!!editor.getAttributes("textStyle").color}
        icon={<Palette size={16} />}
        label="Text Color"
      />
      <ToolbarButton
        onClick={() => setShowHighlightColors(true)}
        isActive={editor.isActive("highlight")}
        icon={<Highlighter size={16} />}
        label="Highlight Color"
      />
    </div>
  );
}
