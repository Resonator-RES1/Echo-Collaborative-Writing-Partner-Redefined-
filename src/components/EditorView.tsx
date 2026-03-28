import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice, Scene, WorkspaceTab } from '../types';
import { createScanner, ContinuityIssue } from '../utils/contextScanner';
import { EditorModals } from './editor/EditorModals';
import { ContinuityGuard } from './editor/ContinuityGuard';
import { ContextPanel } from './editor/ContextPanel';
import { RefinePanel } from './editor/RefinePanel';
import { ArchivePanel } from './editor/ArchivePanel';
import { ReportPanel } from './editor/ReportPanel';

import { useLore } from '../contexts/LoreContext';
import { useProject } from '../contexts/ProjectContext';
import { useEditorLogic } from '../hooks/useEditorLogic';
import { ProcessRail } from './layout/ProcessRail';
import { EditorCanvas } from './editor/EditorCanvas';

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

// Main Editor View Component
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
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('draft');

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

  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  
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
      const text = draftState.present.trim();
      return text === '' ? 0 : text.split(/\\s+/).length;
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
                  setActiveTab={setActiveTab}
                  dispatchDraft={dispatchDraft}
                  draftState={draftState}
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
      <ProcessRail
        isZenMode={isZenMode}
        setIsZenMode={setIsZenMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showContinuityGuard={showContinuityGuard}
        setShowContinuityGuard={setShowContinuityGuard}
        continuityIssues={continuityIssues}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        setShowDiff={setShowDiff}
        setShowRecentChanges={setShowRecentChanges}
        dispatchDraft={dispatchDraft}
        draftState={draftState}
      />

      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Main Canvas Area */}
        <main className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 ${isZenMode ? 'p-0' : 'p-4 lg:p-8'}`}>
          <div className={`flex-1 flex flex-col min-h-0 relative ${isZenMode ? '' : 'bg-surface-container-low/30 backdrop-blur-sm rounded-[2.5rem] border border-outline-variant/10 shadow-inner overflow-hidden'}`}>
            
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
