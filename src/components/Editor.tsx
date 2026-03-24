import React, { useState, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Wand2, ChevronDown, Maximize2, Minimize2, ShieldCheck, FileText, BookOpen, History, BarChart3, Sparkles, GitCompare, PenTool } from 'lucide-react';
import { RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice, Scene, WorkspaceTab } from '../types';
import { scanForContext } from '../utils/contextScanner';
import { draftReducer, initialDraftState } from './editor/draftReducer';
import { FormattingToolbar, FormatType } from './editor/FormattingToolbar';
import { RichTextEditor } from './editor/RichTextEditor';
import { EditorFooter } from './editor/EditorFooter';
import { EditorModals } from './editor/EditorModals';
import { RefinementPresets } from './editor/RefinementPresets';
import { ContinuityGuard } from './editor/ContinuityGuard';
import { SideBySideDiff } from './editor/SideBySideDiff';
import { ContextPanel } from './editor/ContextPanel';
import { RefinePanel } from './editor/RefinePanel';
import { ArchivePanel } from './editor/ArchivePanel';
import { ReportPanel } from './editor/ReportPanel';

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
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    authorVoices: AuthorVoice[];
    versionHistory: RefinedVersion[];
    onAddLoreEntry: (entry: LoreEntry) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    onDeleteLoreEntry: (id: string) => void;
    onDeleteVoiceProfile: (id: string) => void;
    onDeleteAuthorVoice: (id: string) => void;
    onAddVersion: (version: RefinedVersion) => void;
    onClearVersionHistory: () => void;
    onDeleteVersion: (id: string) => void;
    onAcceptVersion: (version: RefinedVersion) => void;
    isFocusMode: boolean;
    setIsFocusMode: (isFocusMode: boolean) => void;
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
    loreEntries, 
    voiceProfiles,
    authorVoices,
    versionHistory,
    onAddLoreEntry,
    onAddVoiceProfile,
    onAddAuthorVoice,
    onDeleteLoreEntry,
    onDeleteVoiceProfile,
    onDeleteAuthorVoice,
    onAddVersion,
    onClearVersionHistory,
    onDeleteVersion,
    onAcceptVersion,
    isFocusMode,
    setIsFocusMode
}) => {
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
  
  const editorRef = useRef<any>(null);

  // Smart Context Detection
  useEffect(() => {
    const timer = setTimeout(() => {
        const text = draftState.present;
        if (!text.trim()) {
            setSuggestions([]);
            return;
        }

        const foundLoreIds = scanForContext(text, loreEntries);
        const foundVoiceIds = scanForContext(text, voiceProfiles);

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
    }, 100);

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
    const savedDraft = localStorage.getItem('echo-draft');
    if (savedDraft) {
        dispatchDraft({ type: 'EXTERNAL_UPDATE', payload: savedDraft });
    }
  }, []);

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
            localStorage.setItem('echo-draft', draftState.present);
        }
        setSaveStatus('saved');
    }, 1000);
    return () => clearTimeout(handler);
  }, [draftState.present, setDraft]);

  useEffect(() => {
    if (saveStatus === 'saved') {
        const timer = setTimeout(() => setSaveStatus('idle'), 2000);
        return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleFormat = useCallback(async (format: FormatType) => {
      if (!selection || !selection.text.trim()) {
          showToast(`Please select text to ${format.replace('extract-', '')}.`);
          return;
      }
      const selectedText = selection.text;
      
      if (format === 'extract-lore') {
          showToast("Extracting lore...");
          try {
              const { extractLoreFromText } = await import('../services/geminiService');
              const partialLore = await extractLoreFromText(selectedText);
              
              const newLore: LoreEntry = {
                  id: Date.now().toString(),
                  title: partialLore.title || 'New Lore Entry',
                  category: (partialLore.category as any) || 'World Mechanics',
                  content: partialLore.content || selectedText,
                  aliases: partialLore.aliases || [],
                  lastModified: new Date().toISOString(),
                  isActive: true
              };
              onAddLoreEntry(newLore);
              showToast(`Extracted lore: ${newLore.title}`);
          } catch (error) {
              showToast("Failed to extract lore.");
          }
          return;
      }

      if (format === 'extract-voice') {
          showToast("Extracting voice profile...");
          try {
              const { extractVoiceFromText } = await import('../services/geminiService');
              const partialVoice = await extractVoiceFromText(selectedText);
              
              const newVoice: VoiceProfile = {
                  id: Date.now().toString(),
                  name: partialVoice.name || 'New Character',
                  gender: 'unspecified',
                  archetype: partialVoice.archetype || 'Unknown',
                  soulPattern: partialVoice.soulPattern || '',
                  cognitivePatterns: '',
                  speechPatterns: partialVoice.speechPatterns || '',
                  emotionalExpression: '',
                  behavioralAnchors: '',
                  conversationalRole: '',
                  signatureTraits: [],
                  idioms: [],
                  exampleLines: [selectedText.substring(0, 100) + '...'],
                  aliases: partialVoice.aliases || [],
                  lastModified: new Date().toISOString(),
                  isActive: true
              };
              onAddVoiceProfile(newVoice);
              showToast(`Extracted voice: ${newVoice.name}`);
          } catch (error) {
              showToast("Failed to extract voice profile.");
          }
          return;
      }
  }, [selection, onAddLoreEntry, onAddVoiceProfile, showToast]);

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
      setActiveTab('archive');
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

  const handleSelectArchiveVersion = useCallback((index: number) => {
      setCurrentVersionIndex(index);
      setActiveTab('report');
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
      switch (activeTab) {
          case 'context':
              return (
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
              );
          case 'refine':
              return (
                  <RefinePanel 
                    draft={draftState.present}
                    isRefining={isRefining}
                    setIsRefining={setIsRefining}
                    showToast={showToast}
                    onNewVersion={handleNewVersion}
                    versionHistory={versionHistory}
                    currentVersionIndex={currentVersionIndex}
                    currentVersion={currentVersion}
                    setCurrentVersionIndex={setCurrentVersionIndex}
                    onShowComparison={handleShowComparison}
                    onAcceptVersion={handleAcceptVersion}
                    onUpdateVersion={handleUpdateVersion}
                    loreEntries={loreEntries}
                    voiceProfiles={voiceProfiles}
                    authorVoices={authorVoices}
                    onAddLoreEntry={onAddLoreEntry}
                    onAddVoiceProfile={onAddVoiceProfile}
                    onAddAuthorVoice={onAddAuthorVoice}
                    onClearVersionHistory={onClearVersionHistory}
                    onDeleteVersion={onDeleteVersion}
                    setShowConflicts={setShowConflicts}
                    currentSceneId={currentSceneId}
                  />
              );
          case 'archive':
              return (
                  <ArchivePanel 
                    versionHistory={versionHistory}
                    currentVersionIndex={currentVersionIndex}
                    originalDraft={draftState.present}
                    onSelectVersion={handleSelectArchiveVersion}
                    onDeleteVersion={onDeleteVersion}
                    onClearHistory={onClearVersionHistory}
                  />
              );
          case 'report':
              return (
                  <ReportPanel 
                    version={currentVersion}
                    original={draftState.present}
                    onAccept={handleAcceptVersion}
                    onRevertLore={handleRevertLore}
                  />
              );
          case 'draft':
          default:
              return (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    <div className="flex-1 min-h-0 flex flex-col mt-2 overflow-hidden">
                        <RichTextEditor
                            editorRef={editorRef}
                            content={draftState.present}
                            onChange={(markdown) => dispatchDraft({ type: 'SET', payload: markdown })}
                            onSelectionChange={setSelection}
                            className="font-headline text-xl tracking-tight leading-relaxed text-on-surface/90"
                        />
                        {editorMode === 'polishing' && showDiff && (
                            <div className="mt-4 border-t border-outline-variant/20 pt-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                                <SideBySideDiff original={draftState.original} polished={draftState.present} />
                            </div>
                        )}
                        {editorMode === 'drafting' && showRecentChanges && (
                            <div className="mt-4 border-t border-outline-variant/20 pt-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                                <h4 className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-2 sticky top-0 bg-surface-container-low pb-2 z-10">Recent Changes</h4>
                                <div className="text-xs text-on-surface-variant/70">
                                    <SideBySideDiff original={draftState.previous || ''} polished={draftState.present} />
                                </div>
                            </div>
                        )}
                    </div>

                    <EditorFooter 
                        saveStatus={saveStatus}
                        wordCount={wordCount}
                    />
                    <div className={showContinuityGuard ? 'block' : 'hidden'}>
                        <ContinuityGuard 
                            draft={draftState.present}
                            loreEntries={loreEntries}
                            voiceProfiles={voiceProfiles}
                            onActivateLore={handleActivateLore}
                            onActivateVoice={handleActivateVoice}
                            onFix={handleContinuityFix}
                            showToast={showToast}
                            onIssuesUpdate={setContinuityIssues}
                        />
                    </div>
                </div>
              );
      }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-4 lg:gap-8 flex-1 min-h-0 animate-in fade-in duration-700 ${isFocusMode ? 'focus-mode' : ''}`}>
      <EditorModals 
        showComparison={showComparison}
        showConflicts={showConflicts}
        showLoreRevert={showLoreRevert}
        currentVersionText={currentVersion.text}
        originalDraft={draftState.present}
        conflicts={currentVersion.conflicts || []}
        loreCorrections={currentVersion.loreCorrections || []}
        setShowComparison={setShowComparison}
        setShowConflicts={setShowConflicts}
        setShowLoreRevert={setShowLoreRevert}
        onRevertLore={handleRevertLore}
        onRevertSpecificLore={handleRevertSpecificLore}
      />
      
      <section className={`flex-1 flex flex-col min-h-0 transition-all duration-500 ${isFocusMode ? 'max-w-4xl mx-auto w-full' : ''}`}>
        <div className={`bg-surface-container-low/50 backdrop-blur-sm rounded-[0.75rem] shadow-2xl ghost-border flex flex-col flex-1 relative min-h-0 overflow-hidden transition-all duration-500 p-4 lg:p-6 ${isFocusMode ? 'ghost-border-accent' : ''}`}>
          
          {/* Workspace Tab Bar */}
          {!isFocusMode && (
              <div className="bg-surface-container-low/90 backdrop-blur-md py-2 -mx-4 px-4 lg:-mx-6 lg:px-6 mb-2 border-b border-outline-variant/10 overflow-x-auto hide-scrollbar">
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-surface-container-highest/50 p-1 rounded-full w-max mx-auto border border-outline-variant/10 shadow-sm">
                      {[
                          { id: 'draft', label: 'Draft', icon: FileText },
                          { id: 'context', label: 'Context', icon: BookOpen },
                          { id: 'refine', label: 'Refine', icon: Sparkles },
                          { id: 'archive', label: 'Archive', icon: History },
                          { id: 'report', label: 'Report', icon: BarChart3 }
                      ].map(tab => (
                          <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}
                          >
                              <tab.icon className="w-3.5 h-3.5" />
                              {tab.label}
                          </button>
                      ))}
                  </div>
              </div>
          )}

          {/* Main Editor Top Bar (Only for Draft Tab) */}
          {activeTab === 'draft' && (
              <div className="bg-surface-container-low/95 backdrop-blur-sm pb-2 border-b border-outline-variant/20 mb-2 sm:mb-3 -mx-4 px-4 lg:-mx-6 lg:px-6 flex items-center justify-between gap-4">
                  {/* Left: Formatting Toolbar */}
                  <div className="flex-none">
                      <FormattingToolbar 
                          editor={editorRef.current}
                          onFormat={handleFormat} 
                          hasSelection={!!selection && selection.text.trim().length > 0} 
                          isFocusMode={isFocusMode}
                          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                      />
                  </div>
                  
                  {/* Center: Continuity Guard */}
                  <div className="flex-1 flex justify-center">
                      <button 
                          onClick={() => setShowContinuityGuard(!showContinuityGuard)}
                          className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                              showContinuityGuard 
                                ? 'bg-primary text-on-primary' 
                                : continuityIssues > 0 
                                    ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 ring-1 ring-amber-500/50' 
                                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'
                          }`}
                          title="Continuity Guard"
                      >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {continuityIssues > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-on-amber text-[8px] font-black">
                                  {continuityIssues}
                              </span>
                          )}
                      </button>
                  </div>

                  {/* Right: Mode/View Buttons */}
                  <div className="flex-none flex justify-end gap-2">
                      <button 
                          onClick={() => {
                              setEditorMode('drafting');
                              setShowDiff(false);
                          }}
                          className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${editorMode === 'drafting' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
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
                          className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${editorMode === 'polishing' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
                          title="Polishing Mode"
                      >
                          <Sparkles className="w-4 h-4" />
                      </button>
                      
                      {editorMode === 'polishing' && (
                          <button 
                              onClick={() => setShowDiff(!showDiff)}
                              className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${showDiff ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
                              title="Toggle Diff Viewer"
                          >
                              <GitCompare className="w-4 h-4" />
                          </button>
                      )}
                      
                      {editorMode === 'drafting' && (
                          <button 
                              onClick={() => setShowRecentChanges(!showRecentChanges)}
                              className={`p-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${showRecentChanges ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
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
