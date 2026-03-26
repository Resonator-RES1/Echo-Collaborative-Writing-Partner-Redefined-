/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useMemo, Suspense, lazy } from 'react';
import { 
    Book, 
    Sparkles, 
    History, 
    FileText, 
    BookOpen, 
    BarChart3, 
    Settings, 
    PenTool, 
    Library,
    Home,
    Mic2,
    Layout,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toast } from './components/Toast';
import { TopAppBar } from './components/TopAppBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Screen, RefinedVersion, Scene, Chapter, WritingGoal } from './types';
import * as db from './services/dbService';
import { useLore } from './contexts/LoreContext';
import { useProject } from './contexts/ProjectContext';

// Lazy load main screens
const Editor = lazy(() => import('./components/Editor.tsx'));
const LoreScreen = lazy(() => import('./components/LoreScreen').then(m => ({ default: m.LoreScreen })));
const VoicesScreen = lazy(() => import('./components/VoicesScreen').then(m => ({ default: m.VoicesScreen })));
const ManuscriptPanel = lazy(() => import('./components/ManuscriptPanel').then(m => ({ default: m.ManuscriptPanel })));

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
    switch (currentScreen) {
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
      case 'lore':
        return (
          <LoreScreen 
            setCurrentScreen={setCurrentScreen} 
          />
        );
      case 'voices':
        return (
          <VoicesScreen 
            setCurrentScreen={setCurrentScreen} 
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
              // We need to pass this down to the Editor component somehow, or handle it here.
              // Since Editor manages its own tabs, we might need to lift the tab state or pass a signal.
              // For now, let's just switch to the workspace screen.
              setCurrentScreen('workspace');
              // We'll need a way to tell the Editor to open the report tab and select this version.
              // A simple way is to use a custom event or a global state/context for "selected version to view".
              // Let's dispatch a custom event that Editor can listen to.
              window.dispatchEvent(new CustomEvent('view-report', { detail: version }));
            }}
          />
        );
      case 'settings':
        return <SettingsScreen showToast={showToast} />;
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
              onAcceptVersion={acceptVersion}
          />
        );
    }
  };

  return (
    <div className={`h-[100dvh] bg-surface text-on-surface flex flex-col font-body overflow-hidden ${isMobile ? 'pb-20' : ''} ${isZenMode ? 'is-zen' : ''}`}>
      {toast && <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} />}
      
      <AnimatePresence>
        {currentScreen !== 'welcome' && !isZenMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="z-50"
          >
            <TopAppBar 
              currentScreen={currentScreen} 
              setCurrentScreen={setCurrentScreen} 
              versionCount={versionCount} 
              showToast={showToast} 
              wordCount={totalWordCount}
              isMobile={isMobile}
              goal={writingGoal}
              onSaveGoal={(newGoal) => {
                setWritingGoal(newGoal);
                localStorage.setItem('echo-writing-goal', JSON.stringify(newGoal));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        scenes={scenes}
        onUpdateScene={handleUpdateScene}
        showToast={showToast}
      />
      
      <main className={`${currentScreen === 'welcome' ? 'flex-1 min-h-0 flex flex-col overflow-hidden' : `flex-1 min-h-0 flex flex-col overflow-hidden ${isZenMode ? 'zen-container' : 'px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 max-w-7xl mx-auto w-full'} ${isMobile && !isZenMode ? 'pb-20' : ''}`}`}>
        <Suspense fallback={<LoadingState />}>
          {renderScreen()}
        </Suspense>
      </main>

      <AnimatePresence>
        {isMobile && !isZenMode && (
            <motion.nav 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low/95 backdrop-blur-xl border-t border-outline-variant/10 px-2 py-2 pb-safe flex items-center justify-around shadow-2xl md:hidden"
            >
              {[
                  { id: 'welcome', label: 'Home', icon: Home },
                  { id: 'lore', label: 'Lore', icon: BookOpen },
                  { id: 'workspace', label: 'Workspace', icon: Layout },
                  { id: 'voices', label: 'Voices', icon: Mic2 },
                  { id: 'manuscript', label: 'Manuscript', icon: FileText }
              ].map(item => (
                  <button
                      key={item.id}
                      onClick={() => setCurrentScreen(item.id as Screen)}
                      className={`flex flex-col items-center gap-1 p-2 transition-all relative ${currentScreen === item.id ? 'text-primary' : 'text-on-surface-variant/60'}`}
                  >
                      <item.icon className={`w-5 h-5 transition-transform ${currentScreen === item.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(208,192,255,0.5)]' : ''}`} />
                      <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                      {currentScreen === item.id && (
                        <motion.div 
                          layoutId="bottom-nav-indicator"
                          className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                        />
                      )}
                  </button>
              ))}
          </motion.nav>
      )}
      </AnimatePresence>
    </div>
  );
}
