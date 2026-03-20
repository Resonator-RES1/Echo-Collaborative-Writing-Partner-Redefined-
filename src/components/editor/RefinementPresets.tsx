import React, { useState, useCallback, useEffect } from 'react';
import {
    Sparkles, Loader2, ChevronDown, ChevronUp, BookOpen, CheckCircle, MessageSquareQuote, 
    Waves, Smile, Network, Eye, Globe, MessagesSquare, Clock, ShieldCheck
} from 'lucide-react';
import { ModeSelector } from './presets/ModeSelector';
import { FocusAreaSelector } from './presets/FocusAreaSelector';
import { CharacterVoiceManager } from './presets/CharacterVoiceManager';
import { PolishDepthSelector, REVIEW_DEPTH_CONFIG, REACTION_DEPTH_CONFIG } from './presets/PolishDepthSelector';
import { ModelSelector } from './presets/ModelSelector';
import { VersionDisplay } from './presets/VersionDisplay';
import { ComplianceReportView } from './ComplianceReportView';
import { RefineMode, FocusArea, CharacterProfile, ReviewPerspective, FeedbackDepth, RefinedVersion, LoreEntry, VoiceProfile } from '../../types';
import { refineDraft } from '../../services/geminiService';
import { LoreContextManager } from './LoreContextManager';

const focusAreaOptions: { id: FocusArea, label: string, icon: React.ReactNode, title: string }[] = [
  { id: 'tone', label: 'Tone', icon: <MessageSquareQuote className="w-5 h-5" />, title: 'Adjust Tone (Atmosphere & Mood)' },
  { id: 'rhythm', label: 'Rhythm', icon: <Waves className="w-5 h-5" />, title: 'Rhythm & Cadence (Musicality)' },
  { id: 'emotion', label: 'Emotion', icon: <Smile className="w-5 h-5" />, title: 'Visceral Emotion (Show, Don\'t Tell)' },
  { id: 'plot', label: 'Plot', icon: <Network className="w-5 h-5" />, title: 'Narrative Drive & Logic' },
  { id: 'sensory', label: 'Sensory', icon: <Eye className="w-5 h-5" />, title: 'High-Fidelity Sensory Details' },
  { id: 'thematic', label: 'Mythic Weight', icon: <Globe className="w-5 h-5" />, title: 'Mythic Weight & Themes (Lore Elevation)' },
  { id: 'dialogue', label: 'Dialogue', icon: <MessagesSquare className="w-5 h-5" />, title: 'Dialogue Authenticity & Subtext' },
  { id: 'continuity', label: 'Structural Clock', icon: <Clock className="w-5 h-5" />, title: 'Structural Clock & Continuity' },
];

const DEPTH_CONFIG: Record<FeedbackDepth, { label: string; temperature: number }> = {
  casual: { label: 'Casual Polish', temperature: 0.3 },
  balanced: { label: 'Balanced Polish', temperature: 0.7 },
  'in-depth': { label: 'In-depth Polish', temperature: 0.9 },
};

const getInitialCharacterProfiles = (): CharacterProfile[] => {
    try {
        const savedProfiles = localStorage.getItem('echo-character-profiles');
        if (!savedProfiles) return [];
        const parsed = JSON.parse(savedProfiles);
        if (Array.isArray(parsed)) {
            return parsed.map(p => ({
                id: p.id || Date.now().toString() + Math.random(),
                name: p.name || '', voice: p.voice || '', gender: p.gender || 'unspecified',
                backstory: p.backstory || '', motivations: p.motivations || '', relationships: p.relationships || '',
                isActive: p.isActive !== false,
            }));
        }
    } catch(e) { 
        console.error("Failed to parse character profiles from localStorage", e);
    }
    return [];
};

interface RefinementPresetsProps {
    getDraft: () => string;
    isRefining: boolean;
    setIsRefining: (isRefining: boolean) => void;
    showToast: (message: string) => void;
    onNewVersion: (version: RefinedVersion) => void;
    onOpenCreatorModal: () => void;
    versionHistory: RefinedVersion[];
    currentVersionIndex: number;
    currentVersion: RefinedVersion;
    setCurrentVersionIndex: (index: number) => void;
    onShowComparison: () => void;
    onAcceptVersion: (version: string) => void;
    onUpdateVersion: (index: number, content: string) => void;
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    onAddLoreEntry: (entry: LoreEntry) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
}

interface FocusAreaButtonProps {
    opt: typeof focusAreaOptions[0];
    isSelected: boolean;
    onClick: () => void;
}

