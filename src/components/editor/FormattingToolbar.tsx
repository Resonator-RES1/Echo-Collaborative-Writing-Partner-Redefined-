import React from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Heading3, BookOpen, Users, Strikethrough, Code, Sparkles } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface FormattingToolbarProps {
    editor: Editor | null;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = React.memo(({ 
    editor 
}) => {
    const formatButtons = [
        { type: 'bold', icon: Bold, title: 'Bold', action: () => editor?.chain().focus().toggleBold().run(), isActive: () => editor?.isActive('bold') },
        { type: 'italic', icon: Italic, title: 'Italic', action: () => editor?.chain().focus().toggleItalic().run(), isActive: () => editor?.isActive('italic') },
        { type: 'strikethrough', icon: Strikethrough, title: 'Strikethrough', action: () => editor?.chain().focus().toggleStrike().run(), isActive: () => editor?.isActive('strike') },
        { type: 'h3', icon: Heading3, title: 'Heading', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor?.isActive('heading', { level: 3 }) },
        { type: 'quote', icon: Quote, title: 'Blockquote', action: () => editor?.chain().focus().toggleBlockquote().run(), isActive: () => editor?.isActive('blockquote') },
        { type: 'ul', icon: List, title: 'Bulleted List', action: () => editor?.chain().focus().toggleBulletList().run(), isActive: () => editor?.isActive('bulletList') },
        { type: 'ol', icon: ListOrdered, title: 'Numbered List', action: () => editor?.chain().focus().toggleOrderedList().run(), isActive: () => editor?.isActive('orderedList') },
    ] as const;

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                 {formatButtons.map(btn => (
                    <button
                        key={btn.type}
                        onClick={btn.action}
                        title={btn.title}
                        className={`p-2 rounded-[0.5rem] transition-all duration-200 ${
                            btn.isActive() 
                            ? 'bg-primary text-on-primary shadow-sm' 
                            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-highest'
                        }`}
                    >
                        <btn.icon className="w-4 h-4" />
                    </button>
                 ))}
            </div>
        </div>
    );
});
