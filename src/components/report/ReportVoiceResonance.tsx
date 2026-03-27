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

  if (!voiceAudits || voiceAudits.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden transition-all duration-300 mb-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-surface-container-highest/30 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
            <Mic2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface tracking-tight">Voice Resonance Radar</h3>
            <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Consistency Analytics</p>
          </div>
        </div>
        <div className="p-2 rounded-full bg-surface-container-highest/50 text-on-surface-variant">
          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-outline-variant/5">
              <div className="flex overflow-x-auto flex-nowrap gap-3 relative z-10 py-6 custom-scrollbar scrollbar-thin snap-x">
                {voiceAudits.map((audit, index) => {
                  const score = audit.resonanceScore;
                  const isActive = activeAuditIndex === index;
                  let bgColor = 'bg-accent-emerald/10';
                  let textColor = 'text-accent-emerald';
                  let borderColor = 'border-accent-emerald/20';

                  if (score < 60) {
                    bgColor = 'bg-error/10';
                    textColor = 'text-error';
                    borderColor = 'border-error/20';
                  } else if (score < 80) {
                    bgColor = 'bg-accent-amber/10';
                    textColor = 'text-accent-amber';
                    borderColor = 'border-accent-amber/20';
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => setActiveAuditIndex(isActive ? null : index)}
                      className={`group/chip relative flex items-center gap-2 px-4 py-2 rounded-full border shrink-0 snap-start ${borderColor} ${bgColor} ${textColor} transition-all hover:shadow-md cursor-pointer ${isActive ? 'ring-2 ring-primary/30 shadow-lg' : ''}`}
                    >
                      <span className="font-headline font-bold text-sm">{audit.characterName}</span>
                      <div className={`w-px h-3 ${textColor === 'text-error' ? 'bg-error/30' : textColor === 'text-accent-amber' ? 'bg-accent-amber/30' : 'bg-accent-emerald/30'}`} />
                      <span className="font-mono text-xs font-bold">{score}%</span>
                      
                      {audit.dissonanceReason && isActive && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-surface-container-highest text-on-surface rounded-xl shadow-xl border border-outline-variant/20 text-xs z-50 animate-in fade-in zoom-in-95 duration-200">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
