import React, { useState } from 'react';
import { HelpCircle, Info, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { RefinedVersion, LoreFraying } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReportLoreFrayingProps {
    loreFraying: RefinedVersion['loreFraying'];
}

export const ReportLoreFraying: React.FC<ReportLoreFrayingProps> = ({ loreFraying }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasFraying = loreFraying && loreFraying.length > 0;

    return (
        <div className={`bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-sm overflow-hidden transition-all duration-300 ${hasFraying ? 'border-l-4 border-accent-amber' : 'border-l-4 border-accent-emerald'}`}>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-container-highest/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${hasFraying ? 'bg-accent-amber/10 text-accent-amber' : 'bg-accent-emerald/10 text-accent-emerald'}`}>
                        <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-on-surface">Lore Fraying {hasFraying ? `(${loreFraying.length})` : ''}</h3>
                        <p className="text-[9px] text-on-surface-variant/60 uppercase font-bold">Continuity Query</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!hasFraying && (
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
                            {!hasFraying ? (
                                <div className="py-4 text-center">
                                    <p className="text-xs text-on-surface-variant/60 italic">No potential lore conflicts detected. Narrative logic is sound.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 mt-4">
                                    {loreFraying.map((fraying, idx) => (
                                        <div key={idx} className="p-3 bg-surface-container-highest/10 rounded border border-outline-variant/10 group">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold text-on-surface italic">"{fraying.snippet}"</span>
                                                    </div>
                                                    <div className="flex flex-col gap-2 mt-2">
                                                        <div className="flex gap-2 bg-accent-amber/5 p-2 rounded border border-accent-amber/10">
                                                            <Info className="w-3 h-3 text-accent-amber/60 shrink-0 mt-0.5" />
                                                            <div className="flex flex-col gap-0.5">
                                                                <p className="text-[9px] text-accent-amber font-bold uppercase tracking-wider">Conflict</p>
                                                                <p className="text-[10px] text-on-surface-variant/80 leading-relaxed">{fraying.conflict}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 bg-surface-container-highest/20 p-2 rounded border border-outline-variant/5">
                                                            <ChevronRight className="w-3 h-3 text-on-surface-variant/30 shrink-0 mt-0.5" />
                                                            <div className="flex flex-col gap-0.5">
                                                                <p className="text-[9px] text-on-surface-variant/60 font-bold uppercase tracking-wider">Suggestion</p>
                                                                <p className="text-[10px] text-on-surface-variant/80 leading-relaxed italic">{fraying.suggestion}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
