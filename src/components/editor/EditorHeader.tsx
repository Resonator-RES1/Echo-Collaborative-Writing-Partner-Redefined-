import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface EditorHeaderProps {
    isEditorExpanded: boolean;
    setIsEditorExpanded: (expanded: boolean) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = React.memo(({
    isEditorExpanded,
    setIsEditorExpanded
}) => {
    return (
        <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
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
