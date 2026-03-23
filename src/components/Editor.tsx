import React, { useState, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Wand2, ChevronDown, Maximize2, Minimize2, ShieldCheck } from 'lucide-react';
import { RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice, Scene } from '../types';
import { draftReducer, initialDraftState } from './editor/draftReducer';
import { FormattingToolbar, FormatType } from './editor/FormattingToolbar';
import { EditorHeader } from './editor/EditorHeader';
import { EditorFooter } from './editor/EditorFooter';
import { EditorModals } from './editor/EditorModals';
import { RefinementPresets } from './editor/RefinementPresets';
import { ContinuityGuard } from './editor/ContinuityGuard';

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
    onAddVersion: (version: RefinedVersion) => void;
    onClearVersionHistory: () => void;
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
    loreEntries, 
    voiceProfiles,
    authorVoices,
    versionHistory,
    onAddLoreEntry,
    onAddVoiceProfile,
    onAddAuthorVoice,
    onAddVersion,
    onClearVersionHistory,
    onAcceptVersion
}) => {
  const [draftState, dispatchDraft] = useReducer(draftReducer, { ...initialDraftState, present: draft });
  const draftRef = useRef(draftState.present);
  
  useEffect(() => {
    draftRef.current = draftState.present;
  }, [draftState.present]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    onVersionCountChange?.(versionHistory.length);
  }, [versionHistory.length, onVersionCountChange]);

  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(0);
  
  const [showComparison, setShowComparison] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showLoreRevert, setShowLoreRevert] = useState(false);
  const [showContinuityGuard, setShowContinuityGuard] = useState(false);

  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

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
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { selectionStart, selectionEnd, value } = textarea;
      const selectedText = value.substring(selectionStart, selectionEnd);
      
      if (format === 'extract-lore') {
          if (!selectedText.trim()) {
              showToast("Please select text to extract lore.");
              return;
          }
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
          if (!selectedText.trim()) {
              showToast("Please select text to extract voice.");
              return;
          }
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

      let newText = '';

      switch (format) {
          case 'bold': newText = `**${selectedText}**`; break;
          case 'italic': newText = `*${selectedText}*`; break;
          case 'strikethrough': newText = `~~${selectedText}~~`; break;
          case 'code': newText = `\`${selectedText}\``; break;
          case 'link': newText = `[${selectedText}](url)`; break;
          case 'image': newText = `![${selectedText}](url)`; break;
          case 'h3': newText = `### ${selectedText}`; break;
          case 'quote': newText = `> ${selectedText}`; break;
          case 'ul': newText = selectedText.split('\n').map(line => `* ${line}`).join('\n'); break;
          case 'ol': newText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n'); break;
      }

      const updatedValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
      dispatchDraft({ type: 'SET', payload: updatedValue });
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionStart + newText.length);
  }, [onAddLoreEntry, onAddVoiceProfile, showToast]);

  const handleSelectionChange = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd, value } = e.currentTarget;
    if (selectionStart !== selectionEnd) {
        const text = value.substring(selectionStart, selectionEnd);
        setSelection(prev => {
            if (prev && prev.start === selectionStart && prev.end === selectionEnd && prev.text === text) return prev;
            return { text, start: selectionStart, end: selectionEnd };
        });
    } else {
        setSelection(prev => {
            if (prev === null) return prev;
            return null;
        });
    }
  }, []);

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
  }, [onAddVersion]);

  const handleShowComparison = useCallback(() => {
    setShowComparison(true);
  }, []);
  const handleAcceptVersion = useCallback((version: RefinedVersion) => {
    onAcceptVersion(version);
    dispatchDraft({ type: 'EXTERNAL_UPDATE', payload: version.text });
  }, [onAcceptVersion]);

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

  return (
    <div className={`flex flex-col lg:flex-row gap-8 min-h-[600px] lg:min-h-[900px] flex-1 animate-in fade-in duration-700`}>
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
      
      <section className={`${isEditorExpanded ? 'fixed inset-4 z-[60]' : 'flex-grow flex flex-col h-full'}`}>
        <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-[0.75rem] shadow-2xl ghost-border flex flex-col flex-grow relative p-6 lg:p-10 min-h-full">
            <EditorHeader 
                isEditorExpanded={isEditorExpanded}
                setIsEditorExpanded={setIsEditorExpanded}
            />
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4 -mx-6 px-6 lg:-mx-10 lg:px-10">
            <div className="flex-1">
              <FormattingToolbar onFormat={handleFormat} hasSelection={!!selection && selection.text.trim().length > 0} />
            </div>
            <div className="flex-1 flex justify-center gap-2">
                <button 
                    onClick={() => setShowContinuityGuard(!showContinuityGuard)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${showContinuityGuard ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
                >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Continuity Guard
                </button>
            </div>
            <div className="flex-1"></div>
          </div>
          <textarea
            ref={textareaRef}
            value={draftState.present}
            onChange={(e) => dispatchDraft({ type: 'SET', payload: e.target.value })}
            onSelect={handleSelectionChange}
            placeholder="The canvas is yours. Begin your narrative..."
            className="w-full h-full flex-grow bg-transparent text-on-surface/90 placeholder-on-surface/20 focus:outline-none resize-none leading-relaxed whitespace-pre-wrap font-headline text-xl tracking-tight mt-6"
            aria-label="Draft editor"
          ></textarea>
          <EditorFooter 
            saveStatus={saveStatus}
            wordCount={wordCount}
          />
          {showContinuityGuard && (
              <ContinuityGuard 
                  draft={draftState.present}
                  loreEntries={loreEntries}
                  voiceProfiles={voiceProfiles}
                  onActivateLore={handleActivateLore}
                  onActivateVoice={handleActivateVoice}
                  onFix={handleContinuityFix}
                  showToast={showToast}
              />
          )}
        </div>
      </section>

      <aside className={`lg:w-96 flex-shrink-0 flex flex-col gap-4 h-full ${isEditorExpanded ? 'hidden' : ''}`}>
        <RefinementPresets
            currentSceneId={currentSceneId}
            getDraft={getDraft}
            selection={selection}
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
            setShowConflicts={setShowConflicts}
        />
      </aside>
    </div>
  );
};

export default Editor;
