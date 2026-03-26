import React, { useState, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, ChevronDown, ShieldCheck, FileText, BookOpen, History, BarChart3, Sparkles, GitCompare, PenTool, Sun } from 'lucide-react';
import { RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice, Scene, WorkspaceTab } from '../types';
import { scanForContext, createScanner } from '../utils/contextScanner';
import { draftReducer, initialDraftState } from './editor/draftReducer';
import { FormattingToolbar, FormatType } from './editor/FormattingToolbar';
import { RichTextEditor } from './editor/RichTextEditor';
import { EditorFooter } from './editor/EditorFooter';
import { EditorModals } from './editor/EditorModals';
import { RefinementPresets } from './editor/RefinementPresets';
import { ContinuityGuard } from './editor/ContinuityGuard';
import { SideBySideDiff } from './editor/SideBySideDiff';
import { RecentChangesList } from './editor/RecentChangesList';
import { ContextPanel } from './editor/ContextPanel';
import { RefinePanel } from './editor/RefinePanel';
import { ArchivePanel } from './editor/ArchivePanel';
import { ReportPanel } from './editor/ReportPanel';

import { useLore } from '../contexts/LoreContext';
import { useProject } from '../contexts/ProjectContext';
import * as db from '../services/dbService';

interface EditorProps {
    draft: string;
    setDraft: (draft: string) => void;
    scenes: Scene[];
    currentSceneId: string | null;
    setCurrentSceneId: (id: string) => void;
    setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
    isRefining: boolean;
    setIsRefining: (isRefining: boolean) => void;
    showToast: (message: string) => void;
    onVersionCountChange?: (count: number) => void;
    onVersionHistoryChange?: (history: RefinedVersion[]) => void;
    versionHistory: RefinedVersion[];
    onAddVersion: (version: RefinedVersion) => void;
    onClearVersionHistory: () => void;
    onDeleteVersion: (id: string) => void;
    onAcceptVersion: (version: RefinedVersion) => void;
}

