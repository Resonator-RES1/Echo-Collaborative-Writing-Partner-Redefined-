import React, { useState, useCallback, useEffect } from 'react';
import {
    Sparkles, Loader2, ChevronDown, ChevronUp, Zap, AlertCircle, Settings
} from 'lucide-react';
import { FocusAreaSelector } from './presets/FocusAreaSelector';
import { PolishDepthSelector } from './presets/PolishDepthSelector';
import { ModelSelector } from './presets/ModelSelector';
import { FocusArea, FeedbackDepth, RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice, WorkspaceTab } from '../../types';
import { refineDraft } from '../../services/geminiService';
import { ContinuityIssue } from '../../utils/contextScanner';
import { SettingsModal } from '../SettingsModal';

const DEPTH_CONFIG: Record<FeedbackDepth, { label: string; thinkingLevel: 'low' | 'default' | 'high' }> = {
  casual: { label: 'Casual Polish', thinkingLevel: 'low' },
  balanced: { label: 'Balanced Polish', thinkingLevel: 'default' },
  'in-depth': { label: 'In-depth Polish', thinkingLevel: 'high' },
};

interface RefinementPresetsProps {
    getDraft: () => string;
    selection: { text: string; start: number; end: number } | null;
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
    storyDay?: number;
    editorRef?: React.MutableRefObject<any>;
    setActiveTab?: (tab: WorkspaceTab) => void;
    localWarnings?: ContinuityIssue[];
}

function replaceClosestOccurrence(fullText: string, searchText: string, replacementText: string, estimatedIndex: number): string {
    if (!searchText) return fullText;
    
    let bestIndex = -1;
    let minDistance = Infinity;
    let currentIndex = fullText.indexOf(searchText);
    
    while (currentIndex !== -1) {
        const distance = Math.abs(currentIndex - estimatedIndex);
        if (distance < minDistance) {
            minDistance = distance;
            bestIndex = currentIndex;
        }
        currentIndex = fullText.indexOf(searchText, currentIndex + 1);
    }
    
    if (bestIndex !== -1) {
        return fullText.substring(0, bestIndex) + replacementText + fullText.substring(bestIndex + searchText.length);
    }
    
    // Fallback if not found exactly (e.g. due to markdown formatting differences)
    return fullText.replace(searchText, replacementText);
}

