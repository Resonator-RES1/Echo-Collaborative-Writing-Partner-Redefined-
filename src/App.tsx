/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Editor from './components/Editor.tsx';
import { Toast } from './components/Toast';
import { TopAppBar } from './components/TopAppBar';
import { LoreScreen } from './components/LoreScreen';
import { VoicesScreen } from './components/VoicesScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ManuscriptPanel } from './components/ManuscriptPanel';
import { SettingsScreen } from './components/SettingsScreen';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Screen, RefinedVersion, Scene } from './types';
import * as db from './services/dbService';
import { useLore } from './contexts/LoreContext';

export default function App() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>('');
  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [versionCount, setVersionCount] = useState<number>(0);
  const [versionHistory, setVersionHistory] = useState<RefinedVersion[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
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
        const [loadedEchoes, loadedScenes] = await Promise.all([
          db.getEchoes(),
          db.getScenes()
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
            
            // Try to load legacy draft
            const legacyDraft = localStorage.getItem('echo-draft');
            if (legacyDraft) {
                setDraft(legacyDraft);
            }
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

  // Sync draft changes to current scene
  useEffect(() => {
      if (!isLoaded || !currentSceneId) return;
      
      const timer = setTimeout(() => {
          setScenes(prev => {
              const updated = prev.map(s => s.id === currentSceneId ? { ...s, content: draft, lastModified: new Date().toISOString() } : s);
              const activeScene = updated.find(s => s.id === currentSceneId);
              if (activeScene) {
                  db.putScene(activeScene);
              }
              return updated;
          });
      }, 1000);
      return () => clearTimeout(timer);
  }, [draft, currentSceneId, isLoaded]);

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
    showToast("Version accepted and stored in Manuscript.");
  }, [showToast]);

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
    setVersionHistory(prev => [version, ...prev]);
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
        return <WelcomeScreen onStart={() => setCurrentScreen('workspace')} />;
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
            currentSceneId={currentSceneId}
            setCurrentSceneId={setCurrentSceneId}
            setScenes={setScenes}
            setDraft={setDraft}
            showToast={showToast}
            versionHistory={versionHistory.filter(v => v.isAccepted)}
            onDeleteVersion={deleteVersion}
            onClearAcceptedVersions={clearAcceptedVersions}
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
              isFocusMode={isFocusMode}
              setIsFocusMode={setIsFocusMode}
          />
        );
    }
  };

  return (
    <div className="h-[100dvh] bg-surface text-on-surface flex flex-col font-body overflow-hidden">
      {toast && <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} />}
      
      {currentScreen !== 'welcome' && !isFocusMode && (
        <TopAppBar 
          currentScreen={currentScreen} 
          setCurrentScreen={setCurrentScreen} 
          versionCount={versionCount} 
          showToast={showToast} 
          wordCount={totalWordCount}
        />
      )}
      
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        scenes={scenes}
        onUpdateScene={handleUpdateScene}
        showToast={showToast}
      />
      
      <main className={`${currentScreen === 'welcome' ? 'flex-1 min-h-0 flex flex-col overflow-hidden' : `px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 max-w-7xl mx-auto w-full flex-1 min-h-0 flex flex-col overflow-hidden ${isFocusMode ? 'pt-12' : ''}`}`}>
        {renderScreen()}
      </main>
    </div>
  );
}
