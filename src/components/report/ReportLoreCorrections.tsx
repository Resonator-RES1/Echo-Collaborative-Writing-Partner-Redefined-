import React, { useState } from 'react';
import { ShieldAlert, Info, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { RefinedVersion, LoreCorrection } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReportLoreCorrectionsProps {
    loreCorrections: RefinedVersion['loreCorrections'];
    onRevertSpecificLore?: (correction: LoreCorrection) => void;
}

const LoreCorrectionItem = ({ correction, onRevertSpecificLore }: { correction: LoreCorrection, onRevertSpecificLore?: (correction: LoreCorrection) => void }) => {
    const [isReasonExpanded, setIsReasonExpanded] = useState(false);
    return (
        <div className="p-3 bg-surface-container-highest/10 rounded border border-outline-variant/10 group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-on-surface-variant/50 line-through">{correction.original}</span>
                        <ChevronRight className="w-3 h-3 text-on-surface-variant/30" />
                        <span className="text-xs font-bold text-on-surface">{correction.refined}</span>
                    </div>
                    <div 
                        className={`flex gap-2 bg-surface-container-highest/20 p-2 rounded border border-outline-variant/5 cursor-pointer transition-all ${isReasonExpanded ? 'ring-1 ring-accent-rose/30' : ''}`}
                        onClick={() => setIsReasonExpanded(!isReasonExpanded)}
                    >
                        <Info className={`w-3 h-3 shrink-0 mt-0.5 transition-colors ${isReasonExpanded ? 'text-accent-rose' : 'text-accent-rose/40'}`} />
                        <div className="flex-1">
                            <p className={`text-[10px] text-on-surface-variant/80 leading-relaxed italic ${!isReasonExpanded ? 'line-clamp-1' : ''}`}>
                                {correction.reason}
                            </p>
                        </div>
                    </div>
                </div>
                {onRevertSpecificLore && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onRevertSpecificLore(correction);
                        }}
                        className="px-3 py-1 bg-accent-rose/10 text-accent-rose text-[9px] font-bold uppercase tracking-widest rounded border border-accent-rose/20 hover:bg-accent-rose hover:text-white transition-all active:scale-95"
                    >
                        Revert
                    </button>
                )}
            </div>
        </div>
    );
};

export const ReportLoreCorrections: React.FC<ReportLoreCorrectionsProps> = ({ loreCorrections, onRevertSpecificLore }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasCorrections = loreCorrections && loreCorrections.length > 0;

    return (
        <div className={`bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-sm overflow-hidden transition-all duration-300 ${hasCorrections ? 'border-l-4 border-accent-rose' : 'border-l-4 border-accent-emerald'}`}>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-container-highest/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${hasCorrections ? 'bg-accent-rose/10 text-accent-rose' : 'bg-accent-emerald/10 text-accent-emerald'}`}>
                        <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-on-surface">Lore Corrections {hasCorrections ? `(${loreCorrections.length})` : ''}</h3>
                        <p className="text-[9px] text-on-surface-variant/60 uppercase font-bold">Continuity Enforcement</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!hasCorrections && (
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
                            {!hasCorrections ? (
                                <div className="py-4 text-center">
                                    <p className="text-xs text-on-surface-variant/60 italic">No lore contradictions found. Continuity is intact.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 mt-4">
                                    {loreCorrections.map((correction, idx) => (
                                        <LoreCorrectionItem 
                                            key={idx} 
                                            correction={correction} 
                                            onRevertSpecificLore={onRevertSpecificLore} 
                                        />
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
