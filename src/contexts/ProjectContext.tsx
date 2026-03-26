import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as db from '../services/dbService';
import { projectService } from '../services/projectService';

export interface Project {
  id: string;
  name: string;
}

interface ProjectContextType {
  projectName: string;
  setProjectName: (name: string) => void;
  exportProject: () => Promise<void>;
  importProject: (file: File) => Promise<void>;
  resetProject: () => Promise<void>;
  isImporting: boolean;
  importError: string | null;
  isZenMode: boolean;
  setIsZenMode: (isZenMode: boolean) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectName, setProjectNameState] = useState<string>('Untitled Project');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);

  // Load project name from IndexedDB on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const savedName = await db.getSetting('project_name');
      if (savedName) {
        setProjectNameState(savedName);
      }
    };
    loadInitialData();
  }, []);

  const setProjectName = useCallback(async (name: string) => {
    setProjectNameState(name);
    await db.putSetting('project_name', name);
  }, []);

  const exportProject = async () => {
    try {
      await projectService.exportProject(projectName);
    } catch (error: any) {
      console.error('Export Error:', error);
    }
  };

  const importProject = async (file: File) => {
    setIsImporting(true);
    setImportError(null);
    try {
      const data = await projectService.importProject(file);
      setProjectNameState(data.name);
      await db.putSetting('project_name', data.name);
      
      // Notify App.tsx to reload data from DB
      window.dispatchEvent(new CustomEvent('sync-complete')); // Re-using existing event for simplicity
    } catch (error: any) {
      console.error('Import Error:', error);
      setImportError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const resetProject = async () => {
    try {
      await projectService.resetProject();
      setProjectNameState('Untitled Project');
      window.dispatchEvent(new CustomEvent('sync-complete'));
    } catch (error: any) {
      console.error('Reset Error:', error);
    }
  };

  return (
    <ProjectContext.Provider value={{ 
      projectName,
      setProjectName,
      exportProject,
      importProject,
      resetProject,
      isImporting,
      importError,
      isZenMode,
      setIsZenMode
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
