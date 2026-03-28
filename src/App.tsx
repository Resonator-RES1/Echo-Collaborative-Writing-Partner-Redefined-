/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useMemo, Suspense, lazy } from 'react';
import { 
    FileText, 
    BookOpen, 
    Home,
    Mic2,
    Layout,
    Loader2,
    Settings,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toast } from './components/Toast';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { GoalsModal } from './components/GoalsModal';
import { Screen, RefinedVersion, Scene, Chapter, WritingGoal } from './types';
import * as db from './services/dbService';
import { useLore } from './contexts/LoreContext';
import { useProject } from './contexts/ProjectContext';
import Editor from './components/EditorView';

// Lazy load main screens
const LoreScreen = lazy(() => import('./components/LoreView'));
const VoicesScreen = lazy(() => import('./components/VoicesView'));
const ManuscriptPanel = React.memo(lazy(() => import('./components/ManuscriptView')));

const LoadingState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
      <Loader2 className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">
      Synchronizing Echoes...
    </p>
  </div>
);

const GlobalHeader = ({ isZenMode, currentScreen }: { isZenMode: boolean, currentScreen: Screen }) => (
  <header className={`fixed top-0 left-0 right-0 z-50 flex flex-col items-center py-4 transition-all duration-700 ${isZenMode || currentScreen === 'welcome' ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
    <div className="flex flex-col items-center gap-0.5">
      <h1 className="font-headline text-2xl md:text-3xl font-light tracking-tighter text-on-surface">
        ECHO<span className="text-primary">.</span>
      </h1>
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40">
        Sovereign Sanctuary
      </p>
    </div>
  </header>
);

interface FloatingDockProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  isZenMode: boolean;
  wordCount: number;
  goal: WritingGoal;
  onOpenGoals: () => void;
}

const FloatingDock = ({ currentScreen, setCurrentScreen, isZenMode, wordCount, goal, onOpenGoals }: FloatingDockProps) => {
  const navItems = [
    { id: 'workspace', label: 'Workspace', icon: Layout },
    { id: 'manuscript', label: 'Manuscript', icon: FileText },
    { id: 'lore', label: 'Lore', icon: BookOpen },
    { id: 'voices', label: 'Voices', icon: Mic2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const progress = Math.min(100, Math.round((wordCount / goal.targetWords) * 100));

  return (
    <nav 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-2 rounded-full bg-surface-container-low/80 backdrop-blur-2xl border border-outline-variant/20 shadow-2xl transition-all duration-700 ${isZenMode || currentScreen === 'welcome' ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0'}`}
    >
      {/* Progress Indicator */}
      <button 
        onClick={onOpenGoals}
        className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-highest transition-colors group"
        title={`${wordCount} / ${goal.targetWords} words`}
      >
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-outline-variant/10"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={100.5}
            strokeDashoffset={100.5 * (1 - progress / 100)}
            className="text-primary transition-all duration-500"
          />
        </svg>
        <Target className="w-3.5 h-3.5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
      </button>

      <div className="w-px h-6 bg-outline-variant/20 mx-1" />

      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentScreen(item.id as Screen)}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all group ${
            currentScreen === item.id 
              ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' 
              : 'text-on-surface-variant/60 hover:bg-surface-container-highest hover:text-on-surface'
          }`}
          title={item.label}
        >
          <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
          
          {/* Tooltip-like label on hover */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1 bg-surface-container-highest text-on-surface text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-outline-variant/10">
            {item.label}
          </span>

          {currentScreen === item.id && (
            <motion.div 
              layoutId="dock-indicator"
              className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
            />
          )}
        </button>
      ))}

      <div className="w-px h-6 bg-outline-variant/20 mx-1" />

      <button
        onClick={() => setCurrentScreen('welcome')}
        className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all group ${
          currentScreen === 'welcome' 
            ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' 
            : 'text-on-surface-variant/60 hover:bg-surface-container-highest hover:text-on-surface'
        }`}
        title="Home"
      >
        <Home className={`w-5 h-5 transition-transform group-hover:scale-110`} />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1 bg-surface-container-highest text-on-surface text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-outline-variant/10">
          Home
        </span>
      </button>
    </nav>
  );
};

