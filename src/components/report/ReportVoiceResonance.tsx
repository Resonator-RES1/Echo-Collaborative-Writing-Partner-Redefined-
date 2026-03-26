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
    <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 mb-6 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
      
      <div 
        className="flex items-center justify-between mb-2 relative z-10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
            <Mic2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface tracking-tight">Voice Resonance Radar</h3>
            <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Consistency Analytics</p>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden -mx-6 px-6"
          >
            <div className="flex overflow-x-auto flex-nowrap gap-3 relative z-10 pb-4 custom-scrollbar scrollbar-thin snap-x">
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
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
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
            </motion.div>
          );
        })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
