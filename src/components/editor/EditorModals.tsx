import React from 'react';
import { ComparisonView } from './ComparisonView';
import { SuggestionsPopover } from './SuggestionsPopover';
import { CharacterCreatorModal } from './CharacterCreatorModal';
import { ComparisonResponse, VoiceCheckResponse, VoiceProfile } from '../../types';

interface EditorModalsProps {
    showComparison: boolean;
    currentVersionText: string;
    originalDraft: string;
    currentComparison: ComparisonResponse | string | undefined;
    currentVoiceCheck: VoiceCheckResponse | string | undefined;
    setShowComparison: (show: boolean) => void;
    handleCompare: () => void;
    handleCheckVoice: () => void;
    isComparing: boolean;
    isCheckingVoice: boolean;
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
    showComparison,
    currentVersionText,
    originalDraft,
    currentComparison,
    currentVoiceCheck,
    setShowComparison,
    handleCompare,
    handleCheckVoice,
    isComparing,
    isCheckingVoice,
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
            {showComparison && currentVersionText && (
                <ComparisonView 
                    original={originalDraft}
                    polished={currentVersionText}
                    comparisonData={currentComparison}
                    voiceCheckData={currentVoiceCheck}
                    onClose={() => setShowComparison(false)}
                    onCompare={handleCompare}
                    onCheckVoice={handleCheckVoice}
                    isComparing={isComparing}
                    isCheckingVoice={isCheckingVoice}
                />
            )}
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
