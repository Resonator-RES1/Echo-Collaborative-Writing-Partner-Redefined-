import React, { useRef, useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  BookOpen, 
  Mic2, 
  History, 
  Download, 
  Upload, 
  Trash2, 
  FileText,
  Layout,
  GraduationCap,
  Layers,
  Save,
  Cloud,
  ChevronRight
} from 'lucide-react';
import { LoreEntry, VoiceProfile, RefinedVersion, Screen, ComplianceReport } from '../types';
import { AnalysisHeader } from './analysis/AnalysisHeader';
import { VoiceFidelityTracker } from './analysis/VoiceFidelityTracker';
import { LoreIntegrationMap } from './analysis/LoreIntegrationMap';
import { ResonanceStructuralAnalysis } from './analysis/ResonanceStructuralAnalysis';
import { ChangeRationaleLog } from './analysis/ChangeRationaleLog';
import { InteractiveRecommendations } from './analysis/InteractiveRecommendations';
import { storageService } from '../services/storageService';

interface AnalysisScreenProps {
  setCurrentScreen: (screen: Screen) => void;
  loreEntries: LoreEntry[];
  voiceProfiles: VoiceProfile[];
  versionHistory: RefinedVersion[];
  onDeleteVersion: (id: string) => void;
  onImportVersions: (versions: RefinedVersion[]) => void;
  onApplySuggestion: (fix: string) => void;
}

