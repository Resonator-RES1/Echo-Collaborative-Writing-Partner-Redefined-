import React, { useState } from 'react';
import { HelpCircle, Info, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { RefinedVersion, LoreFraying } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReportLoreFrayingProps {
    loreFraying: RefinedVersion['loreFraying'];
}

export const ReportLoreFraying: React.FC<ReportLoreFrayingProps> = ({ loreFraying }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!loreFraying || loreFraying.length === 0) return null;

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden transition-all duration-300">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-surface-container-highest/30 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-headline text-xl font-bold text-on-surface">Lore Fraying ({loreFraying.length})</h3>
                        <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Continuity Query</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-on-surface-variant/50" />
                ) : (
                    <ChevronDown className="w-6 h-6 text-on-surface-variant/50" />
                )}
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
                            <div className="space-y-4 mt-6">
                                {loreFraying.map((fraying, idx) => (
                                    <div key={idx} className="p-4 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/10 group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-bold text-on-surface italic">"{fraying.snippet}"</span>
                                                </div>
                                                <div className="flex flex-col gap-3 mt-3">
                                                    <div className="flex gap-2 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                                                        <Info className="w-3.5 h-3.5 text-amber-600/60 shrink-0 mt-0.5" />
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Conflict</p>
                                                            <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">{fraying.conflict}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 bg-surface-container-highest/30 p-3 rounded-xl border border-outline-variant/5">
                                                        <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/30 shrink-0 mt-0.5" />
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-[11px] text-on-surface-variant/60 font-bold uppercase tracking-wider">Suggestion</p>
                                                            <p className="text-[11px] text-on-surface-variant/80 leading-relaxed italic">{fraying.suggestion}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
