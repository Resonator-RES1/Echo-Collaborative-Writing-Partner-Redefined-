import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice, Scene, WorkspaceTab, Chapter } from '../types';
import { createScanner, ContinuityIssue } from '../utils/contextScanner';
import { EditorModals } from './editor/EditorModals';
import { ContinuityGuard } from './editor/ContinuityGuard';
import { ContextPanel } from './editor/ContextPanel';
import { RefinePanel } from './editor/RefinePanel';
import { ArchivePanel } from './editor/ArchivePanel';
import { ReportPanel } from './editor/ReportPanel';
import { SceneManager } from './editor/SceneManager';
import { LocalAuditSuite } from './editor/LocalAuditSuite';
import LoreView from './LoreView';
import VoicesView from './VoicesView';

import { useLore } from '../contexts/LoreContext';
import { useProject } from '../contexts/ProjectContext';
import { useEditorLogic } from '../hooks/useEditorLogic';
import { EditorCanvas } from './editor/EditorCanvas';
import { 
  Book, 
  Settings, 
  Home, 
  Database, 
  Mic2, 
  FileText, 
  Target, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditorProps {
    draft: string;
    setDraft: (draft: string) => void;
    scenes: Scene[];
    chapters: Chapter[];
    currentSceneId: string | null;
    setCurrentSceneId: (id: string) => void;
    setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
    setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
    isRefining: boolean;
    setIsRefining: (isRefining: boolean) => void;
    showToast: (message: string) => void;
    onVersionCountChange?: (count: number) => void;
    onVersionHistoryChange?: (history: RefinedVersion[]) => void;
    versionHistory: RefinedVersion[];
    onAddVersion: (version: RefinedVersion) => void;
    onClearVersionHistory: () => void;
    onDeleteVersion: (id: string) => void;
    onUpdateVersion: (version: RefinedVersion) => void;
    onAcceptVersion: (version: RefinedVersion) => void;
}

// Main Editor View Component
const Editor: React.FC<EditorProps> = ({ 
    draft, 
    setDraft, 
    scenes,
    chapters,
    currentSceneId,
    setCurrentSceneId,
    setScenes,
    setChapters,
    isRefining, 
    setIsRefining, 
    showToast, 
    onVersionCountChange, 
    onVersionHistoryChange, 
    versionHistory,
    onAddVersion,
    onClearVersionHistory,
    onDeleteVersion,
    onUpdateVersion,
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
  const [showConstruct, setShowConstruct] = useState(true);
  const [showAudit, setShowAudit] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('draft');
  const [activeHUD, setActiveHUD] = useState<'lore' | 'voices' | null>(null);
  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const [surgicalSelection, setSurgicalSelection] = useState<{ text: string; start: number; end: number } | null>(null);

  const [displayPrefs, setDisplayPrefs] = useState(() => {
    const saved = localStorage.getItem('echo-display-prefs');
    return saved ? JSON.parse(saved) : { fontSize: 18, lineHeight: 1.8, paragraphSpacing: 1.5, maxWidth: 'max-w-3xl' };
  });

  useEffect(() => {
    localStorage.setItem('echo-display-prefs', JSON.stringify(displayPrefs));
  }, [displayPrefs]);

  const {
    draftState,
    dispatchDraft,
    saveStatus,
    currentVersionIndex,
    setCurrentVersionIndex,
    handleNewVersion,
    handleAcceptVersion
  } = useEditorLogic({
    draft,
    setDraft,
    currentSceneId,
    setScenes,
    versionHistory,
    onAddVersion,
    onAcceptVersion,
    setActiveTab
  });

  // Zen Mode Logic
  useEffect(() => {
    if (isZenMode) {
      setActiveTab('draft');
      setActiveHUD(null);
      setIsUIVisible(true);
    }
  }, [isZenMode, setIsZenMode]);

  // Sovereign Keymap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S: Save (Already handled by useEditorLogic auto-save, but we can trigger a manual save if needed)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        showToast('Draft saved locally');
      }
      // Cmd+Enter: Refine Selection
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (selection?.text) {
          e.preventDefault();
          setActiveTab('refine');
        }
      }
      // Cmd+K: Global Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-global-search'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, showToast]);

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

  const [editorMode, setEditorMode] = useState<'polishing' | 'drafting'>('polishing');
  
  useEffect(() => {
    onVersionCountChange?.(versionHistory.length);
  }, [versionHistory.length, onVersionCountChange]);

  const [showComparison, setShowComparison] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showLoreRevert, setShowLoreRevert] = useState(false);
  const [showContinuityGuard, setShowContinuityGuard] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showRecentChanges, setShowRecentChanges] = useState(false);
  const [continuityIssues, setContinuityIssues] = useState<ContinuityIssue[]>([]);

  const scanner = useMemo(() => createScanner(loreEntries, voiceProfiles), [loreEntries, voiceProfiles]);
  
  const editorRef = useRef<any>(null);

  const handleContinuityFix = useCallback((original: string, replacement: string) => {
      // Use word boundaries for replacement to avoid partial word matches
      const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
      const newDraft = draftState.present.replace(regex, replacement);
      dispatchDraft({ type: 'SET', payload: newDraft });
  }, [draftState.present, dispatchDraft]);

  const currentVersion: RefinedVersion = versionHistory[currentVersionIndex] || { id: 'initial', text: '', timestamp: new Date().toISOString(), conflicts: [] };

  const wordCount = useMemo(() => {
      const text = (draftState.present || '').trim();
      return text === '' ? 0 : text.split(/\s+/).length;
  }, [draftState.present]);

  const handleShowComparison = useCallback(() => {
    setShowComparison(true);
    setActiveTab('report');
  }, []);

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
  }, [versionHistory, setCurrentVersionIndex]);

  const handleSelectArchiveVersion = useCallback((index: number) => {
      setCurrentVersionIndex(index);
      setShowComparison(true);
  }, [setCurrentVersionIndex]);

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
      const escapedRefined = correction.refined.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
      const regex = new RegExp(escapedRefined, 'g');
      
      version.text = version.text.replace(regex, correction.original);
      version.loreCorrections = version.loreCorrections?.filter((c: any) => c !== correction);
      
      newHistory[currentVersionIndex] = version;
      onVersionHistoryChange?.(newHistory);
      showToast(`Reverted "${correction.refined}" to "${correction.original}"`);
      
      if (version.loreCorrections?.length === 0) {
          setShowLoreRevert(false);
      }
  }, [versionHistory, currentVersionIndex, onVersionHistoryChange, showToast]);

  const currentScene = useMemo(() => 
    scenes.find(s => s.id === currentSceneId),
  [scenes, currentSceneId]);

  const project = useMemo(() => {
    const saved = localStorage.getItem('echo-projects');
    if (saved) {
      const projects = JSON.parse(saved);
      return projects.find((p: any) => p.id === currentScene?.projectId) || { name: 'Untethered Draft' };
    }
    return { name: 'Untethered Draft' };
  }, [currentScene]);

  const handleAcceptChanges = useCallback(() => {
      setEditorMode('drafting');
      setShowDiff(false);
      showToast("Changes accepted and saved to draft.");
  }, [showToast]);

  const renderTabContent = () => {
      return (
          <>
              <div className={showContinuityGuard ? 'block' : 'hidden'}>
                  <ContinuityGuard 
                      draft={draftState.present}
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
              
              {activeTab === 'draft' && (
                <EditorCanvas
                  activeTab={activeTab}
                  isZenMode={isZenMode}
                  isUIVisible={isUIVisible}
                  setIsZenMode={setIsZenMode}
                  editorRef={editorRef}
                  editorMode={editorMode}
                  setEditorMode={setEditorMode}
                  showRecentChanges={showRecentChanges}
                  setShowRecentChanges={setShowRecentChanges}
                  showDiff={showDiff}
                  setShowDiff={setShowDiff}
                  showConstruct={showConstruct}
                  setShowConstruct={setShowConstruct}
                  displayPrefs={displayPrefs}
                  setDisplayPrefs={setDisplayPrefs}
                  setActiveTab={setActiveTab}
                  dispatchDraft={dispatchDraft}
                  draftState={draftState}
                  selection={selection}
                  surgicalSelection={surgicalSelection}
                  setSurgicalSelection={setSurgicalSelection}
                  setSelection={setSelection}
                  handleAcceptChanges={handleAcceptChanges}
                  saveStatus={saveStatus}
                  wordCount={wordCount}
                />
              )}

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
                    onUpdateVersion={onUpdateVersion}
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

  const goal = useMemo(() => {
    const saved = localStorage.getItem('echo-writing-goal');
    return saved ? JSON.parse(saved) : { targetWords: 50000 };
  }, []);

  const progress = Math.min(100, Math.round((wordCount / (goal.dailyTarget || 2000)) * 100));

  return (
    <div 
      onClick={handleGutterClick}
      className={`flex flex-col h-full w-full overflow-hidden bg-surface text-on-surface ${isZenMode ? 'is-zen' : ''} ${isZenMode && !isUIVisible ? 'cursor-none' : ''}`}
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

      {/* Task 1: Consolidated Header */}
      {!isZenMode && (
        <header className="h-12 flex-shrink-0 bg-surface-container-lowest border-b border-outline-variant/10 flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-on-primary-fixed font-black text-xs">E</span>
              </div>
              <span className="font-headline text-sm tracking-tight text-on-surface">Echo Studio</span>
            </div>
            <div className="h-4 w-px bg-outline-variant/20 mx-2" />
            <nav className="flex items-center gap-1">
              {[
                { id: 'construct', label: 'Construct', icon: Book, action: () => setShowConstruct(!showConstruct), active: showConstruct },
                { id: 'axioms', label: 'Axioms', icon: Database, action: () => setActiveHUD(activeHUD === 'lore' ? null : 'lore'), active: activeHUD === 'lore' },
                { id: 'voices', label: 'Voice DNA', icon: Mic2, action: () => setActiveHUD(activeHUD === 'voices' ? null : 'voices'), active: activeHUD === 'voices' },
                { id: 'audit', label: 'Audit', icon: Sparkles, action: () => setActiveTab('refine'), active: activeTab === 'refine' },
                { id: 'ledger', label: 'The Ledger', icon: FileText, action: () => setActiveTab('archive'), active: activeTab === 'archive' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${item.active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }))}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'welcome' }))}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Task 1: Project Strip */}
      {!isZenMode && (
        <div className="h-8 flex-shrink-0 bg-surface-container-low border-b border-outline-variant/5 flex items-center px-4 gap-6 overflow-x-auto no-scrollbar z-40">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Project:</span>
            <span className="text-[10px] font-bold text-on-surface">{project.name}</span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Scene:</span>
            <span className="text-[10px] font-bold text-on-surface">{currentScene?.title || 'Untitled'}</span>
          </div>
          {currentScene?.storyDay && (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Day:</span>
              <span className="text-[10px] font-bold text-on-surface">{currentScene.storyDay}</span>
            </div>
          )}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Words:</span>
            <span className="text-[10px] font-bold text-on-surface">{wordCount.toLocaleString()}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-primary" />
              <div className="w-24 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-accent-emerald" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-accent-emerald">Mirror: Online</span>
            </div>
          </div>
        </div>
      )}

      {/* Task 3: Triple-Column Workspace */}
      <div className="flex-1 flex flex-row min-h-0 relative">
        {/* HUD Overlays */}
        <AnimatePresence>
          {activeHUD === 'lore' && (
            <LoreView onClose={() => setActiveHUD(null)} />
          )}
          {activeHUD === 'voices' && (
            <VoicesView onClose={() => setActiveHUD(null)} />
          )}
        </AnimatePresence>

        {/* Left Wing (Construct) */}
        {!isZenMode && showConstruct && (
          <aside className="w-72 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-outline-variant/10 bg-surface-container-low/50 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Construct</h3>
              <button onClick={() => setShowConstruct(false)} className="p-1 hover:bg-surface-container-highest rounded">
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <SceneManager 
                scenes={scenes}
                chapters={chapters}
                currentSceneId={currentSceneId}
                setCurrentSceneId={setCurrentSceneId}
                setScenes={setScenes}
                setChapters={setChapters}
                setDraft={setDraft}
                showToast={showToast}
                versionHistory={versionHistory}
              />
            </div>
          </aside>
        )}

        {!isZenMode && !showConstruct && (
          <button 
            onClick={() => setShowConstruct(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-surface-container-highest border border-l-0 border-outline-variant/20 rounded-r-lg text-on-surface-variant hover:text-primary transition-all"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Center Sanctuary */}
        <main className={`flex-1 flex flex-col min-h-0 overflow-hidden relative ${isZenMode ? 'p-0' : 'bg-surface'}`}>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {renderTabContent()}
          </div>
        </main>

        {/* Right Wing (Local Audit Suite) */}
        {!isZenMode && showAudit && (
          <div className="flex flex-row h-full">
            <LocalAuditSuite 
              continuityIssues={continuityIssues}
              onIssueClick={(issue) => {
                setActiveTab('draft');
                // Logic to scroll to issue could go here
                showToast(`Focusing on: ${issue.message}`);
              }}
              onRevisionClick={(snippet) => {
                setActiveTab('archive');
                showToast('Viewing revision snippet');
              }}
              revisionSnippets={versionHistory}
            />
            <div className="w-12 flex-shrink-0 bg-surface-container-low border-l border-outline-variant/10 flex flex-col items-center py-4 gap-4">
              <button 
                onClick={() => setShowAudit(false)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
              <div className="w-px h-full bg-outline-variant/10" />
              {[
                { id: 'draft', icon: FileText },
                { id: 'refine', icon: Sparkles },
                { id: 'archive', icon: Database },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as WorkspaceTab)}
                  className={`p-2 rounded-lg transition-all ${activeTab === item.id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                  <item.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        )}

        {!isZenMode && !showAudit && (
          <button 
            onClick={() => setShowAudit(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-surface-container-highest border border-r-0 border-outline-variant/20 rounded-l-lg text-on-surface-variant hover:text-primary transition-all"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Task 4: Flow Rail */}
      {!isZenMode && (
        <footer className="h-10 flex-shrink-0 bg-surface-container-lowest border-t border-outline-variant/10 flex items-center px-4 gap-4 z-40">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${saveStatus === 'saved' ? 'bg-accent-emerald' : 'bg-accent-amber animate-pulse'}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
              {saveStatus === 'saving' ? 'Syncing...' : 'Local Mirror Active'}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-8">
            {[
              { id: 'draft', label: 'Drafting', active: activeTab === 'draft' },
              { id: 'refine', label: 'Audit', active: activeTab === 'refine' },
              { id: 'archive', label: 'The Ledger', active: activeTab === 'archive' },
              { id: 'report', label: 'Reporting', active: activeTab === 'report' },
            ].map((stage, idx) => (
              <div key={stage.id} className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab(stage.id as WorkspaceTab)}
                  className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${stage.active ? 'text-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant'}`}
                >
                  {stage.label}
                </button>
                {idx < 3 && <div className="w-8 h-px bg-outline-variant/20" />}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsZenMode(!isZenMode)}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="text-[9px] font-bold uppercase tracking-widest">Zen Mode</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Editor;
