import React from 'react';
import { Sparkles, Loader2, Zap, AlertCircle, PlusCircle, Settings, FileText } from 'lucide-react';
import { RefinementPresets } from './RefinementPresets';
import { Scene, RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice, FeedbackDepth, FocusArea, WorkspaceTab } from '../../types';

interface RefinePanelProps {
    draft: string;
    isRefining: boolean;
    setIsRefining: (isRefining: boolean) => void;
    showToast: (message: string) => void;
    onNewVersion: (version: RefinedVersion) => void;
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    authorVoices: AuthorVoice[];
    onAddLoreEntry: (entry: LoreEntry) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    currentSceneId: string | null;
    selection?: { text: string; start: number; end: number } | null;
    editorRef?: React.MutableRefObject<any>;
    setActiveTab?: (tab: WorkspaceTab) => void;
}

export const RefinePanel: React.FC<RefinePanelProps> = (props) => {
    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto animate-in fade-in duration-500 custom-scrollbar pr-2 pb-12">
            <div className="max-w-3xl mx-auto w-full">
                <RefinementPresets 
                    {...props} 
                    getDraft={() => props.draft} 
                    selection={props.selection || null} 
                    editorRef={props.editorRef}
                    setActiveTab={props.setActiveTab}
                />
            </div>
        </div>
    );
};