const Editor: React.FC<EditorProps> = ({ 
    draft, 
    setDraft, 
    scenes,
    currentSceneId,
    setCurrentSceneId,
    setScenes,
    isRefining, 
    setIsRefining, 
    showToast, 
    onVersionCountChange, 
    onVersionHistoryChange, 
    versionHistory,
    onAddVersion,
    onClearVersionHistory,
    onDeleteVersion,
    onAcceptVersion
}) => {
  const { isZenMode, setIsZenMode } = useProject();
  const { 
    loreEntries, 
    voiceProfiles, 
    authorVoices,
    addLoreEntry,
    deleteLoreEntry,
    addVoiceProfile,
    deleteVoiceProfile,
    addAuthorVoice,
    deleteAuthorVoice
  } = useLore();

  const [isUIVisible, setIsUIVisible] = useState(true);

  useEffect(() => {
    if (!isZenMode) {
      setIsUIVisible(true);
      return;
    }
  }, [isZenMode]);

  const handleGutterClick = (e: React.MouseEvent) => {
    if (!isZenMode) return;
    // Only toggle if clicking the background/gutter, not the editor itself
    if (e.target === e.currentTarget) {
      setIsUIVisible(!isUIVisible);
    }
  };

  const onAddLoreEntry = useCallback(async (entry: LoreEntry) => {
    await addLoreEntry(entry);
    showToast(`Lore entry "${entry.title}" updated.`);
  }, [addLoreEntry, showToast]);

  const onAddVoiceProfile = useCallback(async (profile: VoiceProfile) => {
    await addVoiceProfile(profile);
    showToast(`Voice profile for "${profile.name}" updated.`);
  }, [addVoiceProfile, showToast]);

  const onAddAuthorVoice = useCallback(async (voice: AuthorVoice) => {
    await addAuthorVoice(voice);
    showToast(`Author voice "${voice.name}" updated.`);
  }, [addAuthorVoice, showToast]);

  const onDeleteLoreEntry = useCallback(async (id: string) => {
    await deleteLoreEntry(id);
    showToast("Lore entry deleted.");
  }, [deleteLoreEntry, showToast]);

  const onDeleteVoiceProfile = useCallback(async (id: string) => {
    await deleteVoiceProfile(id);
    showToast("Voice profile deleted.");
  }, [deleteVoiceProfile, showToast]);

  const onDeleteAuthorVoice = useCallback(async (id: string) => {
    await deleteAuthorVoice(id);
    showToast("Author voice deleted.");
  }, [deleteAuthorVoice, showToast]);

  const [draftState, dispatchDraft] = useReducer(draftReducer, { ...initialDraftState, present: draft });
  const draftRef = useRef(draftState.present);
  
  useEffect(() => {
    draftRef.current = draftState.present;
  }, [draftState.present]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [editorMode, setEditorMode] = useState<'polishing' | 'drafting'>('polishing');
  
  useEffect(() => {
    onVersionCountChange?.(versionHistory.length);
  }, [versionHistory.length, onVersionCountChange]);

  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(0);
  
  const [showComparison, setShowComparison] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showLoreRevert, setShowLoreRevert] = useState(false);
  const [showContinuityGuard, setShowContinuityGuard] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showRecentChanges, setShowRecentChanges] = useState(false);
  const [continuityIssues, setContinuityIssues] = useState(0);

  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('draft');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; type: 'lore' | 'voice' }[]>([]);
  
  const scanner = useMemo(() => createScanner(loreEntries, voiceProfiles), [loreEntries, voiceProfiles]);
  
  const editorRef = useRef<any>(null);

  // Smart Context Detection
  useEffect(() => {
    const timer = setTimeout(() => {
        const text = draftState.present;
        if (!text.trim()) {
            setSuggestions([]);
            return;
        }

        const foundLoreIds = scanForContext(text, scanner.miniSearch);
        const foundVoiceIds = scanForContext(text, scanner.miniSearch);

        const newSuggestions: { id: string; name: string; type: 'lore' | 'voice' }[] = [];

        foundLoreIds.forEach(id => {
            const entry = loreEntries.find(e => e.id === id);
            if (entry && !entry.isActive) {
                newSuggestions.push({ id: entry.id, name: entry.title, type: 'lore' });
            }
        });

        foundVoiceIds.forEach(id => {
            const profile = voiceProfiles.find(p => p.id === id);
            if (profile && !profile.isActive) {
                newSuggestions.push({ id: profile.id, name: profile.name, type: 'voice' });
            }
        });

        setSuggestions(newSuggestions);
    }, 2000);

    return () => clearTimeout(timer);
  }, [draftState.present, loreEntries, voiceProfiles]);

  const handleActivateSuggestion = useCallback((suggestion: { id: string; type: 'lore' | 'voice' }) => {
    if (suggestion.type === 'lore') {
        const entry = loreEntries.find(e => e.id === suggestion.id);
        if (entry) onAddLoreEntry({ ...entry, isActive: true });
    } else {
        const profile = voiceProfiles.find(p => p.id === suggestion.id);
        if (profile) onAddVoiceProfile({ ...profile, isActive: true });
    }
    showToast(`Activated ${suggestion.type} context...`);
  }, [loreEntries, voiceProfiles, onAddLoreEntry, onAddVoiceProfile, showToast]);

  const handleContinuityFix = useCallback((original: string, replacement: string) => {
      // Use word boundaries for replacement to avoid partial word matches
      const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const newDraft = draftState.present.replace(regex, replacement);
      dispatchDraft({ type: 'SET', payload: newDraft });
  }, [draftState.present]);

  useEffect(() => {
    if (draft !== draftState.present) {
        dispatchDraft({ type: 'EXTERNAL_UPDATE', payload: draft });
    }
  }, [draft])

  useEffect(() => {
    setSaveStatus('saving');
    const handler = setTimeout(() => {
        if (draft !== draftState.present) {
            setDraft(draftState.present);
            
            if (currentSceneId) {
                const currentScene = scenes.find(s => s.id === currentSceneId);
                if (currentScene) {
                    db.putScene({
                        ...currentScene,
                        content: draftState.present,
                        lastModified: new Date().toISOString()
                    });
                }
            }
        }
        setSaveStatus('saved');
    }, 5000);
    return () => clearTimeout(handler);
  }, [draftState.present, setDraft, currentSceneId, scenes, draft]);

  useEffect(() => {
    if (saveStatus === 'saved') {
        const timer = setTimeout(() => setSaveStatus('idle'), 2000);
        return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleFormat = useCallback(async (format: FormatType) => {
      if (!selection || !selection.text.trim()) {
          showToast(`Please select text to format.`);
          return;
      }
  }, [selection, showToast]);

  const handleUpdateVersion = useCallback((index: number, content: string) => {
    const newHistory = [...versionHistory];
    if (index >= 0 && index < newHistory.length) {
        newHistory[index] = { ...newHistory[index], text: content };
        onVersionHistoryChange?.(newHistory);
    }
  }, [versionHistory, onVersionHistoryChange]);

  const currentVersion: RefinedVersion = versionHistory[currentVersionIndex] || { id: 'initial', text: '', timestamp: new Date().toISOString(), conflicts: [] };

  const wordCount = useMemo(() => {
      const text = draftState.present.trim();
      return text === '' ? 0 : text.split(/\s+/).length;
  }, [draftState.present]);

  const getDraft = useCallback(() => draftRef.current, []);

  const handleNewVersion = useCallback((version: RefinedVersion) => {
      const versionWithId = {
        ...version,
        id: version.id || Date.now().toString(),
        timestamp: version.timestamp || new Date().toISOString()
      };
      onAddVersion(versionWithId);
      setCurrentVersionIndex(0);
      
      // If it's a full draft refinement (not surgical), switch to report tab
      if (!version.isSurgical) {
          setActiveTab('report');
      }
  }, [onAddVersion]);

  const handleShowComparison = useCallback(() => {
    setShowComparison(true);
    setActiveTab('report');
  }, []);

  const handleAcceptVersion = useCallback((version: RefinedVersion) => {
    onAcceptVersion(version);
    dispatchDraft({ type: 'EXTERNAL_UPDATE', payload: version.text });
    setActiveTab('draft');
  }, [onAcceptVersion]);

  useEffect(() => {
    const handleViewReport = (e: Event) => {
        const customEvent = e as CustomEvent<RefinedVersion>;
        const version = customEvent.detail;
        if (version) {
            // Find the index of this version in the history
            const index = versionHistory.findIndex(v => v.id === version.id);
            if (index !== -1) {
                setCurrentVersionIndex(index);
                setActiveTab('report');
            }
        }
    };
    window.addEventListener('view-report', handleViewReport);
    return () => window.removeEventListener('view-report', handleViewReport);
  }, [versionHistory]);

  const handleSelectArchiveVersion = useCallback((index: number) => {
      setCurrentVersionIndex(index);
      setShowComparison(true);
  }, []);

  const handleActivateLore = useCallback((id: string) => {
    const entry = loreEntries.find(e => e.id === id);
    if (entry) {
        onAddLoreEntry({ ...entry, isActive: true });
    }
  }, [loreEntries, onAddLoreEntry]);

  const handleActivateVoice = useCallback((id: string) => {
    const profile = voiceProfiles.find(v => v.id === id);
    if (profile) {
        onAddVoiceProfile({ ...profile, isActive: true });
    }
  }, [voiceProfiles, onAddVoiceProfile]);

  const handleRevertLore = useCallback(() => {
      if (!currentVersion.loreCorrections || currentVersion.loreCorrections.length === 0) {
          showToast("No lore corrections detected in this version.");
          return;
      }
      setShowLoreRevert(true);
  }, [currentVersion, showToast]);

  const handleRevertSpecificLore = useCallback((correction: any) => {
      const newHistory = [...versionHistory];
      const version = { ...newHistory[currentVersionIndex] };
      
      // Use regex with global flag to replace all occurrences if needed, 
      // but usually AI points to a specific term.
      // Escaping refined text for regex
      const escapedRefined = correction.refined.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedRefined, 'g');
      
      version.text = version.text.replace(regex, correction.original);
      version.loreCorrections = version.loreCorrections?.filter(c => c !== correction);
      
      newHistory[currentVersionIndex] = version;
      onVersionHistoryChange?.(newHistory);
      showToast(`Reverted "${correction.refined}" to "${correction.original}"`);
      
      if (version.loreCorrections?.length === 0) {
          setShowLoreRevert(false);
      }
  }, [versionHistory, currentVersionIndex, onVersionHistoryChange, showToast]);

  const renderTabContent = () => {
      return (
          <>
              <div className={showContinuityGuard ? 'block' : 'hidden'}>
                  <ContinuityGuard 
                      draft={draft}
                      loreEntries={loreEntries}
                      voiceProfiles={voiceProfiles}
                      currentScene={currentScene}
                      scanner={scanner}
                      onActivateLore={handleActivateLore}
                      onActivateVoice={handleActivateVoice}
                      onViewLore={(id) => {
                          setActiveTab('context');
                          // We could also trigger a scroll or highlight here if needed
                      }}
                      onFix={handleContinuityFix}
                      showToast={showToast}
                      onIssuesUpdate={setContinuityIssues}
                  />
              </div>
              <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${activeTab === 'draft' ? 'flex' : 'hidden'}`}>
                  <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${isZenMode ? 'w-full mx-auto' : 'mt-2'}`}>
                      <RichTextEditor
                          editorRef={editorRef}
                          content={draftState.present}
                          onChange={(markdown) => dispatchDraft({ type: 'SET', payload: markdown })}
                          onSelectionChange={setSelection}
                          className={`font-headline text-xl tracking-tight leading-relaxed text-on-surface/90 ${isZenMode ? 'font-serif' : ''}`}
                      />
                      {editorMode === 'polishing' && showDiff && (
                          <div className="mt-4 border-t border-outline-variant/20 pt-4">
                              <SideBySideDiff 
                                  original={draftState.original} 
                                  polished={draftState.present} 
                                  report={currentVersion as any}
                                  onSeeReport={handleSeeReport}
                                  onAcceptChanges={handleAcceptChanges}
                              />
                          </div>
                      )}
                      {editorMode === 'drafting' && showRecentChanges && (
                          <div className="mt-4 border-t border-outline-variant/20 pt-4">
                              <div className="flex flex-col max-h-[50vh] bg-surface-container-low border border-outline-variant/20 rounded-[0.75rem] overflow-hidden">
                                  <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low z-10">
                                      <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant m-0">Recent Changes</h4>
                                  </div>
                                  <div className="overflow-y-auto custom-scrollbar p-4 text-xs text-on-surface-variant/70">
                                      <RecentChangesList original={draftState.loadedDraft || ''} current={draftState.present} />
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className={`transition-all duration-500 ${isZenMode ? 'zen-ui-element' : ''} ${isZenMode && !isUIVisible ? 'zen-ui-hidden' : 'zen-ui-visible'}`}>
                    <EditorFooter 
                        saveStatus={saveStatus}
                        wordCount={wordCount}
                    />
                  </div>
              </div>

              {activeTab === 'context' && (
                  <ContextPanel 
                    loreEntries={loreEntries}
                    voiceProfiles={voiceProfiles}
                    authorVoices={authorVoices}
                    onAddLoreEntry={onAddLoreEntry}
                    onDeleteLoreEntry={onDeleteLoreEntry} 
                    onAddVoiceProfile={onAddVoiceProfile}
                    onDeleteVoiceProfile={onDeleteVoiceProfile} 
                    onAddAuthorVoice={onAddAuthorVoice}
                    onDeleteAuthorVoice={onDeleteAuthorVoice} 
                    suggestions={suggestions}
                    onActivateSuggestion={handleActivateSuggestion}
                  />
              )}
              {activeTab === 'refine' && (
                  <RefinePanel 
                    draft={draftState.present}
                    isRefining={isRefining}
                    setIsRefining={setIsRefining}
                    showToast={showToast}
                    onNewVersion={handleNewVersion}
                    loreEntries={loreEntries}
                    voiceProfiles={voiceProfiles}
                    authorVoices={authorVoices}
                    onAddLoreEntry={onAddLoreEntry}
                    onAddVoiceProfile={onAddVoiceProfile}
                    onAddAuthorVoice={onAddAuthorVoice}
                    currentSceneId={currentSceneId}
                    storyDay={currentScene?.storyDay}
                    selection={selection}
                    editorRef={editorRef}
                    setActiveTab={setActiveTab}
                    scanner={scanner}
                  />
              )}
              {activeTab === 'archive' && (
                  <ArchivePanel 
                    versionHistory={versionHistory}
                    currentVersionIndex={currentVersionIndex}
                    originalDraft={draftState.present}
                    onSelectVersion={handleSelectArchiveVersion}
                    onDeleteVersion={onDeleteVersion}
                    onClearHistory={onClearVersionHistory}
                    onAcceptVersion={handleAcceptVersion}
                    showToast={showToast}
                    onRevertSpecificLore={handleRevertSpecificLore}
                    setActiveTab={setActiveTab}
                  />
              )}
              {activeTab === 'report' && (
                  <ReportPanel 
                    version={currentVersion}
                    original={draftState.present}
                    onAccept={handleAcceptVersion}
                    onRevertLore={handleRevertLore}
                    onRevertSpecificLore={handleRevertSpecificLore}
                  />
              )}
          </>
      );
  };

  const currentScene = useMemo(() => 
    scenes.find(s => s.id === currentSceneId),
  [scenes, currentSceneId]);

  const handleSeeReport = useCallback(() => setActiveTab('report'), []);
  const handleAcceptChanges = useCallback(() => {
      setEditorMode('drafting');
      setShowDiff(false);
      showToast("Changes accepted and saved to draft.");
  }, [showToast]);

  return (
    <div 
      onClick={handleGutterClick}
      className={`flex flex-col lg:flex-row gap-4 lg:gap-8 flex-1 min-h-0 animate-in fade-in duration-700 ${isZenMode ? 'is-zen' : ''} ${isZenMode && !isUIVisible ? 'cursor-none' : ''}`}
    >
      
      <EditorModals 
        showComparison={showComparison}
        showConflicts={showConflicts}
        showLoreRevert={showLoreRevert}
        currentVersion={currentVersion}
        originalDraft={draftState.present}
        conflicts={currentVersion.conflicts || []}
        loreCorrections={currentVersion.loreCorrections || []}
        setShowComparison={setShowComparison}
        setShowConflicts={setShowConflicts}
        setShowLoreRevert={setShowLoreRevert}
        onRevertLore={handleRevertLore}
        onRevertSpecificLore={handleRevertSpecificLore}
        onAcceptVersion={handleAcceptVersion}
        setActiveTab={setActiveTab}
      />
      
      <section className={`flex-1 flex flex-col min-h-0 transition-all duration-500`}>
        <div className={`bg-surface-container-low/50 backdrop-blur-sm rounded-[0.75rem] shadow-2xl ghost-border flex flex-col flex-1 relative min-h-0 overflow-hidden transition-all duration-500 ${isZenMode ? 'border-none bg-transparent shadow-none p-0' : 'p-4 lg:p-6'}`}>
          
          {/* Workspace Process Flow Rail */}
          {!isZenMode && (
              <div className="sticky top-0 z-20 bg-surface-container-low/95 backdrop-blur-md py-3 sm:py-5 -mx-4 px-4 lg:-mx-6 lg:px-6 mb-3 sm:mb-5 border-b border-outline-variant/10 overflow-hidden">
                  <div className="relative flex items-center justify-between max-w-3xl mx-auto px-2 sm:px-12">
                      {/* Connecting Line Background */}
                      <div className="absolute left-8 right-8 sm:left-12 sm:right-12 h-[1px] bg-outline-variant/20 top-[16px] sm:top-[20px] z-0" />
                      
                      {/* Progress Line */}
                      <motion.div 
                        className="absolute left-8 sm:left-12 h-[1px] bg-primary z-0 top-[16px] sm:top-[20px]" 
                        initial={false}
                        animate={{ 
                          width: `calc(${(['draft', 'context', 'refine', 'archive', 'report'].indexOf(activeTab) / 4) * 100}% - 0px)` 
                        }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                      
                      {[
                          { id: 'draft', label: 'Draft', icon: FileText, step: '01' },
                          { id: 'context', label: 'Context', icon: BookOpen, step: '02' },
                          { id: 'refine', label: 'Refine', icon: Sparkles, step: '03' },
                          { id: 'archive', label: 'Archive', icon: History, step: '04' },
                          { id: 'report', label: 'Report', icon: BarChart3, step: '05' }
                      ].map((tab, index, array) => {
                          const isActive = activeTab === tab.id;
                          const isPast = array.findIndex(t => t.id === activeTab) > index;
                          
                          return (
                              <button
                                  key={tab.id}
                                  onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                                  className="relative z-10 flex flex-col items-center group transition-all duration-300"
                              >
                                  {/* Node */}
                                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 border ${
                                      isActive 
                                          ? 'bg-primary border-primary text-on-primary-fixed shadow-[0_0_20px_rgba(208,192,255,0.3)] scale-110' 
                                          : isPast
                                              ? 'bg-surface-container-highest border-primary/40 text-primary'
                                              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                                  }`}>
                                      <tab.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                  </div>
                                  
                                  {/* Label Container */}
                                  <div className="absolute -bottom-6 sm:-bottom-8 flex flex-col items-center whitespace-nowrap">
                                      <span className={`hidden sm:block text-[8px] font-mono tracking-tighter transition-opacity duration-300 mb-0.5 ${isActive ? 'opacity-100 text-primary' : 'opacity-30'}`}>
                                          {tab.step}
                                      </span>
                                      <span className={`text-[8px] sm:text-[10px] font-label font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all duration-300 ${
                                          isActive 
                                            ? 'text-primary scale-105' 
                                            : 'text-on-surface-variant/40 group-hover:text-primary/60'
                                      }`}>
                                          {tab.label}
                                      </span>
                                  </div>

                                  {/* Active Indicator Glow */}
                                  {isActive && (
                                    <motion.div 
                                      layoutId="active-flow-glow"
                                      className="absolute -inset-2 bg-primary/5 rounded-full blur-xl -z-10"
                                    />
                                  )}
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}

          {/* Main Editor Top Bar */}
          {activeTab === 'draft' && (
              <div className={`relative bg-surface-container-low/95 backdrop-blur-sm pb-2 border-b border-outline-variant/20 mb-2 sm:mb-3 -mx-4 px-4 lg:-mx-6 lg:px-6 flex items-center justify-between gap-2 sm:gap-4 min-h-[40px] transition-all duration-500 ${isZenMode ? 'zen-ui-element !mx-0 !px-0 mb-8' : ''} ${isZenMode && !isUIVisible ? 'zen-ui-hidden' : 'zen-ui-visible'}`}>
                  {/* Left: Formatting Toolbar */}
                  <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar z-10 pr-[100px] sm:pr-[150px]">
                      <FormattingToolbar 
                          editor={editorRef.current}
                          onFormat={handleFormat} 
                          hasSelection={!!selection && selection.text.trim().length > 0} 
                      />
                  </div>
                  
                  {/* Center: Continuity Guard */}
                  <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+4px)] flex justify-center z-20 pointer-events-none transition-all duration-500 ${isZenMode ? 'zen-ui-element' : ''} ${isZenMode && !isUIVisible ? 'zen-ui-hidden' : 'zen-ui-visible'}`}>
                      <button 
                          onClick={() => setShowContinuityGuard(!showContinuityGuard)}
                          className={`pointer-events-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                              showContinuityGuard 
                                ? 'bg-primary text-on-primary-fixed' 
                                : continuityIssues > 0 
                                    ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 ring-1 ring-amber-500/50' 
                                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'
                          }`}
                          title="Continuity Guard"
                      >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Continuity Guard</span>
                          {continuityIssues > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-on-amber text-[8px] font-black">
                                  {continuityIssues}
                              </span>
                          )}
                      </button>
                  </div>

                  {/* Right: Mode/View Buttons */}
                  <div className={`flex-none flex justify-end gap-1 sm:gap-2 z-10 transition-all duration-500 ${isZenMode ? 'zen-ui-element' : ''} ${isZenMode && !isUIVisible ? 'zen-ui-hidden' : 'zen-ui-visible'}`}>
                      <button 
                          onClick={() => setIsZenMode(!isZenMode)}
                          className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isZenMode ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
                          title="Zen Sanctuary (Esc to exit)"
                      >
                          <Sun className={`w-4 h-4 transition-transform duration-700 ${isZenMode ? 'rotate-180 scale-110' : ''}`} />
                      </button>
                      <button 
                          onClick={() => {
                              setActiveTab('draft');
                              setEditorMode('drafting');
                              setShowDiff(false);
                          }}
                          className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${editorMode === 'drafting' ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
                          title="Drafting Mode"
                      >
                          <PenTool className="w-4 h-4" />
                      </button>
                      <button 
                          onClick={() => {
                              dispatchDraft({ type: 'SET_ORIGINAL', payload: draftState.present });
                              setEditorMode('polishing');
                              setShowRecentChanges(false);
                          }}
                          className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${editorMode === 'polishing' ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
                          title="Polishing Mode"
                      >
                          <Sparkles className="w-4 h-4" />
                      </button>

                      <button 
                          onClick={() => setActiveTab('refine')}
                          className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary`}
                          title="Surgical Refine"
                      >
                          <Wand2 className="w-4 h-4" />
                      </button>
                      
                      {editorMode === 'polishing' && (
                          <button 
                              onClick={() => setShowDiff(!showDiff)}
                              className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${showDiff ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
                              title="Toggle Diff Viewer"
                          >
                              <GitCompare className="w-4 h-4" />
                          </button>
                      )}
                      
                      {editorMode === 'drafting' && (
                          <button 
                              onClick={() => setShowRecentChanges(!showRecentChanges)}
                              className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${showRecentChanges ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
                              title="Toggle Recent Changes"
                          >
                              <History className="w-4 h-4" />
                          </button>
                      )}
                  </div>
              </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {renderTabContent()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Editor;
