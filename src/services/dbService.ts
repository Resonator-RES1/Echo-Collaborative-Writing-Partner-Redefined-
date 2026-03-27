import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { LoreEntry, VoiceProfile, RefinedVersion, AuthorVoice, Scene, Chapter } from '../types';

interface EchoDB extends DBSchema {
  lore: {
    key: string;
    value: LoreEntry;
  };
  voices: {
    key: string;
    value: VoiceProfile;
  };
  authorVoices: {
    key: string;
    value: AuthorVoice;
  };
  echoes: {
    key: string;
    value: RefinedVersion;
  };
  scenes: {
    key: string;
    value: Scene;
  };
  chapters: {
    key: string;
    value: Chapter;
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'echo-cloud-db';
const DB_VERSION = 5; // Bump version to add chapters

let dbPromise: Promise<IDBPDatabase<EchoDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<EchoDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('lore')) {
          db.createObjectStore('lore', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('voices')) {
          db.createObjectStore('voices', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('authorVoices')) {
          db.createObjectStore('authorVoices', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('echoes')) {
          db.createObjectStore('echoes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('scenes')) {
          db.createObjectStore('scenes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        // Remove syncMetadata if it exists from previous versions
        if (db.objectStoreNames.contains('syncMetadata' as any)) {
          db.deleteObjectStore('syncMetadata' as any);
        }
      },
    });
  }
  return dbPromise;
};

// --- LORE ---
export const getLoreEntries = async (): Promise<LoreEntry[]> => {
  const db = await getDB();
  return db.getAll('lore');
};

export const putLoreEntry = async (entry: LoreEntry): Promise<void> => {
  const db = await getDB();
  await db.put('lore', entry);
};

export const deleteLoreEntry = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('lore', id);
};

export const setAllLoreEntries = async (entries: LoreEntry[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('lore', 'readwrite');
  await tx.store.clear();
  for (const entry of entries) {
    await tx.store.put(entry);
  }
  await tx.done;
};

// --- VOICES ---
export const getVoiceProfiles = async (): Promise<VoiceProfile[]> => {
  const db = await getDB();
  return db.getAll('voices');
};

export const putVoiceProfile = async (profile: VoiceProfile): Promise<void> => {
  const db = await getDB();
  await db.put('voices', profile);
};

export const deleteVoiceProfile = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('voices', id);
};

export const setAllVoiceProfiles = async (profiles: VoiceProfile[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('voices', 'readwrite');
  await tx.store.clear();
  for (const profile of profiles) {
    await tx.store.put(profile);
  }
  await tx.done;
};

// --- AUTHOR VOICES ---
export const getAuthorVoices = async (): Promise<AuthorVoice[]> => {
  const db = await getDB();
  return db.getAll('authorVoices');
};

export const putAuthorVoice = async (voice: AuthorVoice): Promise<void> => {
  const db = await getDB();
  await db.put('authorVoices', voice);
};

export const deleteAuthorVoice = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('authorVoices', id);
};

export const setAllAuthorVoices = async (voices: AuthorVoice[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('authorVoices', 'readwrite');
  await tx.store.clear();
  for (const voice of voices) {
    await tx.store.put(voice);
  }
  await tx.done;
};

// --- ECHOES ---
export const getEchoes = async (): Promise<RefinedVersion[]> => {
  const db = await getDB();
  const echoes = await db.getAll('echoes');
  // Sort by timestamp descending
  return echoes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const putEcho = async (echo: RefinedVersion): Promise<void> => {
  const db = await getDB();
  await db.put('echoes', echo);

  // --- ARCHIVE AUTO-PRUNER ---
  const sceneId = echo.sceneId;
  if (sceneId) {
    const allEchoes = await db.getAll('echoes');
    const sceneEchoes = allEchoes.filter(e => e.sceneId === sceneId);
    
    if (sceneEchoes.length > 5) {
      // Sort by timestamp ascending (oldest first)
      sceneEchoes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Get the oldest ones to delete
      const echoesToDelete = sceneEchoes.slice(0, sceneEchoes.length - 5);
      
      const tx = db.transaction('echoes', 'readwrite');
      for (const echoToDelete of echoesToDelete) {
        await tx.store.delete(echoToDelete.id);
      }
      await tx.done;
    }
  }
  // --- END AUTO-PRUNER ---
};

export const deleteEcho = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('echoes', id);
};

export const setAllEchoes = async (echoes: RefinedVersion[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('echoes', 'readwrite');
  await tx.store.clear();
  for (const echo of echoes) {
    await tx.store.put(echo);
  }
  await tx.done;
};

// --- SCENES ---
export const getScenes = async (): Promise<Scene[]> => {
  const db = await getDB();
  const scenes = await db.getAll('scenes');
  return scenes.sort((a, b) => a.order - b.order);
};

export const putScene = async (scene: Scene): Promise<void> => {
  const db = await getDB();
  await db.put('scenes', scene);
};

export const deleteScene = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('scenes', id);
};

export const setAllScenes = async (scenes: Scene[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('scenes', 'readwrite');
  await tx.store.clear();
  for (const scene of scenes) {
    await tx.store.put(scene);
  }
  await tx.done;
};

// --- CHAPTERS ---
export const getChapters = async (): Promise<Chapter[]> => {
  const db = await getDB();
  const chapters = await db.getAll('chapters');
  return chapters.sort((a, b) => a.order - b.order);
};

export const putChapter = async (chapter: Chapter): Promise<void> => {
  const db = await getDB();
  await db.put('chapters', chapter);
};

export const deleteChapter = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('chapters', id);
};

export const setAllChapters = async (chapters: Chapter[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('chapters', 'readwrite');
  await tx.store.clear();
  for (const chapter of chapters) {
    await tx.store.put(chapter);
  }
  await tx.done;
};

// --- SETTINGS ---
export const getSetting = async (key: string): Promise<any> => {
  const db = await getDB();
  return db.get('settings', key);
};

export const putSetting = async (key: string, value: any): Promise<void> => {
  const db = await getDB();
  await db.put('settings', value, key);
};

export const getAllSettings = async (): Promise<Record<string, any>> => {
  const db = await getDB();
  const keys = await db.getAllKeys('settings');
  const values = await db.getAll('settings');
  const settings: Record<string, any> = {};
  keys.forEach((key, i) => {
    if (key !== 'google_access_token' && key !== 'current_project') {
      settings[key as string] = values[i];
    }
  });
  return settings;
};

export const setAllSettings = async (settings: Record<string, any>): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('settings', 'readwrite');
  // Don't clear the store, just update the keys from the remote settings
  // so we don't delete global settings like google_access_token
  for (const [key, value] of Object.entries(settings)) {
    if (key !== 'google_access_token' && key !== 'current_project') {
      await tx.store.put(value, key);
    }
  }
  await tx.done;
};

export const clearProjectData = async (): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(['lore', 'voices', 'authorVoices', 'echoes', 'scenes', 'chapters'], 'readwrite');
  await tx.objectStore('lore').clear();
  await tx.objectStore('voices').clear();
  await tx.objectStore('authorVoices').clear();
  await tx.objectStore('echoes').clear();
  await tx.objectStore('scenes').clear();
  await tx.objectStore('chapters').clear();
  await tx.done;
  
  // Also clear project-specific settings but keep auth/project info
  const settingsTx = db.transaction('settings', 'readwrite');
  const keys = await settingsTx.store.getAllKeys();
  for (const key of keys) {
    if (key !== 'google_access_token' && key !== 'current_project') {
      await settingsTx.store.delete(key);
    }
  }
  await settingsTx.done;
};
