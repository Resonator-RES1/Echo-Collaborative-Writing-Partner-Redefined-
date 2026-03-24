import React from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Heading3, BookOpen, Users, Strikethrough, Code, Maximize2, Minimize2 } from 'lucide-react';
import { Editor } from '@tiptap/react';

export type FormatType = 'bold' | 'italic' | 'strikethrough' | 'code' | 'h3' | 'quote' | 'ul' | 'ol' | 'extract-lore' | 'extract-voice';

interface FormattingToolbarProps {
    editor: Editor | null;
    onFormat: (format: FormatType) => void;
    hasSelection: boolean;
    isFocusMode: boolean;
    onToggleFocusMode: () => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = React.memo(({ 
    editor, onFormat, hasSelection, isFocusMode, onToggleFocusMode 
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

    const extractButtons = [
        { type: 'extract-lore', icon: BookOpen, title: 'Extract to Lore' },
        { type: 'extract-voice', icon: Users, title: 'Extract to Voice' },
    ] as const;

    return (
        <div className="flex items-center justify-between w-full">
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
                 
                 <div className="w-px h-4 bg-outline-variant/30 mx-2" />
                 
                 <button
                    onClick={onToggleFocusMode}
                    title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                    className={`p-2 rounded-[0.5rem] transition-all duration-200 ${
                        isFocusMode 
                        ? 'bg-accent-sky text-white shadow-sm' 
                        : 'text-on-surface-variant hover:text-accent-sky hover:bg-surface-container-highest'
                    }`}
                 >
                    {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                 </button>
            </div>
            
            {hasSelection && (
                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                    {extractButtons.map(btn => (
                        <button
                            key={btn.type}
                            onClick={() => onFormat(btn.type)}
                            title={btn.title}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-accent-sky hover:text-white hover:bg-accent-sky bg-accent-sky/5 border border-accent-sky/20 rounded-full transition-all"
                        >
                            <btn.icon className="w-3.5 h-3.5" />
                            {btn.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});
