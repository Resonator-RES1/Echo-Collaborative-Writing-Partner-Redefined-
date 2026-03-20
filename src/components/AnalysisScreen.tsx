import React, { useRef } from 'react';
import { BarChart3, Minus, Sparkles, BookOpen, Mic2, History, Download, Upload, Trash2, FileText } from 'lucide-react';
import { LoreEntry, VoiceProfile, RefinedVersion, Screen } from '../types';

interface AnalysisScreenProps {
  setCurrentScreen: (screen: Screen) => void;
  loreEntries: LoreEntry[];
  voiceProfiles: VoiceProfile[];
  versionHistory: RefinedVersion[];
  onDeleteVersion: (id: string) => void;
  onImportVersions: (versions: RefinedVersion[]) => void;
}

export function AnalysisScreen({ 
  setCurrentScreen, 
  loreEntries, 
  voiceProfiles, 
  versionHistory,
  onDeleteVersion,
  onImportVersions
}: AnalysisScreenProps) {
  const hasData = versionHistory.length > 0;
  const latestVersion = hasData ? versionHistory[versionHistory.length - 1] : null;
  const report = latestVersion?.report;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate some dummy metrics based on data presence
  const loreScore = loreEntries.length > 0 ? (report && typeof report !== 'string' && report.metrics?.loreConsistency ? report.metrics.loreConsistency : 65) : 0;
  const voiceScore = voiceProfiles.length > 0 ? (report && typeof report !== 'string' && report.metrics?.voiceAuthenticity ? report.metrics.voiceAuthenticity : 60) : 0;
  const resonanceScore = hasData ? (report && typeof report !== 'string' && report.metrics?.mythicResonance ? report.metrics.mythicResonance : 55) : 0;
  const structuralScore = hasData ? (report && typeof report !== 'string' && report.metrics?.structuralCompliance ? report.metrics.structuralCompliance : 50) : 0;

  const averageScore = hasData ? Math.round((loreScore + voiceScore + resonanceScore + structuralScore) / 4) : 0;

  const handleExport = () => {
    const dataStr = JSON.stringify(versionHistory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'echo-polish-history.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

  return (
    <div className="space-y-12 animate-in fade-in duration-700 relative">
      {/* Visual Textures */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-surface-container-highest/20 blur-[100px] rounded-full"></div>
      </div>

      {/* Header Section & Verdict */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-outline-variant/10 pb-12">
        <div className="space-y-4 max-w-2xl">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs">Final Polish Report</span>
          <h1 className="font-headline text-5xl md:text-7xl font-light tracking-tight">Analysis</h1>
          <div className="flex items-center gap-4">
            <p className="font-headline italic text-2xl text-on-surface-variant/80">
              {hasData ? `"The grit remains, the rhythm flows."` : `"Awaiting the first echo..."`}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExport}
                className="p-2 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all"
                title="Export History"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all"
                title="Import History"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </div>
        </div>
        
        <div className="glass-panel bg-surface-container-high rounded-[0.75rem] px-8 py-10 flex flex-col items-center justify-center text-center w-56 h-56 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">Consistency Score</span>
          <span className={`font-headline text-6xl font-bold ${hasData ? 'text-primary' : 'text-primary/20'}`}>
            {hasData ? averageScore : '---'}
          </span>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant/30">
            {hasData ? (
              <Sparkles className="w-4 h-4 text-primary" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span className="font-label text-[10px]">{hasData ? 'Refined' : 'No Data'}</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Analysis Empty State or Selection */}
        <div className="lg:col-span-8 space-y-8">
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
            <div className="space-y-8">
              <div className="glass-slab p-8 rounded-[0.75rem] border border-outline-variant/10 space-y-6">
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Latest Polish Insights</h3>
                {report && typeof report !== 'string' ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10">
                      <span className="block text-[10px] uppercase font-label text-on-surface-variant mb-2">Lore Consistency</span>
                      <div className={`text-sm font-medium ${report.metrics?.loreConsistency >= 80 ? 'text-primary' : 'text-error'}`}>
                        {report.metrics?.loreConsistency || 0}%
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-2 leading-tight">{report.audit?.lore?.[0] || 'Lore audit pending.'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10">
                      <span className="block text-[10px] uppercase font-label text-on-surface-variant mb-2">Voice Authenticity</span>
                      <div className={`text-sm font-medium ${report.metrics?.voiceAuthenticity >= 80 ? 'text-primary' : 'text-error'}`}>
                        {report.metrics?.voiceAuthenticity || 0}%
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-2 leading-tight">{report.audit?.voice?.[0] || 'Voice audit pending.'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10">
                      <span className="block text-[10px] uppercase font-label text-on-surface-variant mb-2">Mythic Resonance</span>
                      <div className={`text-sm font-medium ${report.metrics?.mythicResonance >= 80 ? 'text-primary' : 'text-error'}`}>
                        {report.metrics?.mythicResonance || 0}%
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-2 leading-tight">{report.audit?.thematic?.[0] || 'Thematic audit pending.'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10">
                      <span className="block text-[10px] uppercase font-label text-on-surface-variant mb-2">Structural Compliance</span>
                      <div className={`text-sm font-medium ${report.metrics?.structuralCompliance >= 80 ? 'text-primary' : 'text-error'}`}>
                        {report.metrics?.structuralCompliance || 0}%
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-2 leading-tight">{report.audit?.structure?.[0] || 'Structural audit pending.'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">No detailed report available for the latest version.</p>
                )}
                {report && typeof report !== 'string' && report.thematicNote && (
                  <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
                    <span className="block text-[10px] uppercase font-label text-primary mb-2">Thematic Note</span>
                    <p className="font-headline italic text-lg text-on-surface-variant">{report.thematicNote}</p>
                  </div>
                )}
              </div>

              {/* Echo History List */}
              <div className="space-y-6">
                <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Echo History (Refinement Archives)</h3>
                <div className="space-y-4">
                  {[...versionHistory].reverse().map((version, index) => (
                    <div key={`${version.id}-${index}`} className="glass-slab p-6 rounded-xl border border-outline-variant/10 group hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                            <FileText className="w-5 h-5 text-on-surface-variant/60" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-label text-[10px] uppercase tracking-widest text-primary">{version.mode || 'Refinement'}</span>
                              <span className="text-[10px] text-on-surface-variant/40">•</span>
                              <span className="text-[10px] text-on-surface-variant/60">{new Date(version.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-on-surface line-clamp-1 mt-1 font-body italic opacity-80">
                              "{version.text.substring(0, 100)}..."
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => onDeleteVersion(version.id)}
                          className="p-2 rounded-full hover:bg-error/10 text-on-surface-variant/40 hover:text-error transition-all"
                          title="Delete Echo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-slab p-8 rounded-[0.75rem] border border-outline-variant/10 space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h4 className="font-label text-xs uppercase tracking-widest">Codex Coverage</h4>
              </div>
              <div className="text-3xl font-headline font-light">{loreEntries.length} <span className="text-sm text-on-surface-variant">Entries</span></div>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">Your lore codex provides the grounding for narrative consistency.</p>
            </div>
            <div className="glass-slab p-8 rounded-[0.75rem] border border-outline-variant/10 space-y-4">
              <div className="flex items-center gap-3">
                <Mic2 className="w-5 h-5 text-primary" />
                <h4 className="font-label text-xs uppercase tracking-widest">Voice Library</h4>
              </div>
              <div className="text-3xl font-headline font-light">{voiceProfiles.length} <span className="text-sm text-on-surface-variant">Profiles</span></div>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">Established voice patterns ensure character authenticity across chapters.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Global Metrics */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-slab p-8 rounded-[0.75rem] border border-outline-variant/10 space-y-6">
            <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Polish Metrics</h3>
            
            <div className="space-y-6">
              {[
                { label: 'Lore Consistency', value: `${loreScore}%`, color: 'bg-primary' },
                { label: 'Voice Authenticity', value: `${voiceScore}%`, color: 'bg-secondary' },
                { label: 'Mythic Resonance', value: `${resonanceScore}%`, color: 'bg-tertiary' },
                { label: 'Structural Compliance', value: `${structuralScore}%`, color: 'bg-primary/60' }
              ].map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-body text-xs text-on-surface-variant">{stat.label}</span>
                    <span className="font-label text-[10px] text-primary">{stat.value}</span>
                  </div>
                  <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: stat.value }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 rounded-[0.75rem] p-8 border border-primary/10 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Sparkles className="w-20 h-20 text-primary" />
            </div>
            <h4 className="font-headline text-xl mb-2">Final Report</h4>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-6">
              Export your final polished chapter along with a consistency report for your records.
            </p>
            <button className={`w-full py-3 rounded-full border border-primary/30 text-primary font-label text-[10px] uppercase tracking-widest transition-all duration-500 ${hasData ? 'hover:bg-primary hover:text-on-primary' : 'opacity-50 cursor-not-allowed'}`}>
              {hasData ? 'Export Report' : 'Locked'}
            </button>
          </div>

          {hasData && (
            <div className="glass-slab p-8 rounded-[0.75rem] border border-outline-variant/10 space-y-4">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-primary" />
                <h4 className="font-label text-xs uppercase tracking-widest">Polish History</h4>
              </div>
              <div className="text-2xl font-headline font-light">{versionHistory.length} <span className="text-sm text-on-surface-variant">Echoes</span></div>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">Total refinements made in this session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