export const RefinementPresets: React.FC<RefinementPresetsProps> = React.memo((props) => {
    const {
        getDraft, selection, isRefining, setIsRefining, showToast, onNewVersion,
        loreEntries, voiceProfiles, authorVoices,
        onAddLoreEntry, onAddVoiceProfile, onAddAuthorVoice,
        currentSceneId, storyDay, editorRef, setActiveTab, localWarnings
    } = props;

    const [presetsOpen, setPresetsOpen] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
    const [model, setModel] = useState<'gemini-3.1-flash-lite-preview' | 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview'>('gemini-3.1-flash-lite-preview');
    const [feedbackDepth, setFeedbackDepth] = useState<FeedbackDepth>('balanced');

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

        // Determine correct thinking level
        const currentThinkingLevel = DEPTH_CONFIG[feedbackDepth]?.thinkingLevel ?? 'default';

        const options = {
          draft: textToRefine,
          fullContextDraft: isTargeted ? fullDraft : undefined,
          selection: isTargeted ? selection : undefined,
          generationConfig: { 
              model, 
              temperature: 1.0, // Forced to 1.0 for Gemini 3.1 reasoning stability
              thinkingConfig: { thinkingLevel: currentThinkingLevel } 
          },
          focusAreas,
          loreEntries, voiceProfiles, authorVoices,
          feedbackDepth,
          storyDay,
          localWarnings,
          isSurgical: isTargeted
        };

        const result = await refineDraft(options);
        
        // Reset workspace parameters after refinement as requested
        // (But keep lore/voice/author profiles active in the workspace)
        setFocusAreas([]);
        setModel('gemini-3.1-flash-lite-preview');
        setFeedbackDepth('balanced');
        
        let finalRefinedText = result.text;
        let extractedTitle = '';
        
        if (isTargeted && editorRef?.current) {
             // APPLY DIRECTLY TO EDITOR AS REQUESTED
             // We use a token replacement method to perfectly preserve markdown formatting
             const currentState = editorRef.current.state;
             const token = `ECHOREFINETOKEN${Date.now()}`;
             
             // Insert token at selection
             editorRef.current.commands.insertContentAt({ from: selection.start, to: selection.end }, token);
             
             // Get markdown with token
             const markdownWithToken = editorRef.current.storage.markdown.getMarkdown();
             
             // Replace token with refined text in the markdown string for the version history
             finalRefinedText = markdownWithToken.replace(token, () => result.text);

             // Now apply the refined text directly to the editor at the selection
             // We restore original state first to clear the token, then insert the real result
             editorRef.current.view.updateState(currentState);
             editorRef.current.commands.insertContent(result.text);
             
             // Switch to draft tab so user sees the change
             if (setActiveTab) setActiveTab('draft');
        } else if (isTargeted) {
             // Fallback if editorRef is not available
             finalRefinedText = replaceClosestOccurrence(fullDraft, selection.text, result.text, selection.start);
        } else {
            // Try to extract title from the first line if it starts with #
            const lines = result.text.split('\n').filter(l => l.trim() !== '');
            if (lines.length > 0 && lines[0].startsWith('#')) {
                extractedTitle = lines[0].replace(/^#+\s*/, '').trim();
            }
            
            // If still empty or just "Title", try to extract from the original draft
            if (!extractedTitle || extractedTitle.toLowerCase() === 'title') {
                const originalLines = fullDraft.split('\n').filter(l => l.trim() !== '');
                if (originalLines.length > 0 && originalLines[0].startsWith('#')) {
                    extractedTitle = originalLines[0].replace(/^#+\s*/, '').trim();
                }
            }
            
            // Limit length to prevent UI issues if AI returns a long first line
            if (extractedTitle && extractedTitle.length > 100) {
                extractedTitle = extractedTitle.substring(0, 97) + '...';
            }
        }

        // For surgical refinements, create a more descriptive title
        let finalTitle = extractedTitle;
        if (isTargeted) {
            const snippet = selection.text.trim().substring(0, 30);
            finalTitle = `Surgical: "${snippet}${selection.text.length > 30 ? '...' : ''}"`;
        } else if (!finalTitle || finalTitle.toLowerCase() === 'title') {
            finalTitle = `Refinement ${new Date().toLocaleTimeString()}`;
        }

        const newVersion: RefinedVersion = {
            ...result,
            text: finalRefinedText,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            title: finalTitle,
            summary: isTargeted ? `Targeted Refinement: ${result.summary}` : result.summary,
            analysis: result.analysis,
            conflicts: result.conflicts,
            metrics: result.metrics,
            loreCorrections: result.loreCorrections,
            sceneId: currentSceneId || undefined,
            activeContext: result.activeContext,
            isSurgical: isTargeted,
            originalSelection: isTargeted ? selection.text : undefined,
            refinedSelection: isTargeted ? result.text : undefined,
            usedProfiles: {
                authorVoice: authorVoices.find(v => v.isActive)?.name,
                characterVoices: voiceProfiles.filter(v => v.isActive).map(v => v.name),
                loreEntries: loreEntries.filter(e => e.isActive).map(e => e.title),
                focusAreas: focusAreas
            }
        };

        onNewVersion(newVersion);
        showToast(isTargeted ? "Targeted refinement applied directly!" : "New version created!");
        setIsRefining(false);
    }, [getDraft, selection, model, feedbackDepth, focusAreas, showToast, setIsRefining, onNewVersion, loreEntries, voiceProfiles, authorVoices, currentSceneId, editorRef, setActiveTab]);

    // Calculate Prompt Efficiency
    const totalLoreChars = loreEntries.reduce((acc, e) => acc + e.content.length, 0);
    const activeLoreChars = loreEntries.filter(e => e.isActive).reduce((acc, e) => acc + e.content.length, 0);
    const totalVoiceChars = voiceProfiles.reduce((acc, p) => acc + (p.soulPattern?.length || 0), 0);
    const activeVoiceChars = voiceProfiles.filter(p => p.isActive).reduce((acc, p) => acc + (p.soulPattern?.length || 0), 0);
    
    const totalContext = totalLoreChars + totalVoiceChars;
    const activeContext = activeLoreChars + activeVoiceChars;
    const efficiency = totalContext > 0 ? Math.round((1 - (activeContext / totalContext)) * 100) : 0;

    const CONTEXT_LIMIT = 15000;
    const contextPercentage = Math.min((activeContext / CONTEXT_LIMIT) * 100, 100);
    const getContextColor = () => {
        if (contextPercentage > 90) return 'bg-error';
        if (contextPercentage > 70) return 'bg-accent-amber';
        return 'bg-primary';
    };

    return (
        <div className="space-y-6">
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
                            <span>Refinement Setup</span>
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
                    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Context Meter */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Context Payload</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${contextPercentage > 90 ? 'text-error' : 'text-on-surface-variant/50'}`}>
                                    {activeContext.toLocaleString()} / {CONTEXT_LIMIT.toLocaleString()} Chars
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ease-out ${getContextColor()}`}
                                    style={{ width: `${contextPercentage}%` }}
                                />
                            </div>
                            {contextPercentage > 80 && (
                                <p className="text-[9px] text-accent-amber font-bold italic flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Approaching Cognitive Overload. Consider deactivating non-essential Lore.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:gap-8">
                            <FocusAreaSelector 
                                focusAreas={focusAreas} 
                                setFocusAreas={setFocusAreas} 
                                mode="collaborative"
                            />
                            
                            <div className="grid grid-cols-1 gap-6 lg:gap-8">
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
                        </div>
                    </div>
                )}
            </div>

            <button 
                onClick={handleRefine} 
                disabled={isRefining} 
                className="w-full flex items-center justify-center gap-3 px-4 lg:px-6 py-4 lg:py-5 bg-primary text-on-primary-fixed font-label uppercase tracking-[0.2em] text-xs lg:text-sm font-black rounded-3xl hover:bg-primary/90 disabled:bg-surface-container-highest disabled:text-on-surface-variant/30 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                {isRefining ? <Loader2 className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                <span>{isRefining ? 'ECHO IS POLISHING...' : (selection && selection.text.trim().length > 0 ? 'REFINE SELECTION ONLY' : 'REFINE WITH ECHO')}</span>
            </button>

            <SettingsModal 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
                showToast={showToast}
            />
        </div>
    );
});
