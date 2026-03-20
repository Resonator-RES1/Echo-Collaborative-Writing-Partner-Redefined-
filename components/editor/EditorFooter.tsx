import React from 'react';

interface EditorFooterProps {
    saveStatus: 'idle' | 'saving' | 'saved';
    wordCount: number;
}

export const EditorFooter: React.FC<EditorFooterProps> = React.memo(({ saveStatus, wordCount }) => {
    return (
        <div className="absolute bottom-4 right-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 italic">
                    {saveStatus === 'saving' && 'Saving...'}
                    {saveStatus === 'saved' && 'Saved!'}
                </span>
                <span className="text-xs text-gray-500">{wordCount} words</span>
            </div>
        </div>
    );
});