export default function App() {
  const { isZenMode, setIsZenMode } = useProject();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>('');
  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [versionCount, setVersionCount] = useState<number>(0);
  const [versionHistory, setVersionHistory] = useState<RefinedVersion[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [lastMainScreen, setLastMainScreen] = useState<Screen>('welcome');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (['welcome', 'workspace', 'manuscript'].includes(currentScreen)) {
      setLastMainScreen(currentScreen);
    }
  }, [currentScreen]);
  const [isMobile, setIsMobile] = useState(false);
  const [writingGoal, setWritingGoal] = useState<WritingGoal>(() => {
    const saved = localStorage.getItem('echo-writing-goal');
    return saved ? JSON.parse(saved) : { targetWords: 50000 };
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleToggleSearch = () => {
      setIsSearchOpen(prev => !prev);
    };
    window.addEventListener('toggle-global-search', handleToggleSearch);
    return () => window.removeEventListener('toggle-global-search', handleToggleSearch);
  }, []);

  // Zen Mode Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, setIsZenMode]);

  const BottomNavBar = () => {
    const navItems = [
      { id: 'welcome', label: 'Home', icon: Home },
      { id: 'lore', label: 'Lore', icon: BookOpen },
      { id: 'workspace', label: 'Workspace', icon: Layout },
      { id: 'voices', label: 'Voices', icon: Mic2 },
      { id: 'manuscript', label: 'Manuscript', icon: FileText },
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low/95 backdrop-blur-xl border-t border-outline-variant/10 px-2 py-2 pb-safe flex items-center justify-around shadow-2xl md:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id as Screen)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
              currentScreen === item.id 
                ? 'text-primary' 
                : 'text-on-surface-variant/60 hover:text-on-surface'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentScreen === item.id ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            {currentScreen === item.id && (
              <motion.div 
                layoutId="bottom-nav-indicator"
                className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
              />
            )}
          </button>
        ))}
      </nav>
    );
  };
  
  const { 
    loreEntries, 
    voiceProfiles, 
    authorVoices, 
    isLoaded: isLoreLoaded,
    addLoreEntry,
    deleteLoreEntry,
    addVoiceProfile,
    deleteVoiceProfile,
    addAuthorVoice,
    deleteAuthorVoice,
    importLoreEntries,
    importVoiceProfiles,
    importAuthorVoices
  } = useLore();
  
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [showGoals, setShowGoals] = useState(false);

  // Background pre-fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./components/EditorView');
      import('./components/LoreView');
      import('./components/ManuscriptView');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Load from IndexedDB on mount and on sync completion
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load theme first to prevent flash
        const savedTheme = await db.getSetting('app_theme');
        if (savedTheme === 'parchment') {
          document.documentElement.classList.add('parchment');
        } else {
          document.documentElement.classList.remove('parchment');
        }

        const [loadedEchoes, loadedScenes, loadedChapters] = await Promise.all([
          db.getEchoes(),
          db.getScenes(),
          db.getChapters()
        ]);
        
        let firstSceneId = loadedScenes.length > 0 ? loadedScenes[0].id : null;
        let needsEchoUpdate = false;
        const migratedEchoes = loadedEchoes.map(e => {
            if (!e.sceneId && firstSceneId) {
                needsEchoUpdate = true;
                return { ...e, sceneId: firstSceneId };
            }
            return e;
        });
        
        if (needsEchoUpdate) {
            await db.setAllEchoes(migratedEchoes);
        }
        setVersionHistory(migratedEchoes);
        
        if (loadedChapters.length > 0) {
            setChapters(loadedChapters);
        }

        if (loadedScenes.length > 0) {
            setScenes(loadedScenes);
            setCurrentSceneId(loadedScenes[0].id);
            setDraft(loadedScenes[0].content);
        } else {
            // Create a default scene
            const defaultScene: Scene = {
                id: Date.now().toString(),
                title: 'Chapter 1',
                content: '',
                order: 0,
                lastModified: new Date().toISOString()
            };
            setScenes([defaultScene]);
            setCurrentSceneId(defaultScene.id);
            await db.putScene(defaultScene);
        }
      } catch (e) {
        console.error("Failed to load data from DB", e);
      } finally {
        setIsAppLoaded(true);
      }
    };
    
    loadData();

    const handleSyncComplete = () => {
      loadData();
    };

    window.addEventListener('sync-complete', handleSyncComplete);
    return () => window.removeEventListener('sync-complete', handleSyncComplete);
  }, []);

  const isLoaded = isAppLoaded && isLoreLoaded;


  const showToast = useCallback((message: string) => {
    setToast({ message, id: Date.now() });
  }, []);

  const acceptVersion = useCallback(async (version: RefinedVersion) => {
    setDraft(version.text);
    setVersionHistory(prev => {
      const updated = prev.map(v => v.id === version.id ? { ...v, isAccepted: true } : v);
      db.setAllEchoes(updated);
      return updated;
    });
    
    if (currentSceneId) {
      setScenes(prev => {
        const updated = prev.map(s => s.id === currentSceneId ? { ...s, content: version.text, hasEcho: true, lastModified: new Date().toISOString() } : s);
        const activeScene = updated.find(s => s.id === currentSceneId);
        if (activeScene) {
          db.putScene(activeScene);
        }
        return updated;
      });
    }
    
    showToast("Version accepted and stored in Manuscript.");
  }, [showToast, currentSceneId]);

  const deleteVersion = useCallback(async (id: string) => {
    setVersionHistory(prev => prev.filter(v => v.id !== id));
    await db.deleteEcho(id);
    showToast("Echo removed from history.");
  }, [showToast]);

  const updateVersion = useCallback(async (updatedVersion: RefinedVersion) => {
    setVersionHistory(prev => {
      const updated = prev.map(v => v.id === updatedVersion.id ? updatedVersion : v);
      db.setAllEchoes(updated);
      return updated;
    });
    await db.putEcho(updatedVersion);
  }, []);

  const filteredVersionHistory = useMemo(() => {
      return versionHistory.filter(v => !v.sceneId || v.sceneId === currentSceneId);
  }, [versionHistory, currentSceneId]);

  const handleVersionHistoryChange = useCallback(async (newFilteredHistory: RefinedVersion[]) => {
      setVersionHistory(prev => {
          const otherVersions = prev.filter(v => v.sceneId && v.sceneId !== currentSceneId);
          const merged = [...newFilteredHistory, ...otherVersions];
          db.setAllEchoes(merged);
          return merged;
      });
  }, [currentSceneId]);

  const clearVersionHistory = useCallback(async () => {
    setVersionHistory(prev => {
        const otherVersions = prev.filter(v => v.sceneId && v.sceneId !== currentSceneId);
        db.setAllEchoes(otherVersions);
        return otherVersions;
    });
    showToast("Scene echo archive cleared.");
  }, [currentSceneId, showToast]);

  const clearAcceptedVersions = useCallback(async () => {
    setVersionHistory(prev => {
        const updated = prev.filter(v => !v.isAccepted);
        db.setAllEchoes(updated);
        return updated;
    });
    showToast("Accepted versions history cleared.");
  }, [showToast]);

  const addVersion = useCallback(async (version: RefinedVersion) => {
    let oldestUnacceptedId: string | null = null;
    
    setVersionHistory(prev => {
        const unacceptedForScene = prev.filter(v => !v.isAccepted && v.sceneId === version.sceneId);
        if (unacceptedForScene.length >= 21) {
            // Find the oldest unaccepted version for this scene (at the end of the list since we prepend)
            const oldestUnaccepted = unacceptedForScene[unacceptedForScene.length - 1];
            oldestUnacceptedId = oldestUnaccepted.id;
            return [version, ...prev.filter(v => v.id !== oldestUnaccepted.id)];
        }
        return [version, ...prev];
    });

    if (oldestUnacceptedId) {
        await db.deleteEcho(oldestUnacceptedId).catch(err => console.error("Failed to auto-delete old echo:", err));
    }
    await db.putEcho(version);
  }, []);

  const importVersions = useCallback(async (versions: RefinedVersion[]) => {
    setVersionHistory(versions);
    await db.setAllEchoes(versions);
    showToast(`${versions.length} echoes imported.`);
  }, [showToast]);

  const handleUpdateScene = useCallback(async (scene: Scene) => {
    setScenes(prev => prev.map(s => s.id === scene.id ? scene : s));
    await db.putScene(scene);
  }, []);

  const handleExport = useCallback(() => {
    if (scenes.length === 0) {
      showToast("No scenes to compile.");
      return;
    }

    const sortedScenes = [...scenes].sort((a, b) => a.order - b.order);
    let manuscript = `# Manuscript\n\n`;
    
    sortedScenes.forEach(scene => {
      manuscript += `## ${scene.title}\n\n`;
      manuscript += `${scene.content}\n\n`;
    });

    const blob = new Blob([manuscript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manuscript_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast("Manuscript compiled and downloaded.");
  }, [scenes, showToast]);

  const totalWordCount = useMemo(() => {
    return scenes.reduce((total, scene) => {
      const text = scene.content.trim();
      return total + (text === '' ? 0 : text.split(/\s+/).length);
    }, 0);
  }, [scenes]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-on-surface gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-label text-xs uppercase tracking-widest animate-pulse">Initializing Echo Engine...</p>
      </div>
    );
  }

  const renderScreen = () => {
    const screenToRender = ['lore', 'voices', 'settings'].includes(currentScreen) 
      ? lastMainScreen 
      : currentScreen;

    switch (screenToRender) {
      case 'welcome':
        return (
          <WelcomeScreen 
            onEnterWorkspace={() => setCurrentScreen('workspace')} 
            onViewManuscript={() => setCurrentScreen('manuscript')}
            wordCount={totalWordCount}
            goal={writingGoal}
            scenes={scenes}
            onJumpToScene={(id) => {
              setCurrentSceneId(id);
              setCurrentScreen('workspace');
            }}
          />
        );
      case 'manuscript':
        return (
          <ManuscriptPanel 
            scenes={scenes}
            chapters={chapters}
            currentSceneId={currentSceneId}
            setCurrentSceneId={setCurrentSceneId}
            setScenes={setScenes}
            setChapters={setChapters}
            setDraft={setDraft}
            showToast={showToast}
            versionHistory={versionHistory.filter(v => v.isAccepted)}
            onDeleteVersion={deleteVersion}
            onClearAcceptedVersions={clearAcceptedVersions}
            goal={writingGoal}
            setGoal={setWritingGoal}
            onViewReport={(version) => {
              setCurrentScreen('workspace');
              window.dispatchEvent(new CustomEvent('view-report', { detail: version }));
            }}
          />
        );
      case 'workspace':
      default:
        return (
          <Editor 
              draft={draft}
              setDraft={setDraft}
              scenes={scenes}
              currentSceneId={currentSceneId}
              setCurrentSceneId={setCurrentSceneId}
              setScenes={setScenes}
              isRefining={isRefining}
              setIsRefining={setIsRefining}
              showToast={showToast}
              onVersionCountChange={setVersionCount}
              onVersionHistoryChange={handleVersionHistoryChange}
              versionHistory={filteredVersionHistory}
              onAddVersion={addVersion}
              onClearVersionHistory={clearVersionHistory}
              onDeleteVersion={deleteVersion}
              onUpdateVersion={updateVersion}
              onAcceptVersion={acceptVersion}
          />
        );
    }
  };

  return (
    <div className={`h-[100dvh] bg-surface text-on-surface flex flex-col font-body overflow-hidden ${isZenMode ? 'is-zen' : ''}`}>
      {toast && <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} />}
      
      <GlobalHeader isZenMode={isZenMode} currentScreen={currentScreen} />
      
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        scenes={scenes}
        onUpdateScene={handleUpdateScene}
        showToast={showToast}
      />

      <GoalsModal 
        isOpen={showGoals} 
        onClose={() => setShowGoals(false)} 
        goal={writingGoal} 
        onSave={(newGoal) => {
          setWritingGoal(newGoal);
          localStorage.setItem('echo-writing-goal', JSON.stringify(newGoal));
          showToast('Writing goals updated.');
        }} 
      />
      
      <main className={`flex-1 min-h-0 flex flex-col overflow-hidden relative z-10 ${currentScreen === 'welcome' ? '' : 'pt-16'}`}>
        <Suspense fallback={<LoadingState />}>
          {renderScreen()}
        </Suspense>
      </main>

      <AnimatePresence>
        {currentScreen === 'lore' && (
          <LoreScreen 
            key="lore-drawer"
            onClose={() => setCurrentScreen(lastMainScreen)} 
          />
        )}
        {currentScreen === 'voices' && (
          <VoicesScreen 
            key="voices-drawer"
            onClose={() => setCurrentScreen(lastMainScreen)} 
          />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen 
            key="settings-modal"
            showToast={showToast} 
            onClose={() => setCurrentScreen(lastMainScreen)}
          />
        )}
      </AnimatePresence>

      <FloatingDock 
        currentScreen={currentScreen} 
        setCurrentScreen={setCurrentScreen} 
        isZenMode={isZenMode}
        wordCount={totalWordCount}
        goal={writingGoal}
        onOpenGoals={() => setShowGoals(true)}
      />
    </div>
  );
}
