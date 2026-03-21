import React from 'react';
import { ChevronDown, TrendingUp, TrendingDown, Minus, Info, Trash2 } from 'lucide-react';
import { ComplianceReport, RefinedVersion } from '../../types';

interface AnalysisHeaderProps {
  chapterName: string;
  onChapterChange: (chapter: string) => void;
  report?: ComplianceReport;
  availableChapters?: string[];
  onDeleteVersion?: (id: string) => void;
  versionHistory?: RefinedVersion[];
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ 
  chapterName, 
  onChapterChange, 
  report,
  availableChapters = ['Current Chapter', 'Chapter 1: The Arrival', 'Chapter 2: Deep Station', 'Entire Manuscript'],
  onDeleteVersion,
  versionHistory
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const metrics = report?.metrics || { loreConsistency: 0, voiceAuthenticity: 0, mythicResonance: 0, structuralCompliance: 0 };
  const trend = report?.trendIndicator || 'stable';
  const summary = report?.narrativeSummary || 'Awaiting analysis...';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1 relative">
          <div className="flex items-center gap-2 text-primary font-label text-[10px] uppercase tracking-[0.3em]">
            <span>Chapter Analysis</span>
            <span className="opacity-30">/</span>
            <span className="text-on-surface-variant">{chapterName}</span>
          </div>
          <div 
            className="flex items-center gap-4 group cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <h1 className="font-headline text-4xl md:text-5xl font-light tracking-tight">
              {chapterName}
            </h1>
            <ChevronDown className={`w-6 h-6 text-on-surface-variant/40 group-hover:text-primary transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 mt-4 w-72 glass-panel bg-surface-container-high/95 border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
              {versionHistory?.map((v) => (
                <div key={v.id} className="flex items-center justify-between hover:bg-primary/10 transition-colors">
                  <button
                    onClick={() => {
                      onChapterChange(v.title || `Version ${versionHistory.indexOf(v) + 1}`);
                      setIsOpen(false);
                    }}
                    className={`flex-grow text-left px-6 py-3 text-xs font-label uppercase tracking-widest ${chapterName === (v.title || `Version ${versionHistory.indexOf(v) + 1}`) ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
                  >
                    {v.title || `Version ${versionHistory.indexOf(v) + 1}`}
                  </button>
                  {onDeleteVersion && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteVersion(v.id);
                      }}
                      className="p-3 text-on-surface-variant/40 hover:text-error transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-8 bg-surface-container-high/50 p-6 rounded-2xl border border-outline-variant/10 backdrop-blur-md">
          <div className="flex items-center gap-6">
            {[
              { label: 'Voice', value: metrics.voiceAuthenticity, id: 'voice' },
              { label: 'Lore', value: metrics.loreConsistency, id: 'lore' },
              { label: 'Mythic', value: metrics.mythicResonance, id: 'mythic' },
              { label: 'Structure', value: metrics.structuralCompliance, id: 'structure' },
            ].map((m) => (
              <div key={m.id} className="text-center space-y-1">
                <span className="block text-[9px] uppercase font-label text-on-surface-variant tracking-widest">{m.label}</span>
                <span className={`block text-xl font-headline font-medium ${m.value >= 80 ? 'text-primary' : m.value >= 60 ? 'text-secondary' : 'text-error'}`}>
                  {m.value}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="w-px h-10 bg-outline-variant/20 mx-2" />
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] uppercase font-label text-on-surface-variant tracking-widest">Trend</span>
            {trend === 'improving' ? (
              <TrendingUp className="w-5 h-5 text-primary" />
            ) : trend === 'drifting' ? (
              <TrendingDown className="w-5 h-5 text-error" />
            ) : (
              <Minus className="w-5 h-5 text-on-surface-variant/40" />
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 bg-primary/5 border-primary/10 rounded-xl flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-label text-primary font-bold tracking-wider">Narrative Snapshot</span>
          <p className="font-headline italic text-lg text-on-surface-variant leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
};
