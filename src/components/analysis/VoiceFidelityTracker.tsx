import React, { useState } from 'react';
import { Info, AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';
import { ParagraphAnalysis } from '../../types';

interface VoiceFidelityTrackerProps {
  paragraphs?: ParagraphAnalysis[];
}

export const VoiceFidelityTracker: React.FC<VoiceFidelityTrackerProps> = ({ paragraphs = [] }) => {
  const [selectedParagraph, setSelectedParagraph] = useState<ParagraphAnalysis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-headline text-2xl font-light tracking-tight">Voice Fidelity Tracker</h2>
          <p className="text-on-surface-variant text-sm font-label tracking-wide opacity-70 uppercase">AI Preservation Analysis</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-label uppercase tracking-widest text-on-surface-variant/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary shadow-sm shadow-primary/20" />
            <span>High Fidelity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-secondary shadow-sm shadow-secondary/20" />
            <span>Minor Drift</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-error shadow-sm shadow-error/20" />
            <span>Voice Loss</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2 p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 min-h-[200px] content-start">
            {paragraphs.map((p, idx) => {
                const score = p.fidelityScore > 1 ? p.fidelityScore : p.fidelityScore * 100;
                return (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg relative group ${
                      score >= 80 ? 'bg-primary/20 border-primary/30' : 
                      score >= 60 ? 'bg-secondary/20 border-secondary/30' : 
                      'bg-error/20 border-error/30'
                    } border`}
                    onClick={() => {
                      setSelectedParagraph(p);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className={`absolute inset-0 rounded-lg opacity-40 animate-pulse ${
                      score >= 80 ? 'bg-primary' : 
                      score >= 60 ? 'bg-secondary' : 
                      'bg-error'
                    }`} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-on-surface-variant/60">
                      {idx + 1}
                    </span>
                    
                    {/* Tooltip on hover removed in favor of modal */}
                  </div>
                );
            })}
            {paragraphs.length === 0 && (
              <div className="flex flex-col items-center justify-center w-full h-full text-on-surface-variant/40 space-y-2">
                <HelpCircle className="w-8 h-8 opacity-20" />
                <span className="text-xs font-label uppercase tracking-widest">No detailed paragraph analysis available</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 space-y-4">
            <h3 className="text-[10px] uppercase font-label text-on-surface-variant font-bold tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-secondary" />
              Critical Drift Points
            </h3>
            <div className="space-y-3">
              {paragraphs.filter(p => p.fidelityScore < 70).slice(0, 3).map((p, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-error/5 border border-error/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-error uppercase tracking-wider">Para {idx + 1}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant/60">{p.fidelityScore}%</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{p.rationale}</p>
                </div>
              ))}
              {paragraphs.filter(p => p.fidelityScore < 70).length === 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-xs text-on-surface-variant italic">No significant voice drift detected.</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
             <h3 className="text-[10px] uppercase font-label text-primary font-bold tracking-widest">Teaching Note</h3>
             <p className="text-xs text-on-surface-variant leading-relaxed italic">
               "AI often defaults to passive voice or overly descriptive adjectives. Your original voice is more direct and punchy. Watch for these shifts in the red-highlighted paragraphs."
             </p>
          </div>
        </div>
        {/* Modal for detailed analysis */}
        {isModalOpen && selectedParagraph && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full max-w-2xl glass-slab rounded-[2rem] border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
                <div className="space-y-1">
                  <h3 className="font-headline text-2xl font-light flex items-center gap-3">
                    <Info className="text-primary w-6 h-6" />
                    Paragraph Analysis
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-surface-container-highest transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <span className={`text-sm font-bold ${selectedParagraph.fidelityScore >= 0.8 ? 'text-primary' : selectedParagraph.fidelityScore >= 0.6 ? 'text-secondary' : 'text-error'}`}>
                    {(selectedParagraph.fidelityScore * 100).toFixed(0)}% Fidelity
                  </span>
                  <p className="text-on-surface-variant/80 italic">{selectedParagraph.rationale}</p>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">Voice Recovery Suggestion</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{selectedParagraph.voiceRecoverySuggestion}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
