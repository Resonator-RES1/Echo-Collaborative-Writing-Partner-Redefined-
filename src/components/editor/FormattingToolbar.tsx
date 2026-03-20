import React from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Heading3 } from 'lucide-react';

export type FormatType = 'bold' | 'italic' | 'h3' | 'quote' | 'ul' | 'ol';

interface FormattingToolbarProps {
    onFormat: (format: FormatType) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = React.memo(({ onFormat }) => {
    const buttons = [
        { type: 'bold', icon: Bold, title: 'Bold' },
        { type: 'italic', icon: Italic, title: 'Italic' },
        { type: 'h3', icon: Heading3, title: 'Heading' },
        { type: 'quote', icon: Quote, title: 'Blockquote' },
        { type: 'ul', icon: List, title: 'Bulleted List' },
        { type: 'ol', icon: ListOrdered, title: 'Numbered List' },
    ] as const;

    return (
        <div className="flex items-center gap-1 pb-3 border-b border-outline-variant/20 mb-4 -mx-6 px-6 lg:-mx-10 lg:px-10">
             {buttons.map(btn => (
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
    );
});
