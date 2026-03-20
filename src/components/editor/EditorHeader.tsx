import React from 'react';
import { Wand2, Maximize2, Minimize2 } from 'lucide-react';

interface EditorHeaderProps {
    selection: { text: string; start: number; end: number } | null;
    showSuggestionsPopover: boolean;
    handleRefineSelection: (instruction: string) => void;
    isEditorExpanded: boolean;
    setIsEditorExpanded: (expanded: boolean) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = React.memo(({
    selection,
    showSuggestionsPopover,
    handleRefineSelection,
    isEditorExpanded,
    setIsEditorExpanded
}) => {
    return (
        <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
            {selection && !showSuggestionsPopover && (
                <button
                    onClick={() => handleRefineSelection('Improve and polish this text')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary-fixed font-label uppercase tracking-wider text-xs font-bold rounded-full hover:bg-primary/90 transition-all shadow-md"
                    title="Get AI suggestions for the selected text"
                >
                    <Wand2 className="w-4 h-4" />
                    <span>Quick Refine</span>
                </button>
            )}
            <button
                onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                title={isEditorExpanded ? "Shrink Editor" : "Expand Editor"}
                className="p-2.5 bg-surface-container-highest text-primary rounded-full hover:bg-surface-container-highest/80 transition-all shadow-sm"
            >
                {isEditorExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
        </div>
    );
});
