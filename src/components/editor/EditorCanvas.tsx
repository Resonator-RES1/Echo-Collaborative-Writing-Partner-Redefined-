import React from 'react';
import { Sun, History, GitCompare, PenTool, Scissors, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { FormattingToolbar } from './FormattingToolbar';
import { RichTextEditor } from './RichTextEditor';
import { EditorFooter } from './EditorFooter';
import { SideBySideDiff } from './SideBySideDiff';
import { RecentChangesList } from './RecentChangesList';
import { WorkspaceTab } from '../../types';

interface EditorCanvasProps {
  activeTab: WorkspaceTab;
  isZenMode: boolean;
  isUIVisible: boolean;
  setIsZenMode: (isZenMode: boolean) => void;
  editorRef: any;
  editorMode: 'polishing' | 'drafting';
  setEditorMode: (mode: 'polishing' | 'drafting') => void;
  showRecentChanges: boolean;
  setShowRecentChanges: (show: boolean) => void;
  showDiff: boolean;
  setShowDiff: (show: boolean) => void;
  showConstruct: boolean;
  setShowConstruct: (show: boolean) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  dispatchDraft: any;
  draftState: any;
  selection: { text: string; start: number; end: number } | null;
  surgicalSelection: { text: string; start: number; end: number } | null;
  setSurgicalSelection: (sel: { text: string; start: number; end: number } | null) => void;
  setSelection: any;
  handleAcceptChanges: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  wordCount: number;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  activeTab,
  isZenMode,
  isUIVisible,
  setIsZenMode,
  editorRef,
  editorMode,
  setEditorMode,
  showRecentChanges,
  setShowRecentChanges,
  showDiff,
  setShowDiff,
  showConstruct,
  setShowConstruct,
  setActiveTab,
  dispatchDraft,
  draftState,
  selection,
  surgicalSelection,
  setSurgicalSelection,
  setSelection,
  handleAcceptChanges,
  saveStatus,
  wordCount
}) => {
  return (
    <div className={`flex-1 flex flex-col min-h-0 overflow-hidden relative ${activeTab === 'draft' ? 'flex' : 'hidden'}`}>
      <div className={`flex justify-center py-6 border-b border-outline-variant/5 transition-all duration-500 ${isZenMode && !isUIVisible ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="w-full px-8 lg:px-16 relative flex items-center justify-center">
          
          {/* LEFT: Exit Zen Mode & Construct Toggle */}
          <div className="absolute left-4 flex items-center gap-2">
            {!isZenMode && (
              <button 
                onClick={() => setShowConstruct(!showConstruct)}
                className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant flex items-center gap-2 transition-colors"
                title={showConstruct ? "Hide Construct" : "Show Construct"}
              >
                {showConstruct ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
              </button>
            )}
            {isZenMode && (
              <button 
                onClick={() => setIsZenMode(false)}
                className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant flex items-center gap-2 transition-colors"
                title="Exit Zen Mode"
              >
                <Sun className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* CENTER: Formatting Toolbar */}
          <FormattingToolbar editor={editorRef.current} />

          {/* RIGHT: Subtools & Zen Mode Toggles */}
          <div className="absolute right-4 flex items-center gap-2">
            
            {/* Contextual Subtools */}
            {editorMode === 'drafting' && (
               <button
                  onClick={() => setShowRecentChanges(!showRecentChanges)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                     showRecentChanges 
                       ? 'bg-primary/10 text-primary border-primary/20 shadow-inner' 
                       : 'bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:bg-surface-container-highest'
                  }`}
               >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline-block">Recent</span>
               </button>
            )}

            {editorMode === 'polishing' && (
               <button
                  onClick={() => setShowDiff(!showDiff)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                     showDiff 
                       ? 'bg-primary/10 text-primary border-primary/20 shadow-inner' 
                       : 'bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:bg-surface-container-highest'
                  }`}
               >
                  <GitCompare className="w-4 h-4" />
                  <span className="hidden sm:inline-block">Local Diff</span>
               </button>
            )}

            {/* Mode Toggles (ONLY visible in Zen Mode) */}
            {isZenMode && (
              <>
                <div className="w-px h-6 bg-outline-variant/20 mx-1"></div>
                <button 
                  onClick={() => {
                    setActiveTab('draft');
                    setEditorMode('drafting');
                    setShowDiff(false);
                  }}
                  className={`p-2 rounded-lg transition-all ${editorMode === 'drafting' ? 'bg-primary text-on-primary-fixed shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                  title="Drafting Mode"
                >
                  <PenTool className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    dispatchDraft({ type: 'SET_ORIGINAL', payload: draftState.present });
                    setEditorMode('polishing');
                    setShowRecentChanges(false);
                    setSurgicalSelection(selection);
                    if (selection) {
                      setShowDiff(true);
                    }
                  }}
                  className={`p-2 rounded-lg transition-all ${editorMode === 'polishing' ? 'bg-primary text-on-primary-fixed shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                  title="Manual Revision"
                >
                  <Scissors className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`flex-1 min-h-0 flex flex-col overflow-hidden w-full px-8 lg:px-16`}>
          <RichTextEditor
              editorRef={editorRef}
              content={draftState.present}
              onChange={(markdown) => dispatchDraft({ type: 'SET', payload: markdown })}
              onSelectionChange={setSelection}
              className="text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose text-on-surface"
          />
          {editorMode === 'polishing' && showDiff && (
              <div className="mt-4 border-t border-outline-variant/20 pt-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <SideBySideDiff 
                      original={surgicalSelection ? surgicalSelection.text : draftState.original} 
                      polished={
                        surgicalSelection 
                          ? (() => {
                              const prefix = draftState.original.substring(0, surgicalSelection.start);
                              const suffix = draftState.original.substring(surgicalSelection.end);
                              let start = 0;
                              let end = draftState.present.length;
                              if (draftState.present.startsWith(prefix)) start = prefix.length;
                              if (draftState.present.endsWith(suffix)) end = draftState.present.length - suffix.length;
                              return draftState.present.substring(start, end);
                            })()
                          : draftState.present
                      } 
                      onAcceptChanges={() => {
                        setSurgicalSelection(null);
                        handleAcceptChanges();
                      }}
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

      <div className={`absolute bottom-4 right-8 z-20 transition-all duration-500 ${isZenMode ? 'zen-ui-element' : ''} ${isZenMode && !isUIVisible ? 'zen-ui-hidden' : 'zen-ui-visible'}`}>
        <EditorFooter 
            saveStatus={saveStatus}
            wordCount={wordCount}
        />
      </div>
    </div>
  );
};
