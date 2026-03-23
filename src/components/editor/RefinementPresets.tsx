import React, { useState, useCallback, useEffect } from 'react';
import {
    Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle, MessageSquareQuote, 
    Waves, Smile, Network, Eye, Globe, MessagesSquare, Clock, ShieldCheck, Zap, AlertCircle, CheckCircle2, PlusCircle, Settings
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
import { SettingsModal } from '../SettingsModal';

const DEPTH_CONFIG: Record<FeedbackDepth, { label: string; temperature: number }> = {
  casual: { label: 'Casual Polish', temperature: 0.3 },
  balanced: { label: 'Balanced Polish', temperature: 0.7 },
  'in-depth': { label: 'In-depth Polish', temperature: 0.9 },
};

interface RefinementPresetsProps {
    getDraft: () => string;
    selection: { text: string; start: number; end: number } | null;
    isRefining: boolean;
    setIsRefining: (isRefining: boolean) => void;
    showToast: (message: string) => void;
    onNewVersion: (version: RefinedVersion) => void;
    versionHistory: RefinedVersion[];
    currentVersionIndex: number;
    currentVersion: RefinedVersion;
    setCurrentVersionIndex: (index: number) => void;
    onShowComparison: () => void;
    onAcceptVersion: (version: RefinedVersion) => void;
    onUpdateVersion: (index: number, content: string) => void;
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    authorVoices: AuthorVoice[];
    onAddLoreEntry: (entry: LoreEntry) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    onClearVersionHistory: () => void;
    setShowConflicts: (show: boolean) => void;
    currentSceneId: string | null;
}

export const RefinementPresets: React.FC<RefinementPresetsProps> = React.memo((props) => {
    const {
        getDraft, selection, isRefining, setIsRefining, showToast, onNewVersion,
        versionHistory, currentVersionIndex, currentVersion, setCurrentVersionIndex,
        onShowComparison, onAcceptVersion, onUpdateVersion, loreEntries, voiceProfiles, authorVoices,
        onAddLoreEntry, onAddVoiceProfile, onAddAuthorVoice, onClearVersionHistory, setShowConflicts,
        currentSceneId
    } = props;

    const [presetsOpen, setPresetsOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'setup' | 'report'>('setup');
    const [showSettings, setShowSettings] = useState(false);
    const [isScanComplete, setIsScanComplete] = useState(false);
    const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
    const [model, setModel] = useState<'gemini-3.1-flash-lite-preview' | 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview'>('gemini-3.1-flash-lite-preview');
    const [feedbackDepth, setFeedbackDepth] = useState<FeedbackDepth>('balanced');
    const lastRefinementRef = React.useRef<{ options: any, result: any } | null>(null);
    const [suggestions, setSuggestions] = useState<{ type: 'lore' | 'voice', id: string, name: string }[]>([]);

    // Smart Selection Logic
    useEffect(() => {
        const timer = setTimeout(() => {
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
            setIsScanComplete(true);
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
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
        const fullDraft = getDraft();
        const isTargeted = selection && selection.text.trim().length > 0;
        const textToRefine = isTargeted ? selection.text : fullDraft;
        
        if (textToRefine.split(/\s+/).length < 10) {
            showToast("Text is too short. Echo needs more context to refine effectively.");
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

        const result = await refineDraft(options);
        
        // Reset workspace parameters after refinement as requested
        // (But keep lore/voice/author profiles active in the workspace)
        setFocusAreas([]);
        setModel('gemini-3.1-flash-lite-preview');
        setFeedbackDepth('balanced');
        
        let finalRefinedText = result.text;
        let extractedTitle = '';
        
        if (isTargeted) {
             // If targeted, we replace the selection in the full draft
             // We don't extract title from targeted refinement
             finalRefinedText = fullDraft.substring(0, selection.start) + result.text + fullDraft.substring(selection.end);
        } else {
            // Try to extract title from the first line if it starts with #
            const lines = result.text.split('\n');
            if (lines.length > 0 && lines[0].startsWith('#')) {
                extractedTitle = lines[0].replace(/^#+\s*/, '').trim();
            }
        }

        const newVersion: RefinedVersion = {
            ...result,
            text: finalRefinedText,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            title: extractedTitle || currentVersion?.title || `Refinement ${new Date().toLocaleTimeString()}`,
            summary: isTargeted ? `Targeted Refinement: ${result.summary}` : result.summary,
            analysis: result.analysis,
            conflicts: result.conflicts,
            metrics: result.metrics,
            loreCorrections: result.loreCorrections,
            sceneId: currentSceneId || undefined,
            usedProfiles: result.usedProfiles
        };

        onNewVersion(newVersion);
        showToast(isTargeted ? "Targeted refinement complete!" : "New version created!");
        setActiveTab('report');
        setIsRefining(false);
    }, [getDraft, selection, model, feedbackDepth, focusAreas, showToast, setIsRefining, onNewVersion, loreEntries, voiceProfiles, authorVoices, currentVersion, currentSceneId]);

    const handleAutoSetFocus = useCallback((areas: FocusArea[]) => {
        setFocusAreas(prev => {
            const newAreas = [...prev];
            areas.forEach(area => {
                if (!newAreas.includes(area)) {
                    newAreas.push(area);
                }
            });
            return newAreas;
        });
        const areaLabel = areas.length > 0 ? areas[0] : 'none';
        showToast(`Focus area '${areaLabel}' added to selection.`);
    }, [setFocusAreas, showToast]);

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
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/20 p-4 lg:p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 lg:gap-3">
                        <button 
                            onClick={() => setPresetsOpen(!presetsOpen)} 
                            className="flex items-center gap-2 lg:gap-3 text-xl lg:text-2xl font-headline font-black text-primary tracking-tight group"
                        >
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                            </div>
                            <span>Refinement Workspace</span>
                            <div className="p-1 rounded-full hover:bg-primary/10 transition-all">
                                {presetsOpen ? <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5"/> : <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5" />}
                            </div>
                        </button>
                        <button 
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-xl bg-surface-container-highest/50 text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all"
                            title="Settings"
                        >
                            <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                    </div>
                    {efficiency > 0 && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent-emerald/10 border border-accent-emerald/20 rounded-full shadow-sm" title="Context filtering is saving API quota">
                            <Zap className="w-3.5 h-3.5 text-accent-emerald animate-pulse" />
                            <span className="text-[10px] font-black text-accent-emerald uppercase tracking-widest">
                                {efficiency}% LEAN
                            </span>
                        </div>
                    )}
                </div>

                {presetsOpen && (
                    <div className="flex border-b border-outline-variant/20 mb-4">
                        <button
                            onClick={() => setActiveTab('setup')}
                            className={`flex-1 py-2 text-xs lg:text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
                                activeTab === 'setup' 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            Setup & Context
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`flex-1 py-2 text-xs lg:text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
                                activeTab === 'report' 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            History & Report
                        </button>
                    </div>
                )}

                {presetsOpen && activeTab === 'setup' && (
                    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {suggestions.length > 0 && (
                            <div className="bg-accent-sky/5 border border-accent-sky/20 rounded-2xl p-3 lg:p-4 space-y-3 shadow-inner">
                                <div className="flex items-center gap-2 text-accent-sky font-black text-[10px] uppercase tracking-widest">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Smart Context Detected</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map(s => (
                                        <button 
                                            key={s.id}
                                            onClick={() => handleActivateSuggestion(s)}
                                            className="text-[10px] font-black bg-surface-container-highest/40 border border-accent-sky/30 text-accent-sky px-2.5 py-1 rounded-xl hover:bg-accent-sky hover:text-white transition-all active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <PlusCircle className="w-3 h-3" />
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 lg:gap-8">
                            <FocusAreaSelector 
                                focusAreas={focusAreas} 
                                setFocusAreas={setFocusAreas} 
                                mode="collaborative"
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                <ModelSelector 
                                    selectedModel={model}
                                    setSelectedModel={setModel}
                                />
                                <PolishDepthSelector 
                                    feedbackDepth={feedbackDepth} 
                                    setFeedbackDepth={setFeedbackDepth} 
                                    mode="collaborative"
                                />
                            </div>

                            <div className="space-y-6 lg:space-y-8">
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

                                <LoreContextManager 
                                    loreEntries={loreEntries} 
                                    onAddLoreEntry={onAddLoreEntry} 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {presetsOpen && activeTab === 'report' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
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
                            setFocusAreas={handleAutoSetFocus}
                        />
                    </div>
                )}
            </div>

            <button 
                onClick={handleRefine} 
                disabled={isRefining} 
                className="w-full flex items-center justify-center gap-3 px-4 lg:px-6 py-4 lg:py-5 bg-primary-saturated text-on-primary-saturated font-label uppercase tracking-[0.2em] text-xs lg:text-sm font-black rounded-3xl hover:bg-primary-saturated/90 disabled:bg-surface-container-highest disabled:text-on-surface-variant/30 transition-all shadow-primary-glow hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] mt-6 group relative overflow-hidden text-shadow-lavender"
            >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                {isRefining ? <Loader2 className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                <span>{isRefining ? 'ECHO IS POLISHING...' : (selection && selection.text.trim().length > 0 ? 'REFINE SELECTION' : 'REFINE WITH ECHO')}</span>
            </button>

            <SettingsModal 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
            />
        </>
    );
});