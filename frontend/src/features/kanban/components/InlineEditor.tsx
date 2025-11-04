// /features/kanban/components/InlineEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Mention } from '@/features/editor/extensions/Mention';
import { mentionSuggestion } from '@/lib/mentionSuggestion';
import { useEffect } from 'react';

interface InlineEditorProps {
  content: string;
  placeholder?: string;
  onUpdate: (content: string) => void;
  onBlur?: () => void;
  className?: string;
  editable?: boolean;
}

export function InlineEditor({ 
  content, 
  placeholder = 'Type something...', 
  onUpdate, 
  onBlur,
  className = '',
  editable = true 
}: InlineEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        horizontalRule: false,
        blockquote: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      // Get text content including mentions
      const html = editor.getHTML();
      // Extract text with @mentions preserved
      const div = document.createElement('div');
      div.innerHTML = html;
      const textWithMentions = div.textContent || '';
      onUpdate(textWithMentions);
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none ${className}`,
      },
    },
  });

  // Update content when it changes externally
  useEffect(() => {
    if (editor) {
      const div = document.createElement('div');
      div.innerHTML = editor.getHTML();
      const currentText = div.textContent || '';
      if (content !== currentText) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
