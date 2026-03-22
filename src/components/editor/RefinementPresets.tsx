import React, { useState, useCallback, useEffect } from 'react';
import {
    Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle, MessageSquareQuote, 
    Waves, Smile, Network, Eye, Globe, MessagesSquare, Clock, ShieldCheck, Zap, AlertCircle
} from 'lucide-react';
import { FocusAreaSelector } from './presets/FocusAreaSelector';
import { AuthorVoiceManager } from './presets/AuthorVoiceManager';
import { PolishDepthSelector } from './presets/PolishDepthSelector';
import { ModelSelector } from './presets/ModelSelector';
import { VersionDisplay } from './presets/VersionDisplay';
import { VoiceProfileManager } from './presets/VoiceProfileManager';
import { FocusArea, FeedbackDepth, RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice } from '../../types';
import { refineDraft } from '../../services/geminiService';
import { LoreContextManager } from './LoreContextManager';
import { scanForContext } from '../../utils/contextScanner';

const focusAreaOptions: { id: FocusArea, label: string, icon: React.ReactNode, title: string }[] = [
  { id: 'tone', label: 'Tone', icon: <MessageSquareQuote className="w-5 h-5" />, title: 'Adjust Tone (Atmosphere & Mood)' },
  { id: 'rhythm', label: 'Rhythm', icon: <Waves className="w-5 h-5" />, title: 'Sentence Flow & Cadence (Variety)' },
  { id: 'emotion', label: 'Emotion', icon: <Smile className="w-5 h-5" />, title: 'Visceral Emotion (Show, Don\'t Tell)' },
  { id: 'plot', label: 'Plot', icon: <Network className="w-5 h-5" />, title: 'Narrative Drive & Logic' },
  { id: 'sensory', label: 'Sensory', icon: <Eye className="w-5 h-5" />, title: 'High-Fidelity Sensory Details' },
  { id: 'thematic', label: 'Mythic Weight', icon: <Globe className="w-5 h-5" />, title: 'Mythic Weight & Themes (Lore Elevation)' },
  { id: 'dialogue', label: 'Dialogue', icon: <MessagesSquare className="w-5 h-5" />, title: 'Dialogue Authenticity & Subtext' },
  { id: 'voiceIntegrity', label: 'Voice Integrity', icon: <ShieldCheck className="w-5 h-5" />, title: 'Preserve Authorial Voice & Style' },
  { id: 'continuity', label: 'Structural Clock', icon: <Clock className="w-5 h-5" />, title: 'Structural Clock & Continuity' },
];

const DEPTH_CONFIG: Record<FeedbackDepth, { label: string; temperature: number }> = {
  casual: { label: 'Casual Polish', temperature: 0.3 },
  balanced: { label: 'Balanced Polish', temperature: 0.7 },
  'in-depth': { label: 'In-depth Polish', temperature: 0.9 },
};

interface RefinementPresetsProps {
    getDraft: () => string;
    isRefining: boolean;
    setIsRefining: (isRefining: boolean) => void;
    showToast: (message: string) => void;
    onNewVersion: (version: RefinedVersion) => void;
    versionHistory: RefinedVersion[];
    currentVersionIndex: number;
    currentVersion: RefinedVersion;
    setCurrentVersionIndex: (index: number) => void;
    onShowComparison: () => void;
    onAcceptVersion: (version: string) => void;
    onUpdateVersion: (index: number, content: string) => void;
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    authorVoices: AuthorVoice[];
    onAddLoreEntry: (entry: LoreEntry) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    onClearVersionHistory: () => void;
}

interface FocusAreaButtonProps {
    opt: typeof focusAreaOptions[0];
    isSelected: boolean;
    onClick: () => void;
}

