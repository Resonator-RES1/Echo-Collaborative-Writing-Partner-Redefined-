import React, { useState } from 'react';
import { useSync, Project } from '../contexts/SyncContext';
import { ChevronDown, Plus, Folder } from 'lucide-react';

interface CloudSyncManagerProps {
  showToast: (message: string) => void;
}

export function CloudSyncManager({ showToast }: CloudSyncManagerProps) {
  const { isAuthenticated, isSyncing, isConfigured, lastSyncTime, login, logout, forceSync, syncStatus, syncError, projects, currentProject, switchProject, createProject } = useSync();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      try {
        await createProject(newProjectName.trim());
        setNewProjectName('');
        setIsCreating(false);
        setIsDropdownOpen(false);
        showToast(`Project "${newProjectName.trim()}" created.`);
      } catch (error: any) {
        showToast(`Failed to create project: ${error.message}`);
      }
    }
  };

  const handleSwitchProject = async (project: Project) => {
    try {
      await switchProject(project);
      setIsDropdownOpen(false);
      showToast(`Switched to project "${project.name}".`);
    } catch (error: any) {
      showToast(`Failed to switch project: ${error.message}`);
    }
  };

  const handleForceSync = async () => {
    try {
      await forceSync();
      showToast("Sync completed.");
    } catch (error: any) {
      showToast(`Sync failed: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center gap-3 relative overflow-visible">
      {isAuthenticated ? (
        <>
          {/* ... existing authenticated UI ... */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-full bg-surface-container-highest hover:bg-surface-container-high transition-colors text-xs md:text-sm font-medium shrink-0"
            >
              <Folder className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              <span className="max-w-[70px] md:max-w-[120px] truncate">{currentProject?.name || 'Loading...'}</span>
              <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-on-surface-variant" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-56 md:w-64 bg-surface-container-low rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden z-[100] origin-top-left">
                <div className="p-2 border-b border-outline-variant/20">
                  <h3 className="text-[10px] md:text-xs font-label uppercase tracking-wider text-on-surface-variant px-2 py-1">Your Projects</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => handleSwitchProject(project)}
                      className={`w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-surface-container-highest transition-colors ${currentProject?.id === project.id ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface'}`}
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-outline-variant/20 bg-surface-container-highest/30">
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Name..."
                        className="flex-1 bg-surface-container-highest border border-outline-variant/50 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                      />
                      <button onClick={handleCreateProject} className="text-primary hover:text-primary/80">
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsCreating(true)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs md:text-sm text-primary hover:bg-primary/10 rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      New Project
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${
                syncStatus === 'Synced' ? 'bg-emerald-500' :
                syncStatus === 'Syncing...' ? 'bg-blue-500 animate-pulse' :
                syncStatus === 'Sync Failed' || syncStatus === 'API Error (403)' || syncStatus === 'Drive API Disabled' || syncStatus === 'Permission Denied' ? 'bg-error' :
                'bg-on-surface/40'
              }`} />
              <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-on-surface/60 font-label">
                {syncStatus}
              </span>
            </div>
            {lastSyncTime && (
              <span className="text-[8px] md:text-[9px] text-on-surface/40">
                {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <button 
            onClick={handleForceSync}
            disabled={isSyncing}
            className={`p-1 md:p-1.5 rounded-full bg-surface-container-highest hover:bg-surface-container-high transition-colors shrink-0 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Force Sync"
          >
            <span className={`material-symbols-outlined text-xs md:text-sm ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>
          <button 
            onClick={logout}
            className="p-1 md:p-1.5 rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors shrink-0"
            title="Disconnect Google Drive"
          >
            <span className="material-symbols-outlined text-xs md:text-sm">cloud_off</span>
          </button>
        </>
      ) : (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {syncStatus === 'Missing Client ID' || 
             syncStatus === 'Login Failed' || 
             syncStatus === 'Drive API Disabled' || 
             syncStatus === 'Permission Denied' ? (
              <button 
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="p-1.5 rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors"
                title="Configuration Error"
              >
                <span className="material-symbols-outlined text-sm">warning</span>
              </button>
            ) : null}
            <button 
              onClick={() => login()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-label uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm">cloud_upload</span>
              Connect Drive
            </button>
          </div>
          
          {(showConfigHelp || syncStatus === 'Missing Client ID' || syncStatus === 'Drive API Disabled' || syncStatus === 'Permission Denied') && (
            <div className="absolute top-full mt-2 left-0 w-80 bg-surface-container-low rounded-xl shadow-2xl border border-outline-variant/20 p-4 z-[100] text-xs text-on-surface">
              <h4 className="font-bold mb-2 text-primary uppercase tracking-wider">Google Drive Setup</h4>
              
              {syncStatus === 'Drive API Disabled' ? (
                <div className="space-y-2">
                  <p className="text-error font-medium">Drive API is not enabled in your Google Cloud project.</p>
                  <div className="p-2 bg-error/5 border border-error/10 rounded text-[10px] font-mono break-words mb-2">
                    {syncError}
                  </div>
                  <ol className="list-decimal list-inside space-y-1 opacity-80">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Drive API page</a></li>
                    <li>Ensure your project is selected in the top dropdown</li>
                    <li>Click <b>Enable</b></li>
                    <li>Wait a minute and try connecting again</li>
                  </ol>
                </div>
              ) : syncStatus === 'Permission Denied' ? (
                <div className="space-y-2">
                  <p className="text-error font-medium">Permission Denied.</p>
                  <div className="p-2 bg-error/5 border border-error/10 rounded text-[10px] font-mono break-words mb-2">
                    {syncError}
                  </div>
                  <p className="opacity-80">This usually happens if the folder was created by a different app or if the project has restrictions.</p>
                  <p className="opacity-80">Try creating a new project folder or checking your OAuth consent screen settings.</p>
                </div>
              ) : (
                <>
                  <p className="mb-2 opacity-80">To enable cloud sync, you need to provide a Google Client ID (no secret required):</p>
                  <ol className="list-decimal list-inside space-y-1 opacity-80 mb-3">
                    <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                    <li>Create an <b>OAuth 2.0 Client ID</b> (Web application)</li>
                    <li>Add <b>{window.location.origin}</b> to <b>Authorized JavaScript origins</b></li>
                    <li>Copy the <b>Client ID</b></li>
                    <li>Open <b>Settings</b> (⚙️) in AI Studio</li>
                    <li>Add <b>VITE_GOOGLE_CLIENT_ID</b> with your Client ID</li>
                  </ol>
                </>
              )}
              
              <button 
                onClick={() => setShowConfigHelp(false)}
                className="w-full mt-3 py-1.5 rounded bg-surface-container-highest hover:bg-surface-container-high transition-colors font-medium"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
