/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import Editor from './components/Editor.tsx';
import { Toast } from './components/Toast';
import { TopAppBar } from './components/TopAppBar';
import { LoreScreen } from './components/LoreScreen';
import { AnalysisScreen } from './components/AnalysisScreen';
import { VoicesScreen } from './components/VoicesScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { LoreEntry, VoiceProfile, Screen, RefinedVersion } from './types';

export default function App() {
  const [draft, setDraft] = useState<string>('');
  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [versionCount, setVersionCount] = useState<number>(0);
  const [versionHistory, setVersionHistory] = useState<RefinedVersion[]>(() => {
    try {
      const saved = localStorage.getItem('echo-version-history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load version history", e);
      return [];
    }
  });
  const [currentScreen, setCurrentScreen] = useState<Screen>('workspace');
  
  // Lore & Voices State
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>(() => {
    try {
      const saved = localStorage.getItem('echo-lore-entries');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load lore entries", e);
      return [];
    }
  });
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>(() => {
    try {
      const saved = localStorage.getItem('echo-voice-profiles');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load voice profiles", e);
      return [];
    }
  });

  // Persist Lore & Voices & History
  React.useEffect(() => {
    localStorage.setItem('echo-lore-entries', JSON.stringify(loreEntries));
  }, [loreEntries]);

  React.useEffect(() => {
    localStorage.setItem('echo-voice-profiles', JSON.stringify(voiceProfiles));
  }, [voiceProfiles]);

  React.useEffect(() => {
    localStorage.setItem('echo-version-history', JSON.stringify(versionHistory));
  }, [versionHistory]);

  const showToast = useCallback((message: string) => {
    setToast({ message, id: Date.now() });
  }, []);

  const upsertLoreEntry = (entry: LoreEntry) => {
    setLoreEntries(prev => {
      const exists = prev.find(e => e.id === entry.id);
      if (exists) {
        return prev.map(e => e.id === entry.id ? entry : e);
      }
      return [entry, ...prev];
    });
    showToast(`Lore entry "${entry.title}" updated.`);
  };

  const upsertVoiceProfile = (profile: VoiceProfile) => {
    setVoiceProfiles(prev => {
      const exists = prev.find(p => p.id === profile.id);
      if (exists) {
        return prev.map(p => p.id === profile.id ? profile : p);
      }
      return [profile, ...prev];
    });
    showToast(`Voice profile for "${profile.name}" updated.`);
  };

  const deleteVersion = (id: string) => {
    setVersionHistory(prev => prev.filter(v => v.id !== id));
    showToast("Echo removed from history.");
  };

  const importEntries = (entries: LoreEntry[]) => {
    setLoreEntries(entries);
    showToast(`${entries.length} lore entries imported.`);
  };

  const importProfiles = (profiles: VoiceProfile[]) => {
    setVoiceProfiles(profiles);
    showToast(`${profiles.length} voice profiles imported.`);
  };

  const addVersion = (version: RefinedVersion) => {
    setVersionHistory(prev => [version, ...prev]);
  };

  const importVersions = (versions: RefinedVersion[]) => {
    setVersionHistory(versions);
    showToast(`${versions.length} echoes imported.`);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'lore':
        return (
          <LoreScreen 
            setCurrentScreen={setCurrentScreen} 
            loreEntries={loreEntries}
            onAddEntry={upsertLoreEntry}
            onImportEntries={importEntries}
          />
        );
      case 'analysis':
        return (
          <AnalysisScreen 
            setCurrentScreen={setCurrentScreen} 
            loreEntries={loreEntries}
            voiceProfiles={voiceProfiles}
            versionHistory={versionHistory}
            onDeleteVersion={deleteVersion}
            onImportVersions={importVersions}
          />
        );
      case 'voices':
        return (
          <VoicesScreen 
            setCurrentScreen={setCurrentScreen} 
            voiceProfiles={voiceProfiles}
            onAddProfile={upsertVoiceProfile}
            onImportProfiles={importProfiles}
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
              versionHistory={versionHistory}
              onAddLoreEntry={upsertLoreEntry}
              onAddVoiceProfile={upsertVoiceProfile}
              onAddVersion={addVersion}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body">
      {toast && <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} />}
      
      <TopAppBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} versionCount={versionCount} />
      
      <main className="pb-12 px-6 max-w-7xl mx-auto w-full flex-grow flex flex-col">
        {renderScreen()}
      </main>

      <BottomNavBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
}
