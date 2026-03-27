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
        <div className="p-4 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/10 group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-on-surface-variant/50 line-through">{correction.original}</span>
                        <ChevronRight className="w-3 h-3 text-on-surface-variant/30" />
                        <span className="text-sm font-bold text-on-surface">{correction.refined}</span>
                    </div>
                    <div 
                        className={`flex gap-2 bg-surface-container-highest/30 p-2 rounded-lg border border-outline-variant/5 mt-2 cursor-pointer transition-all ${isReasonExpanded ? 'ring-1 ring-accent-rose/30 shadow-sm' : ''}`}
                        onClick={() => setIsReasonExpanded(!isReasonExpanded)}
                    >
                        <Info className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors ${isReasonExpanded ? 'text-accent-rose' : 'text-accent-rose/40'}`} />
                        <div className="flex-1">
                            <p className={`text-[11px] text-on-surface-variant/80 leading-relaxed italic ${!isReasonExpanded ? 'line-clamp-2' : ''}`}>
                                {correction.reason}
                            </p>
                            {correction.reason.length > 80 && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-accent-rose mt-1 block opacity-60">
                                    {isReasonExpanded ? 'Show Less' : 'Read More'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {onRevertSpecificLore && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onRevertSpecificLore(correction);
                        }}
                        className="px-4 py-2 bg-accent-rose/10 text-accent-rose text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-accent-rose hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        Revert
                    </button>
                )}
            </div>
        </div>
    );
};

export const ReportLoreCorrections: React.FC<ReportLoreCorrectionsProps> = ({ loreCorrections, onRevertSpecificLore }) => {
    if (!loreCorrections || loreCorrections.length === 0) return null;

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-rose/10 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-accent-rose" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-headline text-xl font-bold text-on-surface">Lore Corrections ({loreCorrections.length})</h3>
                        <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Continuity Enforcement</p>
                    </div>
                </div>
            </div>

            <div className="p-6 pt-0 border-t border-outline-variant/5">
                <div className="space-y-4 mt-6">
                    {loreCorrections.map((correction, idx) => (
                        <LoreCorrectionItem 
                            key={idx} 
                            correction={correction} 
                            onRevertSpecificLore={onRevertSpecificLore} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
