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
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            {selection && !showSuggestionsPopover && (
                <button
                    onClick={() => handleRefineSelection('Improve and polish this text')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-lg"
                    title="Get AI suggestions for the selected text"
                >
                    <Wand2 className="w-4 h-4" />
                    <span>Quick Refine</span>
                </button>
            )}
            <button
                onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                title={isEditorExpanded ? "Shrink Editor" : "Expand Editor"}
                className="p-1.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-lg"
            >
                {isEditorExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
        </div>
    );
});
