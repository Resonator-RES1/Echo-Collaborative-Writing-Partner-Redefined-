import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { DriveService } from '../services/driveService';
import * as db from '../services/dbService';

export interface Project {
  id: string;
  name: string;
}

interface SyncContextType {
  isAuthenticated: boolean;
  isSyncing: boolean;
  isConfigured: boolean;
  lastSyncTime: number | null;
  login: () => void;
  logout: () => void;
  forceSync: () => Promise<void>;
  syncStatus: string;
  syncError: string | null;
  projects: Project[];
  currentProject: Project | null;
  switchProject: (project: Project) => Promise<void>;
  createProject: (name: string) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within a SyncProvider');
  return context;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isConfigured = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'dummy-client-id');

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('Offline');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Load token and current project from IndexedDB on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const token = await db.getSetting('google_access_token');
      const savedProject = await db.getSetting('current_project');
      if (savedProject) {
        setCurrentProject(savedProject);
      }
      if (token) {
        setAccessToken(token);
        setSyncStatus('Connected');
        // Trigger initial sync
        performSync(token, savedProject);
      }
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      await db.putSetting('google_access_token', tokenResponse.access_token);
      setSyncStatus('Connected');
      // Trigger initial sync
      performSync(tokenResponse.access_token, currentProject);
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setSyncStatus('Login Failed');
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  });

  const login = () => {
    if (!isConfigured) {
      setSyncStatus('Missing Client ID');
      return;
    }
    googleLogin();
  };

  const logout = () => {
    googleLogout();
    setAccessToken(null);
    db.putSetting('google_access_token', null);
    setSyncStatus('Offline');
    setProjects([]);
  };

  const fetchProjects = async (token: string) => {
    const drive = new DriveService(token);
    const userInfo = await drive.getUserInfo();
    const rootFolderId = await drive.getOrCreateFolder('Echo Projects');
    const userFolderId = await drive.getOrCreateFolder(userInfo.name || userInfo.email || 'User', rootFolderId);
    const files = await drive.listFilesInFolder(userFolderId);
    // Filter out any non-folder files
    const projectList = files
      .filter(f => f.mimeType === 'application/vnd.google-apps.folder')
      .map(f => ({ id: f.id, name: f.name }));
    setProjects(projectList);
    return { drive, rootFolderId: userFolderId, projectList };
  };

  const switchProject = async (project: Project) => {
    if (!accessToken || isSyncing) return;
    setCurrentProject(project);
    await db.putSetting('current_project', project);
    
    // Clear local DB data when switching projects to ensure isolation
    await db.clearProjectData();
    
    // Reload page to refresh app state and trigger fresh sync on mount
    window.location.reload();
  };

  const createProject = async (name: string) => {
    if (!accessToken) return;
    const drive = new DriveService(accessToken);
    const userInfo = await drive.getUserInfo();
    const rootFolderId = await drive.getOrCreateFolder('Echo Projects');
    const userFolderId = await drive.getOrCreateFolder(userInfo.name || userInfo.email || 'User', rootFolderId);
    const newFolderId = await drive.getOrCreateFolder(name, userFolderId);
    const newProject = { id: newFolderId, name };
    setProjects(prev => [...prev, newProject]);
    await switchProject(newProject);
  };

  const performSync = useCallback(async (token: string, targetProject: Project | null) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    setSyncStatus('Syncing...');

    try {
      const { drive, rootFolderId, projectList } = await fetchProjects(token);
      
      let activeProject = targetProject;
      
      if (!activeProject) {
        if (projectList.length > 0) {
          activeProject = projectList[0];
        } else {
          // Create default project
          const defaultFolderId = await drive.getOrCreateFolder('My Project', rootFolderId);
          activeProject = { id: defaultFolderId, name: 'My Project' };
          setProjects([{ id: defaultFolderId, name: 'My Project' }]);
        }
        setCurrentProject(activeProject);
        await db.putSetting('current_project', activeProject);
      }

      const projectFolderId = activeProject.id;
      const echoesFolderId = await drive.getOrCreateFolder('echoes', projectFolderId);

      // 2. Fetch remote files
      const remoteFiles = await drive.listFilesInFolder(projectFolderId);
      const remoteEchoes = await drive.listFilesInFolder(echoesFolderId);

      // Helper to find file ID
      const getFileId = (name: string) => remoteFiles.find(f => f.name === name)?.id;

      const mergeAndUploadArray = async (
        fileName: string,
        localData: any[],
        dbGetMeta: () => Promise<any>,
        dbSetAll: (data: any[]) => Promise<void>,
        dbPutMeta: (meta: any) => Promise<void>
      ) => {
        let changed = false;
        const meta = await dbGetMeta() || { isDirty: true, lastSynced: 0 };
        const fileId = getFileId(fileName);
        if (meta.isDirty) {
          try {
            const res = await drive.uploadFile(fileName, JSON.stringify(localData), projectFolderId, fileId, meta.revisionId);
            await dbPutMeta({ fileId: res.id, revisionId: res.revisionId, lastSynced: Date.now(), isDirty: false });
          } catch (e: any) {
            if (e.message.includes('Precondition Failed')) {
              const remoteFile = remoteFiles.find(f => f.name === fileName);
              if (remoteFile) {
                const remoteData = await drive.downloadFile(remoteFile.id);
                const merged = [...remoteData];
                for (const local of localData) {
                  const existingIndex = merged.findIndex((m: any) => m.id === local.id);
                  if (existingIndex === -1) {
                    merged.push(local);
                  } else {
                    const localTime = local.lastModified ? new Date(local.lastModified).getTime() : 0;
                    const remoteTime = merged[existingIndex].lastModified ? new Date(merged[existingIndex].lastModified).getTime() : 0;
                    if (localTime >= remoteTime) {
                      merged[existingIndex] = local;
                    }
                  }
                }
                await dbSetAll(merged);
                const res = await drive.uploadFile(fileName, JSON.stringify(merged), projectFolderId, remoteFile.id, remoteFile.headRevisionId);
                await dbPutMeta({ fileId: res.id, revisionId: res.revisionId, lastSynced: Date.now(), isDirty: false });
                changed = true;
              }
            } else {
              throw e;
            }
          }
        } else if (fileId) {
          const remoteFile = remoteFiles.find(f => f.name === fileName);
          if (remoteFile && new Date(remoteFile.modifiedTime).getTime() > meta.lastSynced) {
              const remoteData = await drive.downloadFile(remoteFile.id);
              await dbSetAll(remoteData);
              await dbPutMeta({ fileId: remoteFile.id, revisionId: remoteFile.headRevisionId, lastSynced: Date.now(), isDirty: false });
              changed = true;
          }
        }
        return changed;
      };

      // --- LORE SYNC ---
      const loreChanged = await mergeAndUploadArray(
        'lore.json',
        await db.getLoreEntries(),
        () => db.getSyncMetadata('lore.json'),
        db.setAllLoreEntries,
        (meta) => db.putSyncMetadata('lore.json', meta)
      );

      // --- VOICES SYNC ---
      const voicesChanged = await mergeAndUploadArray(
        'voice_profiles.json',
        await db.getVoiceProfiles(),
        () => db.getSyncMetadata('voice_profiles.json'),
        db.setAllVoiceProfiles,
        (meta) => db.putSyncMetadata('voice_profiles.json', meta)
      );

      // --- SETTINGS SYNC ---
      let settingsChanged = false;
      const settingsMeta = await db.getSyncMetadata('settings.json') || { isDirty: true, lastSynced: 0 };
      if (settingsMeta.isDirty) {
        const localSettings = await db.getAllSettings();
        try {
          const res = await drive.uploadFile('settings.json', JSON.stringify(localSettings), projectFolderId, getFileId('settings.json'), settingsMeta.revisionId);
          await db.putSyncMetadata('settings.json', { fileId: res.id, revisionId: res.revisionId, lastSynced: Date.now(), isDirty: false });
        } catch (e: any) {
          if (e.message.includes('Precondition Failed')) {
            const remoteFile = remoteFiles.find(f => f.name === 'settings.json');
            if (remoteFile) {
              const remoteSettings = await drive.downloadFile(remoteFile.id);
              // Simple merge: local overwrites remote for settings
              const merged = { ...remoteSettings, ...localSettings };
              await db.setAllSettings(merged);
              const res = await drive.uploadFile('settings.json', JSON.stringify(merged), projectFolderId, remoteFile.id, remoteFile.headRevisionId);
              await db.putSyncMetadata('settings.json', { fileId: res.id, revisionId: res.revisionId, lastSynced: Date.now(), isDirty: false });
              settingsChanged = true;
            }
          } else {
            throw e;
          }
        }
      } else if (getFileId('settings.json')) {
        const remoteFile = remoteFiles.find(f => f.name === 'settings.json');
        if (remoteFile && new Date(remoteFile.modifiedTime).getTime() > settingsMeta.lastSynced) {
            const remoteSettings = await drive.downloadFile(remoteFile.id);
            await db.setAllSettings(remoteSettings);
            await db.putSyncMetadata('settings.json', { fileId: remoteFile.id, revisionId: remoteFile.headRevisionId, lastSynced: Date.now(), isDirty: false });
            settingsChanged = true;
        }
      }

      // --- ECHOES SYNC ---
      const echoesMeta = await db.getSyncMetadata('echoes') || { isDirty: true, lastSynced: 0 };
      const localEchoes = await db.getEchoes();
      
      const remoteEchoesMap = new Map(remoteEchoes.map(f => [f.name, f]));
      
      let echoesChanged = false;
      const downloadedEchoes = [];

      // 1. Upload local changes that are newer than remote
      for (const echo of localEchoes) {
          const fileName = `echo_${echo.id}.json`;
          const remoteFile = remoteEchoesMap.get(fileName);
          
          const localTime = new Date(echo.timestamp).getTime();
          
          if (!remoteFile) {
              // New local file
              await drive.uploadFile(fileName, JSON.stringify(echo), echoesFolderId);
              echoesChanged = true;
          } else {
              const remoteTime = new Date(remoteFile.modifiedTime).getTime();
              // Local is newer by at least 2 seconds
              if (localTime > remoteTime + 2000) {
                  await drive.uploadFile(fileName, JSON.stringify(echo), echoesFolderId, remoteFile.id);
                  echoesChanged = true;
              }
          }
      }

      // 2. Download remote changes that are newer than local
      for (const remoteFile of remoteEchoes) {
          const localEcho = localEchoes.find(e => `echo_${e.id}.json` === remoteFile.name);
          
          if (!localEcho) {
              // New remote file
              const echoData = await drive.downloadFile(remoteFile.id);
              downloadedEchoes.push(echoData);
              echoesChanged = true;
          } else {
              const localTime = new Date(localEcho.timestamp).getTime();
              const remoteTime = new Date(remoteFile.modifiedTime).getTime();
              // Remote is newer by at least 2 seconds
              if (remoteTime > localTime + 2000) {
                  const echoData = await drive.downloadFile(remoteFile.id);
                  downloadedEchoes.push(echoData);
                  echoesChanged = true;
              }
          }
      }

      if (downloadedEchoes.length > 0) {
          const allEchoes = [...localEchoes.filter(le => !downloadedEchoes.find(de => de.id === le.id)), ...downloadedEchoes];
          await db.setAllEchoes(allEchoes);
      }

      if (echoesChanged || echoesMeta.isDirty) {
          await db.putSyncMetadata('echoes', { lastSynced: Date.now(), isDirty: false });
      }

      // --- SYNC METADATA SYNC ---
      let syncMetadataChanged = false;
      // We don't track isDirty for sync_metadata itself to avoid infinite loops,
      // but we upload it if any other file changed.
      if (loreChanged || voicesChanged || echoesChanged || settingsChanged) {
        const allMetadata = await db.getAllSyncMetadata();
        await drive.uploadFile('sync_metadata.json', JSON.stringify(allMetadata), projectFolderId, getFileId('sync_metadata.json'));
        // We don't save the sync state of sync_metadata.json to avoid loops
      } else if (getFileId('sync_metadata.json')) {
        // If nothing changed locally, we can download it if it's newer, but usually we rely on individual file modified times.
        // For completeness, we download it if we are doing a fresh pull.
      }

      setLastSyncTime(Date.now());
      setSyncStatus('Synced');
      setSyncError(null);
      
      // Dispatch event to notify App.tsx to reload data from DB
      if (loreChanged || voicesChanged || echoesChanged || settingsChanged) {
        window.dispatchEvent(new CustomEvent('sync-complete'));
      }
    } catch (error: any) {
      console.error('Sync Error:', error);
      setSyncError(error.message);
      if (error.message.includes('Unauthorized')) {
        logout();
      } else if (error.message.includes('403')) {
        setSyncStatus('API Error (403)');
        // Provide more context if it's a 403
        if (error.message.includes('not been used') || error.message.includes('disabled')) {
          setSyncStatus('Drive API Disabled');
        } else if (error.message.includes('insufficient permissions')) {
          setSyncStatus('Permission Denied');
        }
      } else {
        setSyncStatus('Sync Failed');
      }
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  const forceSync = async () => {
    if (accessToken) {
      await performSync(accessToken, currentProject);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      performSync(accessToken, currentProject);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [accessToken, performSync, currentProject]);

  return (
    <SyncContext.Provider value={{ 
      isAuthenticated: !!accessToken, 
      isSyncing, 
      isConfigured,
      lastSyncTime, 
      login, 
      logout, 
      forceSync, 
      syncStatus,
      syncError,
      projects,
      currentProject,
      switchProject,
      createProject
    }}>
      {children}
    </SyncContext.Provider>
  );
};
