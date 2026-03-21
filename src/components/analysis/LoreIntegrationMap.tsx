import React from 'react';
import { Shield, AlertCircle, CheckCircle2, MapPin, Clock, Info } from 'lucide-react';
import { SceneAnalysis } from '../../types';

interface LoreIntegrationMapProps {
  scenes?: SceneAnalysis[];
}

export const LoreIntegrationMap: React.FC<LoreIntegrationMapProps> = ({ scenes = [] }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-headline text-2xl font-light tracking-tight">Lore Integration Map</h2>
          <p className="text-on-surface-variant text-sm font-label tracking-wide opacity-70 uppercase">World-Building Consistency</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-label uppercase tracking-widest text-on-surface-variant/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/20" />
            <span>Consistent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary shadow-sm shadow-secondary/20" />
            <span>Minor Conflict</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error shadow-sm shadow-error/20" />
            <span>Major Conflict</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="relative p-8 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 min-h-[300px] overflow-hidden">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-8 right-8 h-px bg-outline-variant/20 -translate-y-1/2" />
            
            <div className="relative flex justify-between items-center h-full px-4">
              {scenes.map((s, idx) => (
                <div key={idx} className="flex flex-col items-center gap-6 group relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl relative z-10 ${
                    s.loreConsistencyScore >= 80 ? 'bg-primary/20 border-primary/30' : 
                    s.loreConsistencyScore >= 60 ? 'bg-secondary/20 border-secondary/30' : 
                    'bg-error/20 border-error/30'
                  } border`}>
                    <div className={`w-4 h-4 rounded-full animate-pulse ${
                      s.loreConsistencyScore >= 80 ? 'bg-primary' : 
                      s.loreConsistencyScore >= 60 ? 'bg-secondary' : 
                      'bg-error'
                    }`} />
                    
                    {/* Scene Popover on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-72 p-5 glass-panel bg-surface-container-high/95 border-outline-variant/20 rounded-2xl shadow-2xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-bottom border-outline-variant/10 pb-2">
                          <span className="text-[10px] uppercase font-label text-on-surface-variant font-bold tracking-widest">Scene {idx + 1}</span>
                          <span className={`text-xs font-bold ${s.loreConsistencyScore >= 80 ? 'text-primary' : s.loreConsistencyScore >= 60 ? 'text-secondary' : 'text-error'}`}>
                            {s.loreConsistencyScore}% Lore Consistency
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-3 h-3 text-primary mt-1" />
                            <div className="space-y-1">
                              <p className="text-[10px] text-on-surface-variant/60 uppercase font-label tracking-widest">Location</p>
                              <p className="text-xs text-on-surface-variant font-medium">{s.location || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Clock className="w-3 h-3 text-primary mt-1" />
                            <div className="space-y-1">
                              <p className="text-[10px] text-on-surface-variant/60 uppercase font-label tracking-widest">Timeframe</p>
                              <p className="text-xs text-on-surface-variant font-medium">{s.timeframe || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Lore Reinforcement</p>
                            <p className="text-xs text-on-surface-variant leading-relaxed">{s.loreReinforcementSuggestion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Scene {idx + 1}</span>
                    <span className="text-[9px] text-on-surface-variant/60 font-mono italic truncate max-w-[80px]">{s.location || '...'}</span>
                  </div>
                </div>
              ))}
              {scenes.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full h-full text-on-surface-variant/40 space-y-2">
                  <Shield className="w-8 h-8 opacity-20" />
                  <span className="text-xs font-label uppercase tracking-widest">No detailed scene analysis available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 space-y-4">
            <h3 className="text-[10px] uppercase font-label text-on-surface-variant font-bold tracking-widest flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-error" />
              Lore Conflicts
            </h3>
            <div className="space-y-3">
              {scenes.filter(s => s.loreConsistencyScore < 80).map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-error/5 border border-error/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-error uppercase tracking-wider">Scene {idx + 1}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant/60">{s.loreConsistencyScore}%</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{s.conflictDetectionRationale}</p>
                </div>
              ))}
              {scenes.filter(s => s.loreConsistencyScore < 80).length === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-xs text-on-surface-variant italic">Lore is perfectly integrated.</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10 space-y-3">
             <h3 className="text-[10px] uppercase font-label text-secondary font-bold tracking-widest">World-Building Tip</h3>
             <p className="text-xs text-on-surface-variant leading-relaxed italic">
               "Consistency in station technology descriptions is key. If a door is 'pneumatic' in Scene 1, it shouldn't be 'magnetic' in Scene 4 unless specified."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
