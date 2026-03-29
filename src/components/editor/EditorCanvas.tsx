import React, { useState } from 'react';
import { Sun, History, GitCompare, PenTool, Scissors, PanelLeftClose, PanelLeftOpen, Type, Wand2, Maximize2, Minimize2 } from 'lucide-react';
import { FormattingToolbar } from './FormattingToolbar';
import { RichTextEditor } from './RichTextEditor';
import { EditorFooter } from './EditorFooter';
import { SideBySideDiff } from './SideBySideDiff';
import { RecentChangesList } from './RecentChangesList';
import { WorkspaceTab } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

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
  displayPrefs: { fontSize: number; lineHeight: number; maxWidth: string };
  setDisplayPrefs: (prefs: any) => void;
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
  wordCount,
  displayPrefs,
  setDisplayPrefs
}) => {
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);

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
                {isZenMode ? <Sun className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* CENTER: Formatting Toolbar */}
          <FormattingToolbar editor={editorRef.current} />

          {/* RIGHT: Subtools & Zen Mode Toggles */}
          <div className="absolute right-4 flex items-center gap-2">
            
            {/* Display Settings Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowDisplaySettings(!showDisplaySettings)}
                className={`p-2 rounded-lg transition-all ${showDisplaySettings ? 'bg-primary/10 text-primary border-primary/20' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                title="Display Settings"
              >
                <Type className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showDisplaySettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 p-4 bg-surface-container-highest/95 backdrop-blur-xl border border-outline-variant/20 rounded-2xl shadow-2xl z-50"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Font Size</label>
                          <span className="text-[10px] font-mono text-primary">{displayPrefs.fontSize}px</span>
                        </div>
                        <input 
                          type="range" min="12" max="32" step="1"
                          value={displayPrefs.fontSize}
                          onChange={(e) => setDisplayPrefs({ ...displayPrefs, fontSize: parseInt(e.target.value) })}
                          className="w-full accent-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Line Spacing</label>
                          <span className="text-[10px] font-mono text-primary">{displayPrefs.lineHeight}</span>
                        </div>
                        <input 
                          type="range" min="1" max="2.5" step="0.1"
                          value={displayPrefs.lineHeight}
                          onChange={(e) => setDisplayPrefs({ ...displayPrefs, lineHeight: parseFloat(e.target.value) })}
                          className="w-full accent-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Content Width</label>
                        <div className="grid grid-cols-5 gap-1">
                          {['max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-full'].map((w) => (
                            <button
                              key={w}
                              onClick={() => setDisplayPrefs({ ...displayPrefs, maxWidth: w })}
                              className={`h-6 rounded border text-[8px] flex items-center justify-center transition-all ${
                                displayPrefs.maxWidth === w 
                                  ? 'bg-primary border-primary text-on-primary-fixed' 
                                  : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                              }`}
                            >
                              {w.split('-').pop()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-outline-variant/20 mx-1"></div>
            
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

      <div className={`flex-1 min-h-0 flex flex-col overflow-hidden w-full mx-auto ${displayPrefs.maxWidth}`} style={{ fontSize: `${displayPrefs.fontSize}px`, lineHeight: displayPrefs.lineHeight }}>
          <RichTextEditor
              editorRef={editorRef}
              content={draftState.present}
              onChange={(markdown) => dispatchDraft({ type: 'SET', payload: markdown })}
              onSelectionChange={setSelection}
              className="text-on-surface"
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

      {/* Contextual Surgical Mode Button */}
      {selection && selection.text.length > 0 && activeTab === 'draft' && (
        <button 
          onClick={() => setActiveTab('refine')} 
          className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 px-4 py-2 bg-primary text-on-primary-fixed rounded-full shadow-lg font-label text-xs uppercase tracking-widest absolute bottom-24 left-1/2 -translate-x-1/2 z-50 hover:scale-105 transition-transform"
        >
          <Wand2 className="w-4 h-4" /> Audit Selection
        </button>
      )}
    </div>
  );
};
