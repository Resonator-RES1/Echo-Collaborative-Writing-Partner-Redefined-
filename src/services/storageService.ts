import { ComplianceReport, ComparisonResponse } from '../types';

interface StoredProject {
  id: string;
  name: string;
  chapters: {
    [chapterId: string]: {
      name: string;
      content: string;
      analysis?: ComplianceReport;
      comparison?: ComparisonResponse;
      lastUpdated: string;
    }
  };
  lastUpdated: string;
}

const STORAGE_KEY = 'echo_projects_v2';

export const storageService = {
  getProjects: (): StoredProject[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveProject: (project: StoredProject) => {
    const projects = storageService.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = { ...project, lastUpdated: new Date().toISOString() };
    } else {
      projects.push({ ...project, lastUpdated: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  },

  getProject: (id: string): StoredProject | undefined => {
    return storageService.getProjects().find(p => p.id === id);
  },

  saveChapterAnalysis: (projectId: string, chapterId: string, analysis: ComplianceReport, comparison: ComparisonResponse) => {
    const project = storageService.getProject(projectId);
    if (project) {
      if (!project.chapters[chapterId]) {
        project.chapters[chapterId] = {
          name: `Chapter ${chapterId}`,
          content: '',
          lastUpdated: new Date().toISOString()
        };
      }
      project.chapters[chapterId].analysis = analysis;
      project.chapters[chapterId].comparison = comparison;
      project.chapters[chapterId].lastUpdated = new Date().toISOString();
      storageService.saveProject(project);
    }
  },

  getChapterAnalysis: (projectId: string, chapterId: string) => {
    const project = storageService.getProject(projectId);
    return project?.chapters[chapterId];
  },

  exportReport: (projectId: string, chapterId: string, format: 'json' | 'pdf') => {
    const data = storageService.getChapterAnalysis(projectId, chapterId);
    if (!data) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `echo_report_${projectId}_${chapterId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // PDF export would normally use a library like jsPDF
      console.log('PDF export requested for', projectId, chapterId);
      alert('PDF Export is simulated. In a production app, this would generate a PDF via jsPDF or similar.');
    }
  }
};