export const RefinementPresets: React.FC<RefinementPresetsProps> = React.memo((props) => {
    const {
        getDraft, isRefining, setIsRefining, showToast, onNewVersion, onOpenCreatorModal,
        versionHistory, currentVersionIndex, currentVersion, setCurrentVersionIndex,
        onShowComparison, onAcceptVersion, onUpdateVersion, loreEntries, voiceProfiles,
        onAddLoreEntry, onAddVoiceProfile
    } = props;

    const [presetsOpen, setPresetsOpen] = useState(true);
    const [mode, setMode] = useState<RefineMode>('collaborative');
    const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
    const [model, setModel] = useState<'gemini-3.1-flash-lite-preview' | 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview'>('gemini-3.1-flash-lite-preview');
    const [feedbackDepth, setFeedbackDepth] = useState<FeedbackDepth>('balanced');
    const [reviewPerspective, setReviewPerspective] = useState<ReviewPerspective>('reader');
    const [reviewOutput, setReviewOutput] = useState<RefinedVersion | null>(null);
    const [characterProfiles, setCharacterProfiles] = useState<CharacterProfile[]>(getInitialCharacterProfiles);

    useEffect(() => {
        const handler = setTimeout(() => localStorage.setItem('echo-character-profiles', JSON.stringify(characterProfiles)), 500);
        return () => clearTimeout(handler);
    }, [characterProfiles]);
    
    useEffect(() => {
        const handleProfilesUpdated = () => {
            setCharacterProfiles(getInitialCharacterProfiles());
        };
        window.addEventListener('echo-character-profiles-updated', handleProfilesUpdated);
        return () => window.removeEventListener('echo-character-profiles-updated', handleProfilesUpdated);
    }, []);

    // Automatically select 'continuity' when switching to review mode
    useEffect(() => {
        if (mode === 'review') {
            setFocusAreas(prev => {
                if (prev.includes('continuity')) return prev;
                return [...prev, 'continuity'];
            });
        }
    }, [mode]);
     
    const handleRefine = useCallback(async () => {
        const textToRefine = getDraft();
        if (!textToRefine.trim()) {
            showToast("Cannot refine an empty draft.");
            return;
        };
        
        setIsRefining(true);
        setReviewOutput(null);

        const activeProfiles = characterProfiles.filter(p => p.isActive !== false);

        // Determine correct temperature based on mode
        let currentTemperature = DEPTH_CONFIG[feedbackDepth]?.temperature ?? 0.7;
        if (mode === 'review') {
            currentTemperature = REVIEW_DEPTH_CONFIG[feedbackDepth]?.temperature ?? 0.7;
        } else if (mode === 'reaction') {
            currentTemperature = REACTION_DEPTH_CONFIG[feedbackDepth]?.temperature ?? 0.7;
        }

        const options = {
          draft: textToRefine, mode,
          generationConfig: { model, temperature: currentTemperature },
          focusAreas, characterProfiles: activeProfiles, reviewPerspective,
          feedbackDepth,
          loreEntries, voiceProfiles
        };
        
        const result = await refineDraft(options);
        
        const newVersion: RefinedVersion = {
            ...result,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            mode: mode
        };
        
        if (mode === 'review' || mode === 'reaction') {
            setReviewOutput(newVersion);
        } else {
            onNewVersion(newVersion);
            showToast("New version created!");
        }
        setIsRefining(false);
    }, [getDraft, mode, model, feedbackDepth, focusAreas, characterProfiles, reviewPerspective, showToast, setIsRefining, onNewVersion, loreEntries, voiceProfiles]);

    const reportContent = (mode === 'review' || mode === 'reaction') ? reviewOutput?.report : currentVersion?.report;

    return (
        <>
            <div className="bg-surface-container-low rounded-[0.75rem] border border-outline-variant/20 p-4 shadow-sm">
                <button onClick={() => setPresetsOpen(!presetsOpen)} className="w-full flex justify-between items-center text-lg font-headline font-semibold text-primary">
                    <span>Refinement Presets</span>
                    {presetsOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5" />}
                </button>
                {presetsOpen && (
                    <div className="mt-4 space-y-5">
                        <ModeSelector 
                            mode={mode} 
                            setMode={setMode} 
                            reviewPerspective={reviewPerspective} 
                            setReviewPerspective={setReviewPerspective} 
                        />
                        
                        <FocusAreaSelector 
                            focusAreas={focusAreas} 
                            setFocusAreas={setFocusAreas} 
                            mode={mode}
                        />

                        <ModelSelector 
                            selectedModel={model}
                            setSelectedModel={setModel}
                        />

                        {mode === 'collaborative' && (
                            <CharacterVoiceManager 
                                characterProfiles={characterProfiles} 
                                setCharacterProfiles={setCharacterProfiles} 
                                onOpenCreatorModal={onOpenCreatorModal} 
                                showToast={showToast} 
                                voiceProfiles={voiceProfiles}
                                onAddVoiceProfile={onAddVoiceProfile}
                            />
                        )}

                        <PolishDepthSelector 
                            feedbackDepth={feedbackDepth} 
                            setFeedbackDepth={setFeedbackDepth} 
                            mode={mode}
                        />
                    </div>
                )}
            </div>

            <LoreContextManager loreEntries={loreEntries} onAddLoreEntry={onAddLoreEntry} />

            <button onClick={handleRefine} disabled={isRefining} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary-fixed font-label uppercase tracking-wider text-sm font-bold rounded-full hover:bg-primary/90 disabled:bg-surface-container-highest disabled:text-on-surface-variant/50 transition-all shadow-md hover:shadow-lg mt-4">
                {isRefining ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                <span>{isRefining ? 'Echo is thinking...' : mode === 'review' ? 'Review with Echo' : mode === 'reaction' ? 'Get Reaction from Echo' : 'Refine with Echo'}</span>
            </button>

            <div className="mt-4">
                <VersionDisplay 
                    mode={mode}
                    isRefining={isRefining}
                    reviewOutput={reviewOutput}
                    setReviewOutput={setReviewOutput}
                    currentVersion={currentVersion}
                    currentVersionIndex={currentVersionIndex}
                    versionHistory={versionHistory}
                    setCurrentVersionIndex={setCurrentVersionIndex}
                    onUpdateVersion={onUpdateVersion}
                    onShowComparison={onShowComparison}
                    onAcceptVersion={onAcceptVersion}
                    showToast={showToast}
                />
            </div>

            {mode === 'collaborative' && reportContent && (
                <div className="bg-surface-container-low rounded-[0.75rem] border border-outline-variant/20 flex flex-col mt-4 shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-highest/30">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-label text-on-surface-variant font-medium tracking-wider uppercase">Structural Compliance Report</h3>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/10"></div>
                        </div>
                    </div>
                    <div className="p-4 overflow-y-auto max-h-[400px]">
                        <ComplianceReportView report={reportContent} />
                    </div>
                </div>
            )}
        </>
    );
});