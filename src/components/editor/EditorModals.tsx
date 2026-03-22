import React from 'react';
import { ComparisonView } from './ComparisonView';
import { ConflictModal } from './ConflictModal';
import { LoreConflict } from '../../types';

interface EditorModalsProps {
    showComparison: boolean;
    showConflicts: boolean;
    currentVersionText: string;
    originalDraft: string;
    conflicts: LoreConflict[];
    setShowComparison: (show: boolean) => void;
    setShowConflicts: (show: boolean) => void;
}

export const EditorModals: React.FC<EditorModalsProps> = React.memo(({
    showComparison,
    showConflicts,
    currentVersionText,
    originalDraft,
    conflicts,
    setShowComparison,
    setShowConflicts
}) => {
    return (
        <>
            {showComparison && (
                <ComparisonView 
                    isOpen={showComparison}
                    onClose={() => setShowComparison(false)}
                    original={originalDraft}
                    polished={currentVersionText}
                />
            )}
            {showConflicts && (
                <ConflictModal
                    isOpen={showConflicts}
                    onClose={() => setShowConflicts(false)}
                    conflicts={conflicts}
                />
            )}
        </>
    );
});
