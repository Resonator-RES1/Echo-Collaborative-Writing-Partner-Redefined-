import React from 'react';
import { SuggestionsPopover } from './SuggestionsPopover';
import { CharacterCreatorModal } from './CharacterCreatorModal';
import { VoiceProfile } from '../../types';

interface EditorModalsProps {
    showSuggestionsPopover: boolean;
    selection: { text: string; start: number; end: number } | null;
    isSuggesting: boolean;
    suggestions: string[];
    handleApplySuggestion: (suggestion: string) => void;
    setShowSuggestionsPopover: (show: boolean) => void;
    isCreatorModalOpen: boolean;
    setIsCreatorModalOpen: (show: boolean) => void;
    showToast: (message: string) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
}

export const EditorModals: React.FC<EditorModalsProps> = React.memo(({
    showSuggestionsPopover,
    selection,
    isSuggesting,
    suggestions,
    handleApplySuggestion,
    setShowSuggestionsPopover,
    isCreatorModalOpen,
    setIsCreatorModalOpen,
    showToast,
    onAddVoiceProfile
}) => {
    return (
        <>
            {showSuggestionsPopover && selection && (
                <SuggestionsPopover
                    isLoading={isSuggesting}
                    suggestions={suggestions}
                    originalText={selection.text}
                    onSelect={handleApplySuggestion}
                    onClose={() => setShowSuggestionsPopover(false)}
                />
            )}
            {isCreatorModalOpen && (
                <CharacterCreatorModal
                    onClose={() => setIsCreatorModalOpen(false)}
                    showToast={showToast}
                    onAddVoiceProfile={onAddVoiceProfile}
                />
            )}
        </>
    );
});
