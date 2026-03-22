/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import Editor from './components/Editor.tsx';
import { Toast } from './components/Toast';
import { TopAppBar } from './components/TopAppBar';
import { LoreScreen } from './components/LoreScreen';
import { VoicesScreen } from './components/VoicesScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoreEntry, VoiceProfile, Screen, RefinedVersion, AuthorVoice } from './types';
import * as db from './services/dbService';

export default function App() {
  const [draft, setDraft] = useState<string>('');
  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [versionCount, setVersionCount] = useState<number>(0);
  const [versionHistory, setVersionHistory] = useState<RefinedVersion[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  
  // Lore & Voices State
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [authorVoices, setAuthorVoices] = useState<AuthorVoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from IndexedDB on mount and on sync completion
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedLore, loadedVoices, loadedAuthorVoices, loadedEchoes] = await Promise.all([
          db.getLoreEntries(),
          db.getVoiceProfiles(),
          db.getAuthorVoices(),
          db.getEchoes()
        ]);
        setLoreEntries(loadedLore);
        setVoiceProfiles(loadedVoices);
        setAuthorVoices(loadedAuthorVoices);
        setVersionHistory(loadedEchoes);
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

  const showToast = useCallback((message: string) => {
    setToast({ message, id: Date.now() });
  }, []);

  const upsertLoreEntry = async (entry: LoreEntry) => {
    setLoreEntries(prev => {
      const exists = prev.find(e => e.id === entry.id);
      if (exists) {
        return prev.map(e => e.id === entry.id ? entry : e);
      }
      return [entry, ...prev];
    });
    await db.putLoreEntry(entry);
    showToast(`Lore entry "${entry.title}" updated.`);
  };

  const upsertVoiceProfile = async (profile: VoiceProfile) => {
    setVoiceProfiles(prev => {
      const exists = prev.find(p => p.id === profile.id);
      if (exists) {
        return prev.map(p => p.id === profile.id ? profile : p);
      }
      return [profile, ...prev];
    });
    
    await db.putVoiceProfile(profile);
    showToast(`Voice profile for "${profile.name}" updated.`);
  };

  const deleteVersion = async (id: string) => {
    setVersionHistory(prev => prev.filter(v => v.id !== id));
    await db.deleteEcho(id);
    showToast("Echo removed from history.");
  };

  const clearVersionHistory = async () => {
    setVersionHistory([]);
    await db.setAllEchoes([]);
    showToast("Echo archive cleared.");
  };

  const deleteLoreEntry = async (id: string) => {
    setLoreEntries(prev => prev.filter(e => e.id !== id));
    await db.deleteLoreEntry(id);
    showToast("Lore entry deleted.");
  };

  const deleteVoiceProfile = async (id: string) => {
    setVoiceProfiles(prev => prev.filter(p => p.id !== id));
    await db.deleteVoiceProfile(id);
    showToast("Voice profile deleted.");
  };

  const upsertAuthorVoice = async (voice: AuthorVoice) => {
    setAuthorVoices(prev => {
      let updated = prev;
      if (voice.isActive) {
        updated = prev.map(v => ({ ...v, isActive: false }));
      }
      const exists = updated.find(v => v.id === voice.id);
      if (exists) {
        return updated.map(v => v.id === voice.id ? voice : v);
      }
      return [voice, ...updated];
    });

    if (voice.isActive) {
      const allVoices = await db.getAuthorVoices();
      const updatedVoices = allVoices.map(v => ({
        ...v,
        isActive: v.id === voice.id ? true : false
      }));
      await db.setAllAuthorVoices(updatedVoices);
    } else {
      await db.putAuthorVoice(voice);
    }
    showToast(`Author voice "${voice.name}" updated.`);
  };

  const deleteAuthorVoice = async (id: string) => {
    setAuthorVoices(prev => prev.filter(v => v.id !== id));
    await db.deleteAuthorVoice(id);
    showToast("Author voice deleted.");
  };

  const importAuthorVoices = async (voices: AuthorVoice[]) => {
    setAuthorVoices(voices);
    await db.setAllAuthorVoices(voices);
    showToast(`${voices.length} author voices imported.`);
  };

  const importEntries = async (entries: LoreEntry[]) => {
    setLoreEntries(entries);
    await db.setAllLoreEntries(entries);
    showToast(`${entries.length} lore entries imported.`);
  };

  const importProfiles = async (profiles: VoiceProfile[]) => {
    setVoiceProfiles(profiles);
    await db.setAllVoiceProfiles(profiles);
    showToast(`${profiles.length} voice profiles imported.`);
  };

  const addVersion = async (version: RefinedVersion) => {
    setVersionHistory(prev => [version, ...prev]);
    await db.putEcho(version);
  };

  const importVersions = async (versions: RefinedVersion[]) => {
    setVersionHistory(versions);
    await db.setAllEchoes(versions);
    showToast(`${versions.length} echoes imported.`);
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface">Loading Echo...</div>;
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
      case 'workspace':
      default:
        return (
          <Editor 
              draft={draft}
              setDraft={setDraft}
              isRefining={isRefining}
              setIsRefining={setIsRefining}
              showToast={showToast}
              onVersionCountChange={setVersionCount}
              onVersionHistoryChange={setVersionHistory}
              loreEntries={loreEntries}
              voiceProfiles={voiceProfiles}
              authorVoices={authorVoices}
              versionHistory={versionHistory}
              onAddLoreEntry={upsertLoreEntry}
              onAddVoiceProfile={upsertVoiceProfile}
              onAddAuthorVoice={upsertAuthorVoice}
              onAddVersion={addVersion}
              onClearVersionHistory={clearVersionHistory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body">
      {toast && <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} />}
      
      {currentScreen !== 'welcome' && (
        <TopAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} versionCount={versionCount} showToast={showToast} />
      )}
      
      <main className={`${currentScreen === 'welcome' ? '' : 'pb-12 px-6 max-w-7xl mx-auto w-full flex-grow flex flex-col'}`}>
        {renderScreen()}
      </main>
    </div>
  );
}
