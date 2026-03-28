import React, { useState } from 'react';
import { Mic2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { VoiceAudit } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReportVoiceResonanceProps {
  voiceAudits?: VoiceAudit[];
}

export const ReportVoiceResonance: React.FC<ReportVoiceResonanceProps> = ({ voiceAudits }) => {
  const [activeAuditIndex, setActiveAuditIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const hasAudits = voiceAudits && voiceAudits.length > 0;

  return (
    <div className={`bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-sm overflow-hidden transition-all duration-300 ${hasAudits ? 'border-l-4 border-primary' : 'border-l-4 border-accent-emerald'}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-surface-container-highest/10 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${hasAudits ? 'bg-primary/10 text-primary' : 'bg-accent-emerald/10 text-accent-emerald'}`}>
            <Mic2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface tracking-tight">Voice Resonance Radar</h3>
            <p className="text-[9px] text-on-surface-variant/60 uppercase font-bold">Consistency Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!hasAudits && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded">All Clear</span>
          )}
          <div className="text-on-surface-variant/50">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-outline-variant/5">
              {!hasAudits ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-on-surface-variant/60 italic">No voice dissonance detected. Character consistency remains high.</p>
                </div>
              ) : (
                <div className="flex overflow-x-auto flex-nowrap gap-2 py-4 custom-scrollbar scrollbar-thin snap-x">
                  {voiceAudits.map((audit, index) => {
                    const score = audit.resonanceScore;
                    const isActive = activeAuditIndex === index;
                    let bgColor = 'bg-accent-emerald/5';
                    let textColor = 'text-accent-emerald';
                    let borderColor = 'border-accent-emerald/20';

                    if (score < 60) {
                      bgColor = 'bg-error/5';
                      textColor = 'text-error';
                      borderColor = 'border-error/20';
                    } else if (score < 80) {
                      bgColor = 'bg-accent-amber/5';
                      textColor = 'text-accent-amber';
                      borderColor = 'border-accent-amber/20';
                    }

                    return (
                      <div
                        key={index}
                        onClick={() => setActiveAuditIndex(isActive ? null : index)}
                        className={`group/chip relative flex items-center gap-2 px-3 py-1.5 rounded border shrink-0 snap-start ${borderColor} ${bgColor} ${textColor} transition-all cursor-pointer ${isActive ? 'ring-1 ring-primary/30' : ''}`}
                      >
                        <span className="font-bold text-xs">{audit.characterName}</span>
                        <div className={`w-px h-3 ${textColor === 'text-error' ? 'bg-error/20' : textColor === 'text-accent-amber' ? 'bg-accent-amber/20' : 'bg-accent-emerald/20'}`} />
                        <span className="font-mono text-[10px] font-bold">{score}%</span>
                        
                        {audit.dissonanceReason && isActive && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-surface-container-highest text-on-surface rounded border border-outline-variant/20 text-[11px] z-50 shadow-xl">
                            <div className="flex items-start gap-2">
                              <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                              <p className="leading-relaxed">{audit.dissonanceReason}</p>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-surface-container-highest"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