export function AnalysisScreen({ 
  setCurrentScreen, 
  loreEntries, 
  voiceProfiles, 
  versionHistory,
  onDeleteVersion,
  onImportVersions,
  onApplySuggestion
}: AnalysisScreenProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'voice' | 'lore' | 'structure' | 'changes'>('overview');
  const [teachingMode, setTeachingMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState('Current Chapter');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  
  const hasData = versionHistory.length > 0;
  
  // Use selected version or fallback to latest
  const currentVersion = selectedVersionId 
    ? versionHistory.find(v => v.id === selectedVersionId) || (hasData ? versionHistory[versionHistory.length - 1] : null)
    : (hasData ? versionHistory[versionHistory.length - 1] : null);

  let report: ComplianceReport | undefined;
  if (typeof currentVersion?.report === 'string') {
      try {
          report = JSON.parse(currentVersion.report);
      } catch (e) {
          console.error("Failed to parse report:", e);
      }
  } else {
      report = currentVersion?.report as ComplianceReport | undefined;
  }

  const availableChapters = versionHistory.map((v) => v.title || `Version ${versionHistory.indexOf(v) + 1}`);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-sync simulation
  useEffect(() => {
    if (hasData && currentVersion) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        setIsSyncing(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentVersion, hasData]);

  const handleExport = () => {
    if (currentVersion?.id) {
      storageService.exportReport('current-project', currentVersion.id, 'json');
    } else {
      const dataStr = JSON.stringify(versionHistory, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'echo-polish-history.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const versions = JSON.parse(content);
        if (Array.isArray(versions)) {
          onImportVersions(versions);
        }
      } catch (error) {
        console.error("Failed to import polish history:", error);
      }
    };
    reader.readAsText(file);
  };

  const getScaledMetric = (value: number) => {
    return value <= 1 ? Math.round(value * 100) : Math.round(value);
  };

  const scaledReport = report ? {
    ...report,
    metrics: {
      loreConsistency: getScaledMetric(report.metrics.loreConsistency),
      voiceAuthenticity: getScaledMetric(report.metrics.voiceAuthenticity),
      mythicResonance: getScaledMetric(report.metrics.mythicResonance),
      structuralCompliance: getScaledMetric(report.metrics.structuralCompliance),
    }
  } : undefined;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 relative pb-24">
      {/* Visual Textures */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-surface-container-highest/20 blur-[100px] rounded-full"></div>
      </div>

      {/* Top Navigation & Controls */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 -mx-4 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all ${viewMode === 'overview' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setViewMode('voice')}
            className={`px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all ${viewMode === 'voice' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Voice
          </button>
          <button 
            onClick={() => setViewMode('lore')}
            className={`px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all ${viewMode === 'lore' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Lore
          </button>
          <button 
            onClick={() => setViewMode('structure')}
            className={`px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all ${viewMode === 'structure' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Structure
          </button>
          <button 
            onClick={() => setViewMode('changes')}
            className={`px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all ${viewMode === 'changes' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Changes
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/10">
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-secondary animate-pulse' : 'bg-primary'}`} />
            <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
              {isSyncing ? 'Syncing to Drive...' : 'Cloud Synced'}
            </span>
          </div>
          
          <button 
            onClick={() => setTeachingMode(!teachingMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all border ${teachingMode ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-surface-container-high text-on-surface-variant/40 border-outline-variant/10'}`}
          >
            <GraduationCap className="w-3 h-3" />
            Teaching Mode
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 glass-slab rounded-[0.75rem] border border-outline-variant/10">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center relative">
            <BarChart3 className="w-12 h-12 text-primary/40" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
          </div>
          <div className="space-y-3">
            <h3 className="font-headline text-3xl font-light">Awaiting Polish</h3>
            <p className="font-body text-on-surface-variant max-w-sm mx-auto text-sm leading-relaxed">
              Refine your chapter in the Workspace to generate a deep analysis against your Lore Codex and Voice Profiles.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setCurrentScreen('workspace')}
              className="px-10 py-4 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-widest hover:bg-primary/90 transition-all duration-500"
            >
              Go to Workspace
            </button>
            <button 
              onClick={() => setCurrentScreen('lore')}
              className="px-10 py-4 rounded-full bg-surface-container-highest text-primary font-label text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-500"
            >
              Review Lore Codex
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Header & Overview */}
          <AnalysisHeader 
            chapterName={selectedChapter} 
            onChapterChange={setSelectedChapter}
            report={scaledReport}
            availableChapters={availableChapters}
            onDeleteVersion={onDeleteVersion}
            versionHistory={versionHistory}
          />

          {/* Dynamic Content based on ViewMode */}
          <div className="space-y-16">
            {(viewMode === 'overview' || viewMode === 'voice') && (
              <VoiceFidelityTracker paragraphs={scaledReport?.paragraphHeatmap} />
            )}

            {(viewMode === 'overview' || viewMode === 'lore') && (
              <LoreIntegrationMap scenes={scaledReport?.sceneTimeline} />
            )}

            {(viewMode === 'overview' || viewMode === 'structure') && (
              <ResonanceStructuralAnalysis report={scaledReport} />
            )}

            {(viewMode === 'overview' || viewMode === 'changes') && (
              <ChangeRationaleLog comparison={currentVersion?.comparison} />
            )}

            {viewMode === 'overview' && (
              <InteractiveRecommendations 
                recommendations={scaledReport?.recommendations} 
                onApply={onApplySuggestion}
              />
            )}
          </div>

          {/* Teaching Mode Overlay (if active) */}
          {teachingMode && (
            <div className="fixed inset-x-0 bottom-8 z-50 flex justify-center px-4 animate-in slide-in-from-bottom-8 duration-500">
              <div className="max-w-4xl w-full p-6 glass-panel bg-secondary/95 text-white border-white/20 rounded-2xl shadow-2xl flex items-start gap-6">
                <div className="p-3 rounded-xl bg-white/10">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="font-headline text-lg font-bold">Echo Teaching Assistant</h4>
                  <p className="text-sm opacity-90 leading-relaxed italic">
                    {report?.thematicNote || report?.narrativeSummary || "I'm analyzing your draft to provide educational insights. Refine your text to see specific teaching notes here."}
                  </p>
                </div>
                <button 
                  onClick={() => setTeachingMode(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Footer & Export Section */}
          <section className="pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-label text-on-surface-variant/60 tracking-widest">Last Polish</span>
                <span className="text-sm font-medium text-on-surface">{new Date(currentVersion?.timestamp || '').toLocaleString()}</span>
              </div>
              <div className="w-px h-8 bg-outline-variant/20" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-label text-on-surface-variant/60 tracking-widest">Version</span>
                <span className="text-sm font-medium text-on-surface">v{versionHistory.length}.0</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Download className="w-4 h-4" />
                Export Full Report
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-surface-container-highest text-primary font-label text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
              >
                <Upload className="w-4 h-4" />
                Import History
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </section>

          {/* History Archive */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Refinement Archives</h3>
              <span className="text-[10px] text-on-surface-variant/40 font-mono">{versionHistory.length} Echoes Stored</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...versionHistory].reverse().map((version, index) => (
                <div key={`${version.id}-${index}`} className="glass-slab p-6 rounded-2xl border border-outline-variant/10 group hover:border-primary/20 transition-all hover:shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                        <FileText className="w-4 h-4 text-on-surface-variant/60" />
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-label text-primary font-bold tracking-widest">{version.mode || 'Refinement'}</span>
                        <span className="block text-[9px] text-on-surface-variant/40">{new Date(version.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteVersion(version.id)}
                      className="p-2 rounded-full hover:bg-error/10 text-on-surface-variant/40 hover:text-error transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-on-surface line-clamp-2 font-body italic opacity-70 mb-4">
                    "{version.text.substring(0, 100)}..."
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedVersionId(version.id);
                      setViewMode('overview');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full py-2 rounded-lg text-[10px] font-label uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                      currentVersion?.id === version.id 
                        ? 'bg-primary text-on-primary' 
                        : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {currentVersion?.id === version.id ? 'Viewing Analysis' : 'Recall Analysis'}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