export const RefinementPresets: React.FC<RefinementPresetsProps> = React.memo((props) => {
    const {
        getDraft, isRefining, setIsRefining, showToast, onNewVersion,
        versionHistory, currentVersionIndex, currentVersion, setCurrentVersionIndex,
        onShowComparison, onAcceptVersion, onUpdateVersion, loreEntries, voiceProfiles, authorVoices,
        onAddLoreEntry, onAddVoiceProfile, onAddAuthorVoice, onClearVersionHistory
    } = props;

    const [presetsOpen, setPresetsOpen] = useState(true);
    const [showConflicts, setShowConflicts] = useState(false);
    const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
    const [model, setModel] = useState<'gemini-3.1-flash-lite-preview' | 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview'>('gemini-3.1-flash-lite-preview');
    const [feedbackDepth, setFeedbackDepth] = useState<FeedbackDepth>('balanced');
    const lastRefinementRef = React.useRef<{ options: any, result: any } | null>(null);
    const [suggestions, setSuggestions] = useState<{ type: 'lore' | 'voice', id: string, name: string }[]>([]);

    // Smart Selection Logic
    useEffect(() => {
        const draft = getDraft();
        if (!draft) {
            setSuggestions([]);
            return;
        }

        const foundLoreIds = scanForContext(draft, loreEntries.filter(e => !e.isActive));
        const foundVoiceIds = scanForContext(draft, voiceProfiles.filter(p => !p.isActive));

        const newSuggestions = [
            ...foundLoreIds.map(id => {
                const entry = loreEntries.find(e => e.id === id);
                return { type: 'lore' as const, id, name: entry?.title || 'Unknown' };
            }),
            ...foundVoiceIds.map(id => {
                const profile = voiceProfiles.find(p => p.id === id);
                return { type: 'voice' as const, id, name: profile?.name || 'Unknown' };
            })
        ];

        setSuggestions(newSuggestions);
    }, [getDraft, loreEntries, voiceProfiles]);

    const handleActivateSuggestion = (suggestion: { type: 'lore' | 'voice', id: string }) => {
        if (suggestion.type === 'lore') {
            const entry = loreEntries.find(e => e.id === suggestion.id);
            if (entry) onAddLoreEntry({ ...entry, isActive: true });
        } else {
            const profile = voiceProfiles.find(p => p.id === suggestion.id);
            if (profile) onAddVoiceProfile({ ...profile, isActive: true });
        }
    };
     
    const handleRefine = useCallback(async () => {
        const textToRefine = getDraft();
        if (textToRefine.split(/\s+/).length < 50) {
            showToast("Draft is too short. Echo is a polisher, not a drafting tool.");
            return;
        }
        if (!textToRefine.trim()) {
            showToast("Cannot refine an empty draft.");
            return;
        };
        
        setIsRefining(true);

        // Determine correct temperature
        let currentTemperature = DEPTH_CONFIG[feedbackDepth]?.temperature ?? 0.7;

        const options = {
          draft: textToRefine,
          generationConfig: { model, temperature: currentTemperature },
          focusAreas,
          loreEntries, voiceProfiles, authorVoices,
          feedbackDepth
        };

        // Check cache
        const activeLore = loreEntries.filter(e => e.isActive);
        const activeVoices = voiceProfiles.filter(p => p.isActive);
        const activeAuthorVoice = authorVoices.find(v => v.isActive);

        const optionsKey = JSON.stringify({
            draft: textToRefine,
            model,
            temperature: currentTemperature,
            focusAreas,
            activeLore: activeLore.map(e => ({ id: e.id, mod: e.lastModified })),
            activeVoices: activeVoices.map(p => ({ id: p.id, mod: p.lastModified })),
            activeAuthorVoice: activeAuthorVoice ? { id: activeAuthorVoice.id, mod: activeAuthorVoice.lastModified } : null,
            feedbackDepth
        });

        if (lastRefinementRef.current && lastRefinementRef.current.options === optionsKey) {
            showToast("Using cached refinement result.");
            const cachedResult = lastRefinementRef.current.result;
            onNewVersion(cachedResult);
            setIsRefining(false);
            return;
        }
        
        const result = await refineDraft(options);
        
        const newVersion: RefinedVersion = {
            ...result,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            title: currentVersion?.title || `Refinement ${new Date().toLocaleTimeString()}`,
            summary: result.summary,
            voiceAdherence: result.voiceAdherence,
            structuralCompliance: result.structuralCompliance,
            conflicts: result.conflicts,
            metrics: result.metrics,
            audit: result.audit
        };

        // Update cache
        lastRefinementRef.current = { options: optionsKey, result: newVersion };
        
        onNewVersion(newVersion);
        showToast("New version created!");
        setIsRefining(false);
    }, [getDraft, model, feedbackDepth, focusAreas, showToast, setIsRefining, onNewVersion, loreEntries, voiceProfiles, authorVoices]);

    const reportContent = currentVersion?.text;

    // Calculate Prompt Efficiency
    const totalLoreChars = loreEntries.reduce((acc, e) => acc + e.content.length, 0);
    const activeLoreChars = loreEntries.filter(e => e.isActive).reduce((acc, e) => acc + e.content.length, 0);
    const totalVoiceChars = voiceProfiles.reduce((acc, p) => acc + (p.soulPattern?.length || 0), 0);
    const activeVoiceChars = voiceProfiles.filter(p => p.isActive).reduce((acc, p) => acc + (p.soulPattern?.length || 0), 0);
    
    const totalContext = totalLoreChars + totalVoiceChars;
    const activeContext = activeLoreChars + activeVoiceChars;
    const efficiency = totalContext > 0 ? Math.round((1 - (activeContext / totalContext)) * 100) : 0;

    return (
        <>
            <div className="bg-surface-container-low rounded-[0.75rem] border border-outline-variant/20 p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={() => setPresetsOpen(!presetsOpen)} className="flex items-center gap-2 text-lg font-headline font-semibold text-primary">
                        <span>Refinement Presets</span>
                        {presetsOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {efficiency > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full" title="Context filtering is saving API quota">
                            <Zap className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                                Lean Prompt: {efficiency}% Saved
                            </span>
                        </div>
                    )}
                </div>
                {presetsOpen && (
                    <div className="mt-4 space-y-5">
                        {suggestions.length > 0 && (
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
                                <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Smart Suggestions</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map(s => (
                                        <button 
                                            key={s.id}
                                            onClick={() => handleActivateSuggestion(s)}
                                            className="text-[10px] bg-white border border-primary/20 text-primary px-2 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                                        >
                                            {s.name} detected. Activate?
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <FocusAreaSelector 
                            focusAreas={focusAreas} 
                            setFocusAreas={setFocusAreas} 
                            mode="collaborative"
                        />
                        
                        <ModelSelector 
                            selectedModel={model}
                            setSelectedModel={setModel}
                        />

                        <AuthorVoiceManager 
                            authorVoices={authorVoices}
                            onAddAuthorVoice={onAddAuthorVoice}
                            showToast={showToast}
                        />

                        <VoiceProfileManager 
                            voiceProfiles={voiceProfiles}
                            onAddVoiceProfile={onAddVoiceProfile}
                            showToast={showToast}
                        />

                        <PolishDepthSelector 
                            feedbackDepth={feedbackDepth} 
                            setFeedbackDepth={setFeedbackDepth} 
                            mode="collaborative"
                        />
                    </div>
                )}
            </div>

            <LoreContextManager loreEntries={loreEntries} onAddLoreEntry={onAddLoreEntry} />

            <button onClick={handleRefine} disabled={isRefining} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary-fixed font-label uppercase tracking-wider text-sm font-bold rounded-full hover:bg-primary/90 disabled:bg-surface-container-highest disabled:text-on-surface-variant/50 transition-all shadow-md hover:shadow-lg mt-4">
                {isRefining ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                <span>{isRefining ? 'Echo is thinking...' : 'Refine with Echo'}</span>
            </button>

            <div className="mt-4">
                <VersionDisplay 
                    mode="collaborative"
                    isRefining={isRefining}
                    reviewOutput={null}
                    setReviewOutput={() => {}}
                    currentVersion={currentVersion}
                    currentVersionIndex={currentVersionIndex}
                    versionHistory={versionHistory}
                    setCurrentVersionIndex={setCurrentVersionIndex}
                    onUpdateVersion={onUpdateVersion}
                    onAcceptVersion={onAcceptVersion}
                    onShowComparison={onShowComparison}
                    setShowConflicts={setShowConflicts}
                    onClearVersionHistory={onClearVersionHistory}
                    showToast={showToast}
                />
            </div>
        </>
    );
});