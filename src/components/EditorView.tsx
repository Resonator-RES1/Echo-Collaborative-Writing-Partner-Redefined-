import React, { useState, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, ChevronDown, ShieldCheck, FileText, BookOpen, History, BarChart3, Scissors, GitCompare, PenTool, Sun } from 'lucide-react';
import { RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice, Scene, WorkspaceTab } from '../types';
import { createScanner, ContinuityIssue } from '../utils/contextScanner';
import { draftReducer, initialDraftState } from './editor/draftReducer';
import { FormattingToolbar } from './editor/FormattingToolbar';
import { RichTextEditor } from './editor/RichTextEditor';
import { EditorFooter } from './editor/EditorFooter';
import { EditorModals } from './editor/EditorModals';
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
  const [continuityIssues, setContinuityIssues] = useState<ContinuityIssue[]>([]);

  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('draft');
  
  const scanner = useMemo(() => createScanner(loreEntries, voiceProfiles), [loreEntries, voiceProfiles]);
  
  const editorRef = useRef<any>(null);

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
                setScenes(prev => {
                    const updated = prev.map(s => s.id === currentSceneId ? { ...s, content: draftState.present, lastModified: new Date().toISOString() } : s);
                    const currentScene = updated.find(s => s.id === currentSceneId);
                    if (currentScene) db.putScene(currentScene); // Single Source of Truth DB Write
                    return updated;
                });
            }
        }
        setSaveStatus('saved');
    }, 5000);
    return () => clearTimeout(handler);
  }, [draftState.present, setDraft, currentSceneId, draft, setScenes]);

  useEffect(() => {
    if (saveStatus === 'saved') {
        const timer = setTimeout(() => setSaveStatus('idle'), 2000);
        return () => clearTimeout(timer);
    }
  }, [saveStatus]);

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
                      }}
                      onFix={handleContinuityFix}
                      showToast={showToast}
                      onIssuesUpdate={setContinuityIssues}
                  />
              </div>
              <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${activeTab === 'draft' ? 'flex' : 'hidden'}`}>
                  <div className={`flex-1 min-h-0 flex flex-col overflow-hidden max-w-2xl w-full mx-auto`}>
                      <RichTextEditor
                          editorRef={editorRef}
                          content={draftState.present}
                          onChange={(markdown) => dispatchDraft({ type: 'SET', payload: markdown })}
                          onSelectionChange={setSelection}
                          className="text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose text-on-surface"
                      />
                      {editorMode === 'polishing' && showDiff && (
                          <div className="mt-4 border-t border-outline-variant/20 pt-4">
                              <SideBySideDiff 
                                  original={draftState.original} 
                                  polished={draftState.present} 
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
                    localWarnings={continuityIssues}
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
      className={`flex flex-row h-full w-full overflow-hidden bg-surface text-on-surface ${isZenMode ? 'is-zen' : ''} ${isZenMode && !isUIVisible ? 'cursor-none' : ''}`}
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

      {/* Task 1: Vertical Sidebar (Process Rail) */}
      {!isZenMode && (
        <aside className="w-16 sm:w-20 flex flex-col items-center py-6 justify-between bg-surface-container-low/95 backdrop-blur-xl border-r border-outline-variant/10 z-30">
          <div className="flex flex-col gap-6">
            {[
              { id: 'draft', label: 'Draft', icon: FileText, step: '01' },
              { id: 'context', label: 'Context', icon: BookOpen, step: '02' },
              { id: 'refine', label: 'Refine', icon: Wand2, step: '03' },
              { id: 'archive', label: 'Archive', icon: History, step: '04' },
              { id: 'report', label: 'Report', icon: BarChart3, step: '05' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                  className="relative flex flex-col items-center group transition-all duration-300"
                  title={tab.label}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                    isActive 
                      ? 'bg-primary border-primary text-on-primary-fixed shadow-[0_0_20px_rgba(208,192,255,0.3)]' 
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                  }`}>
                    <tab.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`mt-2 text-[8px] sm:text-[9px] font-label font-bold uppercase tracking-widest transition-all duration-300 ${
                    isActive ? 'text-primary' : 'text-on-surface-variant/40 group-hover:text-primary/60'
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(208,192,255,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 pb-4">
            {/* Continuity Guard */}
            <button 
              onClick={() => setShowContinuityGuard(!showContinuityGuard)}
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl transition-all relative ${
                showContinuityGuard 
                  ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' 
                  : continuityIssues.length > 0 
                      ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 ring-1 ring-amber-500/50' 
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'
              }`}
              title="Continuity Guard"
            >
              <ShieldCheck className="w-5 h-5" />
              {continuityIssues.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-on-amber text-[8px] font-black">
                  {continuityIssues.length}
                </span>
              )}
            </button>

            <div className="h-px w-8 bg-outline-variant/20 mx-auto" />

            {/* Mode Buttons */}
            <button 
              onClick={() => {
                setActiveTab('draft');
                setEditorMode('drafting');
                setShowDiff(false);
              }}
              className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl transition-all ${editorMode === 'drafting' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
              title="Drafting Mode"
            >
              <PenTool className="w-5 h-5" />
            </button>

            <button 
              onClick={() => {
                dispatchDraft({ type: 'SET_ORIGINAL', payload: draftState.present });
                setEditorMode('polishing');
                setShowRecentChanges(false);
              }}
              className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl transition-all ${editorMode === 'polishing' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
              title="Manual Revision"
            >
              <Scissors className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsZenMode(!isZenMode)}
              className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl transition-all bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary`}
              title="Zen Mode"
            >
              <Sun className="w-5 h-5" />
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Main Canvas Area */}
        <main className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 ${isZenMode ? 'p-0' : 'p-4 lg:p-8'}`}>
          <div className={`flex-1 flex flex-col min-h-0 relative ${isZenMode ? '' : 'bg-surface-container-low/30 backdrop-blur-sm rounded-[2.5rem] border border-outline-variant/10 shadow-inner overflow-hidden'}`}>
            
            {/* Task 3: Centered Formatting Toolbar */}
            {activeTab === 'draft' && (
              <div className={`flex justify-center py-6 border-b border-outline-variant/5 transition-all duration-500 ${isZenMode && !isUIVisible ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <div className="max-w-2xl w-full px-4">
                  <FormattingToolbar editor={editorRef.current} />
                </div>
              </div>
            )}

            {/* Content Container */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;
