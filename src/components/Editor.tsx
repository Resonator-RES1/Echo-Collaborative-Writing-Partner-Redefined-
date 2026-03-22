import React, { useState, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Wand2, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { RefinedVersion, LoreEntry, VoiceProfile, AuthorVoice } from '../types';
import { draftReducer, initialDraftState } from './editor/draftReducer';
import { FormattingToolbar, FormatType } from './editor/FormattingToolbar';
import { EditorHeader } from './editor/EditorHeader';
import { EditorFooter } from './editor/EditorFooter';
import { EditorModals } from './editor/EditorModals';
import { RefinementPresets } from './editor/RefinementPresets';

interface EditorProps {
    draft: string;
    setDraft: (draft: string) => void;
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
}

const Editor: React.FC<EditorProps> = ({ 
    draft, 
    setDraft, 
    isRefining, 
    setIsRefining, 
    showToast, 
    onVersionCountChange, 
    onVersionHistoryChange, 
    loreEntries, 
    voiceProfiles,
    authorVoices,
    versionHistory: initialVersionHistory,
    onAddLoreEntry,
    onAddVoiceProfile,
    onAddAuthorVoice,
    onAddVersion,
    onClearVersionHistory
}) => {
  const [draftState, dispatchDraft] = useReducer(draftReducer, { ...initialDraftState, present: draft });
  const draftRef = useRef(draftState.present);
  
  useEffect(() => {
    draftRef.current = draftState.present;
  }, [draftState.present]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const versionHistory = initialVersionHistory;

  useEffect(() => {
    onVersionCountChange?.(versionHistory.length);
  }, [versionHistory.length, onVersionCountChange]);

  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(0);
  
  const [showComparison, setShowComparison] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);

  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

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

  const handleFormat = useCallback((format: FormatType) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { selectionStart, selectionEnd, value } = textarea;
      const selectedText = value.substring(selectionStart, selectionEnd);
      let newText = '';

      switch (format) {
          case 'bold': newText = `**${selectedText}**`; break;
          case 'italic': newText = `*${selectedText}*`; break;
          case 'h3': newText = `### ${selectedText}`; break;
          case 'quote': newText = `> ${selectedText}`; break;
          case 'ul': newText = selectedText.split('\n').map(line => `* ${line}`).join('\n'); break;
          case 'ol': newText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n'); break;
      }

      const updatedValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
      dispatchDraft({ type: 'SET', payload: updatedValue });
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionStart + newText.length);
  }, []);

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
  const handleAcceptVersion = useCallback((version: string) => dispatchDraft({ type: 'EXTERNAL_UPDATE', payload: version }), []);

  return (
    <div className={`flex flex-col lg:flex-row gap-8 min-h-[900px] flex-1 animate-in fade-in duration-700`}>
      <EditorModals 
        showComparison={showComparison}
        showConflicts={showConflicts}
        currentVersionText={currentVersion.text}
        originalDraft={draftState.present}
        conflicts={currentVersion.conflicts || []}
        setShowComparison={setShowComparison}
        setShowConflicts={setShowConflicts}
      />
      
      <section className={`${isEditorExpanded ? 'fixed inset-4 z-[60]' : 'flex-grow flex flex-col h-full'}`}>
        <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-[0.75rem] shadow-2xl ghost-border flex flex-col flex-grow relative p-6 lg:p-10 min-h-full">
            <EditorHeader 
                isEditorExpanded={isEditorExpanded}
                setIsEditorExpanded={setIsEditorExpanded}
            />
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4 -mx-6 px-6 lg:-mx-10 lg:px-10">
            <div className="flex-1">
              <FormattingToolbar onFormat={handleFormat} />
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
        </div>
      </section>

      <aside className={`lg:w-80 flex-shrink-0 flex flex-col gap-4 h-full ${isEditorExpanded ? 'hidden' : ''}`}>
        <RefinementPresets
            getDraft={getDraft}
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
        />
      </aside>
    </div>
  );
};

export default Editor;
