import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Dropcursor from '@tiptap/extension-dropcursor';
import { Markdown } from 'tiptap-markdown';

interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onSelectionChange?: (selection: { text: string; start: number; end: number } | null) => void;
  placeholder?: string;
  className?: string;
  editorRef?: React.MutableRefObject<any>;
  fontSize?: number;
  lineHeight?: number;
  paragraphSpacing?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onSelectionChange,
  placeholder = 'The canvas is yours. Begin your narrative...',
  className = '',
  editorRef,
  fontSize,
  lineHeight,
  paragraphSpacing = 1.5,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // We can disable things we don't want from starter kit if needed
        codeBlock: false, // We'll use simple code if needed, or keep it
        dropcursor: false, // Disable dropcursor here to avoid duplication
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      Dropcursor.configure({
        color: 'var(--color-primary)',
        width: 2,
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        linkify: false,
        breaks: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        const markdown = (editor.storage as any).markdown.getMarkdown();
        onChange(markdown);
      }, 500);
    },
    onSelectionUpdate: ({ editor }) => {
      if (!onSelectionChange) return;
      
      const { from, to } = editor.state.selection;
      if (from === to) {
        onSelectionChange(null);
      } else {
        const text = editor.state.doc.textBetween(from, to, ' ');
        onSelectionChange({ text, start: from, end: to });
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-theme max-w-none focus:outline-none min-h-full text-on-surface ${className}`,
        style: `
          ${fontSize ? `font-size: ${fontSize}px;` : ''} 
          ${lineHeight ? `line-height: ${lineHeight};` : ''}
          --paragraph-spacing: ${paragraphSpacing}em;
        `,
      },
    },
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sync display preferences
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: `prose prose-theme max-w-none focus:outline-none min-h-full text-on-surface ${className}`,
            style: `
              ${fontSize ? `font-size: ${fontSize}px;` : ''} 
              ${lineHeight ? `line-height: ${lineHeight};` : ''}
              --paragraph-spacing: ${paragraphSpacing}em;
            `,
          },
        },
      });
    }
  }, [editor, fontSize, lineHeight, paragraphSpacing, className]);

  // Sync external content changes (e.g. from Echo Archive or Scene switching)
  useEffect(() => {
    if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // Expose editor instance to parent if needed (for toolbar)
  useEffect(() => {
    if (editorRef && editor) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  return (
    <div className="w-full min-h-full">
      <EditorContent editor={editor} className="min-h-full" />
    </div>
  );
};
