import React, { useState, useMemo } from 'react';
import { Scene, RefinedVersion, WritingGoal, Chapter } from '../types';
import { SceneManager } from './editor/SceneManager';
import { Book, Download, Upload, Target, CheckCircle2, Trash2 } from 'lucide-react';
import * as db from '../services/dbService';

interface ManuscriptPanelProps {
  scenes: Scene[];
  chapters: Chapter[];
  currentSceneId: string | null;
  setCurrentSceneId: (id: string) => void;
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setDraft: (draft: string) => void;
  showToast: (message: string) => void;
  versionHistory: RefinedVersion[];
  onDeleteVersion: (id: string) => void;
  onClearAcceptedVersions: () => void;
  goal: WritingGoal;
  setGoal: React.Dispatch<React.SetStateAction<WritingGoal>>;
  onViewReport: (version: RefinedVersion) => void;
}

export const ManuscriptPanel: React.FC<ManuscriptPanelProps> = ({
  scenes,
  chapters,
  currentSceneId,
  setCurrentSceneId,
  setScenes,
  setChapters,
  setDraft,
  showToast,
  versionHistory,
  onDeleteVersion,
  onClearAcceptedVersions,
  goal,
  setGoal,
  onViewReport
}) => {
  const [activeTab, setActiveTab] = useState<'scenes' | 'accepted' | 'goals'>('scenes');
  const [showGoalModal, setShowGoalModal] = useState(false);

  const totalWordCount = useMemo(() => {
    return scenes.reduce((acc, scene) => {
      const words = scene.content.trim().split(/\s+/).filter(w => w.length > 0).length;
      return acc + words;
    }, 0);
  }, [scenes]);

  const progress = Math.min(100, Math.round((totalWordCount / goal.targetWords) * 100));

  const handleExport = () => {
    const fullConstruct = scenes
      .sort((a, b) => a.order - b.order)
      .map(s => `# ${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n');
    
    const blob = new Blob([fullConstruct], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `construct-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Construct exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      // Simple import: split by --- and try to find titles
      const parts = content.split('\n\n---\n\n');
      const newScenes: Scene[] = parts.map((part, index) => {
        const lines = part.split('\n');
        let title = `Imported Scene ${index + 1}`;
        let sceneContent = part;

        if (lines[0].startsWith('# ')) {
          title = lines[0].replace('# ', '').trim();
          sceneContent = lines.slice(1).join('\n').trim();
        }

        return {
          id: `${Date.now()}-${index}`,
          title,
          content: sceneContent,
          order: scenes.length + index,
          lastModified: new Date().toISOString()
        };
      });

      const updatedScenes = [...scenes, ...newScenes];
      setScenes(updatedScenes);
      for (const scene of newScenes) {
        await db.putScene(scene);
      }
      showToast(`${newScenes.length} scenes imported`);
    };
    reader.readAsText(file);
  };

  const handleSaveGoal = (newGoal: WritingGoal) => {
    setGoal(newGoal);
    localStorage.setItem('echo-writing-goal', JSON.stringify(newGoal));
    showToast('Writing goals updated');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface overflow-hidden p-4 md:p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="border-b border-outline-variant/10 pb-4 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Book className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-headline text-xl md:text-2xl text-on-surface">Construct</h1>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black mt-1">Architectural mapping and narrative assembly.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 md:px-4 md:py-2 rounded-full bg-surface-container-highest border border-outline-variant/20 hover:bg-surface-container-high transition-colors cursor-pointer min-h-[44px]">
              <Upload className="w-4 h-4" />
              <span className="font-label text-xs uppercase tracking-widest">Import</span>
              <input type="file" accept=".md,.txt" onChange={handleImport} className="hidden" />
            </label>
            <button 
              onClick={handleExport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 md:px-4 md:py-2 rounded-full bg-primary text-on-primary-fixed hover:bg-primary/90 transition-colors shadow-sm min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span className="font-label text-xs uppercase tracking-widest">Export</span>
            </button>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-surface-container-lowest rounded-xl border border-outline-variant/10 w-full sm:w-fit overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('scenes')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-label text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'scenes' ? 'bg-primary text-on-primary-fixed shadow-md' : 'hover:bg-surface-container-highest text-on-surface-variant'}`}
          >
            Scenes
          </button>
          <button 
            onClick={() => setActiveTab('accepted')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-label text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'accepted' ? 'bg-primary text-on-primary-fixed shadow-md' : 'hover:bg-surface-container-highest text-on-surface-variant'}`}
          >
            Accepted Versions
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-label text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'goals' ? 'bg-primary text-on-primary-fixed shadow-md' : 'hover:bg-surface-container-highest text-on-surface-variant'}`}
          >
            Goals
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'scenes' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-6">
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
          </div>
        )}

        {activeTab === 'accepted' && (
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {versionHistory.length > 0 && (
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => {
                    onClearAcceptedVersions();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-all font-label text-[10px] uppercase tracking-widest"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Accepted
                </button>
              </div>
            )}
            {versionHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant/40">
                <CheckCircle2 className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-label text-sm uppercase tracking-widest">No accepted versions yet</p>
              </div>
            ) : (
              versionHistory.map((version) => (
                <div key={version.id} className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 hover:border-primary/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-headline text-lg text-on-surface mb-1">{version.title || 'Untitled Version'}</h3>
                      <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">
                        {new Date(version.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        onDeleteVersion(version.id);
                      }}
                      className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-on-surface-variant line-clamp-3 mb-4 italic">
                    {version.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => {
                        setDraft(version.text);
                        showToast('Version restored to editor');
                      }}
                      className="flex-1 min-w-[120px] px-4 py-2 rounded-xl bg-primary text-on-primary-fixed hover:bg-primary/90 transition-all font-label text-[10px] uppercase tracking-widest shadow-sm"
                    >
                      Restore to Editor
                    </button>
                    {version.justification && (
                      <button 
                        onClick={() => {
                          onViewReport(version);
                        }}
                        className="flex-1 min-w-[120px] px-4 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/10 hover:bg-surface-container-high transition-all font-label text-[10px] uppercase tracking-widest"
                      >
                        View Full Report
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-headline text-2xl text-on-surface">Construct Progress</h2>
                      <p className="text-sm text-on-surface-variant">Track your journey to completion</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-headline text-4xl text-primary">{progress}%</span>
                    <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Complete</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="h-4 bg-surface-container-highest rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-container-high/50 rounded-2xl border border-outline-variant/5">
                      <span className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">Current Count</span>
                      <span className="text-2xl font-headline text-on-surface">{totalWordCount.toLocaleString()}</span>
                      <span className="text-xs text-on-surface-variant ml-1">words</span>
                    </div>
                    <div className="p-4 bg-surface-container-high/50 rounded-2xl border border-outline-variant/5">
                      <span className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">Target Goal</span>
                      <span className="text-2xl font-headline text-on-surface">{goal.targetWords.toLocaleString()}</span>
                      <span className="text-xs text-on-surface-variant ml-1">words</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8">
                <h3 className="font-headline text-xl text-on-surface mb-6">Update Goals</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Construct Target (Words)</label>
                    <input 
                      type="text" 
                      value={goal.targetWords === 0 ? '' : goal.targetWords}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setGoal(prev => ({ ...prev, targetWords: val === '' ? 0 : parseInt(val, 10) }));
                        }
                      }}
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Daily Target (Words)</label>
                    <input 
                      type="text" 
                      value={goal.dailyTarget || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setGoal(prev => ({ ...prev, dailyTarget: val === '' ? undefined : parseInt(val, 10) }));
                        }
                      }}
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Deadline</label>
                    <input 
                      type="date" 
                      value={goal.deadline || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGoal(prev => ({ ...prev, deadline: val || undefined }));
                      }}
                      className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => handleSaveGoal(goal)}
                    className="w-full py-3 rounded-xl bg-primary text-on-primary-fixed font-label text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Save Goals
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManuscriptPanel;

