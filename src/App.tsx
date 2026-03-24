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
import { LoreEntry, VoiceProfile, Screen, RefinedVersion, AuthorVoice, Scene } from './types';
import * as db from './services/dbService';

export default function App() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>('');
  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [versionCount, setVersionCount] = useState<number>(0);
  const [versionHistory, setVersionHistory] = useState<RefinedVersion[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('workspace');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Lore & Voices State
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [authorVoices, setAuthorVoices] = useState<AuthorVoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from IndexedDB on mount and on sync completion
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedLore, loadedVoices, loadedAuthorVoices, loadedEchoes, loadedScenes] = await Promise.all([
          db.getLoreEntries(),
          db.getVoiceProfiles(),
          db.getAuthorVoices(),
          db.getEchoes(),
          db.getScenes()
        ]);
        setLoreEntries(loadedLore);
        setVoiceProfiles(loadedVoices);
        setAuthorVoices(loadedAuthorVoices);
        
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
        setIsLoaded(true);
      }
    };
    
    loadData();

    const handleSyncComplete = () => {
      loadData();
    };

    window.addEventListener('sync-complete', handleSyncComplete);
    return () => window.removeEventListener('sync-complete', handleSyncComplete);
  }, []);

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

  const upsertLoreEntry = useCallback(async (entry: LoreEntry) => {
    setLoreEntries(prev => {
      const exists = prev.find(e => e.id === entry.id);
      if (exists) {
        return prev.map(e => e.id === entry.id ? entry : e);
      }
      return [entry, ...prev];
    });
    await db.putLoreEntry(entry);
    showToast(`Lore entry "${entry.title}" updated.`);
  }, [showToast]);

  const upsertVoiceProfile = useCallback(async (profile: VoiceProfile) => {
    setVoiceProfiles(prev => {
      const exists = prev.find(p => p.id === profile.id);
      if (exists) {
        return prev.map(p => p.id === profile.id ? profile : p);
      }
      return [profile, ...prev];
    });
    
    await db.putVoiceProfile(profile);
    showToast(`Voice profile for "${profile.name}" updated.`);
  }, [showToast]);

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

  const deleteLoreEntry = useCallback(async (id: string) => {
    setLoreEntries(prev => prev.filter(e => e.id !== id));
    await db.deleteLoreEntry(id);
    showToast("Lore entry deleted.");
  }, [showToast]);

  const deleteVoiceProfile = useCallback(async (id: string) => {
    setVoiceProfiles(prev => prev.filter(p => p.id !== id));
    await db.deleteVoiceProfile(id);
    showToast("Voice profile deleted.");
  }, [showToast]);

  const upsertAuthorVoice = useCallback(async (voice: AuthorVoice) => {
    let updatedVoices: AuthorVoice[] = [];
    
    setAuthorVoices(prev => {
      let base = prev;
      if (voice.isActive) {
        base = prev.map(v => ({ ...v, isActive: false }));
      }
      
      const exists = base.find(v => v.id === voice.id);
      if (exists) {
        updatedVoices = base.map(v => v.id === voice.id ? voice : v);
      } else {
        updatedVoices = [voice, ...base];
      }
      return updatedVoices;
    });

    const currentVoices = await db.getAuthorVoices();
    let dbVoices: AuthorVoice[] = [];
    
    if (voice.isActive) {
      dbVoices = currentVoices.map(v => ({
        ...v,
        isActive: v.id === voice.id ? true : false
      }));
      if (!dbVoices.find(v => v.id === voice.id)) {
        dbVoices.unshift(voice);
      }
    } else {
      const exists = currentVoices.find(v => v.id === voice.id);
      if (exists) {
        dbVoices = currentVoices.map(v => v.id === voice.id ? voice : v);
      } else {
        dbVoices = [voice, ...currentVoices];
      }
    }
    
    await db.setAllAuthorVoices(dbVoices);
    showToast(`Author voice "${voice.name}" updated.`);
  }, [showToast]);

  const deleteAuthorVoice = useCallback(async (id: string) => {
    setAuthorVoices(prev => prev.filter(v => v.id !== id));
    await db.deleteAuthorVoice(id);
    showToast("Author voice deleted.");
  }, [showToast]);

  const importAuthorVoices = useCallback(async (voices: AuthorVoice[]) => {
    setAuthorVoices(voices);
    await db.setAllAuthorVoices(voices);
    showToast(`${voices.length} author voices imported.`);
  }, [showToast]);

  const importEntries = useCallback(async (entries: LoreEntry[]) => {
    setLoreEntries(entries);
    await db.setAllLoreEntries(entries);
    showToast(`${entries.length} lore entries imported.`);
  }, [showToast]);

  const importProfiles = useCallback(async (profiles: VoiceProfile[]) => {
    setVoiceProfiles(profiles);
    await db.setAllVoiceProfiles(profiles);
    showToast(`${profiles.length} voice profiles imported.`);
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

  const handleUpdateLoreEntry = useCallback(async (entry: LoreEntry) => {
    setLoreEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    await db.putLoreEntry(entry);
  }, []);

  const handleUpdateVoiceProfile = useCallback(async (profile: VoiceProfile) => {
    setVoiceProfiles(prev => prev.map(p => p.id === profile.id ? profile : p));
    await db.putVoiceProfile(profile);
  }, []);

  const handleUpdateAuthorVoice = useCallback(async (voice: AuthorVoice) => {
    setAuthorVoices(prev => prev.map(v => v.id === voice.id ? voice : v));
    await db.setAllAuthorVoices(authorVoices.map(v => v.id === voice.id ? voice : v));
  }, [authorVoices]);

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
            loreEntries={loreEntries}
            onAddEntry={upsertLoreEntry}
            onDeleteEntry={deleteLoreEntry}
            onImportEntries={importEntries}
          />
        );
      case 'voices':
        return (
          <VoicesScreen 
            setCurrentScreen={setCurrentScreen} 
            voiceProfiles={voiceProfiles}
            authorVoices={authorVoices}
            onAddProfile={upsertVoiceProfile}
            onDeleteProfile={deleteVoiceProfile}
            onAddAuthorVoice={upsertAuthorVoice}
            onDeleteAuthorVoice={deleteAuthorVoice}
            onImportProfiles={importProfiles}
            onImportAuthorVoices={importAuthorVoices}
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
              loreEntries={loreEntries}
              voiceProfiles={voiceProfiles}
              authorVoices={authorVoices}
              versionHistory={filteredVersionHistory}
              onAddLoreEntry={upsertLoreEntry}
              onAddVoiceProfile={upsertVoiceProfile}
              onAddAuthorVoice={upsertAuthorVoice}
              onDeleteLoreEntry={deleteLoreEntry}
              onDeleteVoiceProfile={deleteVoiceProfile}
              onDeleteAuthorVoice={deleteAuthorVoice}
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
        loreEntries={loreEntries}
        voiceProfiles={voiceProfiles}
        authorVoices={authorVoices}
        onUpdateScene={handleUpdateScene}
        onUpdateLore={handleUpdateLoreEntry}
        onUpdateVoiceProfile={handleUpdateVoiceProfile}
        onUpdateAuthorVoice={handleUpdateAuthorVoice}
        showToast={showToast}
      />
      
      <main className={`${currentScreen === 'welcome' ? 'h-full' : `px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 max-w-7xl mx-auto w-full flex-1 min-h-0 flex flex-col overflow-hidden ${isFocusMode ? 'pt-12' : ''}`}`}>
        {renderScreen()}
      </main>
    </div>
  );
}
