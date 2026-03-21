import React, { useState } from 'react';
import { FileText, ArrowRight, Info, Lock, Unlock, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { ComparisonResponse } from '../../types';

interface ChangeRationaleLogProps {
  comparison?: ComparisonResponse;
}

export const ChangeRationaleLog: React.FC<ChangeRationaleLogProps> = ({ comparison }) => {
  const [showOriginal, setShowOriginal] = useState(true);
  const [showPolished, setShowPolished] = useState(true);
  const [activeRationale, setActiveRationale] = useState<number | null>(null);

  const changes = comparison?.changes || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-headline text-2xl font-light tracking-tight">Change & Rationale Log</h2>
          <p className="text-on-surface-variant text-sm font-label tracking-wide opacity-70 uppercase">Deep Polish Audit</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowOriginal(!showOriginal)}
             className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all ${showOriginal ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-low text-on-surface-variant/40 border-outline-variant/10'} border`}
           >
             {showOriginal ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
             Original
           </button>
           <button 
             onClick={() => setShowPolished(!showPolished)}
             className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all ${showPolished ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-surface-container-low text-on-surface-variant/40 border-outline-variant/10'} border`}
           >
             {showPolished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
             Polished
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            {changes.map((change, idx) => (
              <div 
                key={idx} 
                className={`group relative grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-surface-container-low/50 rounded-2xl border transition-all duration-300 ${activeRationale === idx ? 'border-primary/40 shadow-xl shadow-primary/5' : 'border-outline-variant/10 hover:border-outline-variant/30'}`}
                onMouseEnter={() => setActiveRationale(idx)}
                onMouseLeave={() => setActiveRationale(null)}
              >
                {/* Original Text */}
                <div className={`space-y-3 transition-opacity duration-300 ${!showOriginal ? 'opacity-20' : 'opacity-100'}`}>
                  <div className="flex items-center gap-2 text-[9px] uppercase font-label text-on-surface-variant/60 tracking-widest">
                    <FileText className="w-3 h-3" />
                    <span>Original</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed bg-error/5 p-3 rounded-xl border border-error/10 italic">
                    {change.original}
                  </p>
                </div>

                {/* Polished Text */}
                <div className={`space-y-3 transition-opacity duration-300 ${!showPolished ? 'opacity-20' : 'opacity-100'}`}>
                  <div className="flex items-center gap-2 text-[9px] uppercase font-label text-secondary font-bold tracking-widest">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Polished</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed bg-primary/5 p-3 rounded-xl border border-primary/10">
                    {change.polished}
                  </p>
                </div>

                {/* Rationale Overlay/Indicator */}
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`p-2 rounded-full shadow-lg ${change.type === 'voice' ? 'bg-primary text-white' : change.type === 'lore' ? 'bg-secondary text-white' : 'bg-surface-container-high text-on-surface-variant'} border border-white/10`}>
                    {change.type === 'voice' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
            {changes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low/30 rounded-3xl border border-dashed border-outline-variant/20 text-on-surface-variant/40 space-y-4">
                <FileText className="w-12 h-12 opacity-10" />
                <p className="text-xs font-label uppercase tracking-widest">No changes recorded for this session</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 space-y-4">
              <h3 className="text-[10px] uppercase font-label text-on-surface-variant font-bold tracking-widest flex items-center gap-2">
                <Info className="w-3 h-3 text-primary" />
                Rationale Column
              </h3>
              <div className="space-y-4">
                {changes.map((change, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl transition-all duration-300 ${activeRationale === idx ? 'bg-primary/10 border-primary/20 scale-105 shadow-md' : 'bg-surface-container-high/30 border-outline-variant/10 opacity-60'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Change {idx + 1}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-label tracking-tighter ${change.type === 'voice' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                        {change.type}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {change.rationale}
                    </p>
                  </div>
                ))}
                {changes.length === 0 && (
                  <p className="text-xs text-on-surface-variant/40 italic text-center py-10">Select a change block to view rationale</p>
                )}
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
               <h3 className="text-[10px] uppercase font-label text-primary font-bold tracking-widest">Voice Lock Status</h3>
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-primary/10 text-primary">
                   <Lock className="w-4 h-4" />
                 </div>
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-on-surface-variant">Active Protection</p>
                   <p className="text-[10px] text-on-surface-variant/60 leading-relaxed italic">
                     "Echo is currently locking your unique vocabulary choices while suggesting structural improvements."
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
