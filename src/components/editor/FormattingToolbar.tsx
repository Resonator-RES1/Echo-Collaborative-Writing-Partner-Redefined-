import React from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Heading3, BookOpen, Users, Strikethrough, Code, Link, Image as ImageIcon } from 'lucide-react';

export type FormatType = 'bold' | 'italic' | 'strikethrough' | 'code' | 'link' | 'image' | 'h3' | 'quote' | 'ul' | 'ol' | 'extract-lore' | 'extract-voice';

interface FormattingToolbarProps {
    onFormat: (format: FormatType) => void;
    hasSelection: boolean;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = React.memo(({ onFormat, hasSelection }) => {
    const formatButtons = [
        { type: 'bold', icon: Bold, title: 'Bold' },
        { type: 'italic', icon: Italic, title: 'Italic' },
        { type: 'strikethrough', icon: Strikethrough, title: 'Strikethrough' },
        { type: 'code', icon: Code, title: 'Code' },
        { type: 'link', icon: Link, title: 'Link' },
        { type: 'image', icon: ImageIcon, title: 'Image' },
        { type: 'h3', icon: Heading3, title: 'Heading' },
        { type: 'quote', icon: Quote, title: 'Blockquote' },
        { type: 'ul', icon: List, title: 'Bulleted List' },
        { type: 'ol', icon: ListOrdered, title: 'Numbered List' },
    ] as const;

    const extractButtons = [
        { type: 'extract-lore', icon: BookOpen, title: 'Extract to Lore' },
        { type: 'extract-voice', icon: Users, title: 'Extract to Voice' },
    ] as const;

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                 {formatButtons.map(btn => (
                    <button
                        key={btn.type}
                        onClick={() => onFormat(btn.type)}
                        title={btn.title}
                        className="p-2 text-on-surface-variant hover:text-primary rounded-[0.5rem] hover:bg-surface-container-highest transition-colors"
                    >
                        <btn.icon className="w-4 h-4" />
                    </button>
                 ))}
            </div>
            
            {hasSelection && (
                <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-4 animate-in fade-in slide-in-from-left-2">
                    {extractButtons.map(btn => (
                        <button
                            key={btn.type}
                            onClick={() => onFormat(btn.type)}
                            title={btn.title}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-sky hover:text-white hover:bg-accent-sky rounded-[0.5rem] transition-colors"
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
