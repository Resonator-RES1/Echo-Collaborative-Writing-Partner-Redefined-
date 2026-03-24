import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoreEntry, VoiceProfile, AuthorVoice } from '../types';
import * as db from '../services/dbService';

interface LoreContextType {
  loreEntries: LoreEntry[];
  voiceProfiles: VoiceProfile[];
  authorVoices: AuthorVoice[];
  isLoaded: boolean;
  addLoreEntry: (entry: LoreEntry) => Promise<void>;
  deleteLoreEntry: (id: string) => Promise<void>;
  addVoiceProfile: (profile: VoiceProfile) => Promise<void>;
  deleteVoiceProfile: (id: string) => Promise<void>;
  addAuthorVoice: (voice: AuthorVoice) => Promise<void>;
  deleteAuthorVoice: (id: string) => Promise<void>;
  importLoreEntries: (entries: LoreEntry[]) => Promise<void>;
  importVoiceProfiles: (profiles: VoiceProfile[]) => Promise<void>;
  importAuthorVoices: (voices: AuthorVoice[]) => Promise<void>;
  reloadLoreData: () => Promise<void>;
}

const LoreContext = createContext<LoreContextType | undefined>(undefined);

export const useLore = () => {
  const context = useContext(LoreContext);
  if (!context) {
    throw new Error('useLore must be used within a LoreProvider');
  }
  return context;
};

export const LoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [authorVoices, setAuthorVoices] = useState<AuthorVoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = async () => {
    try {
      const [loadedLore, loadedVoices, loadedAuthorVoices] = await Promise.all([
        db.getLoreEntries(),
        db.getVoiceProfiles(),
        db.getAuthorVoices()
      ]);
      setLoreEntries(loadedLore);
      setVoiceProfiles(loadedVoices);
      setAuthorVoices(loadedAuthorVoices);
    } catch (e) {
      console.error("Failed to load lore data from DB", e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
    
    const handleSyncComplete = () => {
      loadData();
    };
    window.addEventListener('echo-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('echo-sync-complete', handleSyncComplete);
  }, []);

  const addLoreEntry = async (entry: LoreEntry) => {
    const newEntries = [...loreEntries.filter(e => e.id !== entry.id), entry];
    setLoreEntries(newEntries);
    await db.putLoreEntry(entry);
  };

  const deleteLoreEntry = async (id: string) => {
    const newEntries = loreEntries.filter(e => e.id !== id);
    setLoreEntries(newEntries);
    await db.deleteLoreEntry(id);
  };

  const addVoiceProfile = async (profile: VoiceProfile) => {
    const newProfiles = [...voiceProfiles.filter(p => p.id !== profile.id), profile];
    setVoiceProfiles(newProfiles);
    await db.putVoiceProfile(profile);
  };

  const deleteVoiceProfile = async (id: string) => {
    const newProfiles = voiceProfiles.filter(p => p.id !== id);
    setVoiceProfiles(newProfiles);
    await db.deleteVoiceProfile(id);
  };

  const addAuthorVoice = async (voice: AuthorVoice) => {
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
  };

  const deleteAuthorVoice = async (id: string) => {
    const newVoices = authorVoices.filter(v => v.id !== id);
    setAuthorVoices(newVoices);
    await db.deleteAuthorVoice(id);
  };

  const importLoreEntries = async (entries: LoreEntry[]) => {
    setLoreEntries(entries);
    await db.setAllLoreEntries(entries);
  };

  const importVoiceProfiles = async (profiles: VoiceProfile[]) => {
    setVoiceProfiles(profiles);
    await db.setAllVoiceProfiles(profiles);
  };

  const importAuthorVoices = async (voices: AuthorVoice[]) => {
    setAuthorVoices(voices);
    await db.setAllAuthorVoices(voices);
  };

  return (
    <LoreContext.Provider
      value={{
        loreEntries,
        voiceProfiles,
        authorVoices,
        isLoaded,
        addLoreEntry,
        deleteLoreEntry,
        addVoiceProfile,
        deleteVoiceProfile,
        addAuthorVoice,
        deleteAuthorVoice,
        importLoreEntries,
        importVoiceProfiles,
        importAuthorVoices,
        reloadLoreData: loadData
      }}
    >
      {children}
    </LoreContext.Provider>
  );
};
