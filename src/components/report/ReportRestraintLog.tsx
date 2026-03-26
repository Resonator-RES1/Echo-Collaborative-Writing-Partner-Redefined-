import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, CheckCircle2, Sparkles } from 'lucide-react';
import { RefinedVersion } from '../../types';

interface ReportRestraintLogProps {
    restraintLog: RefinedVersion['restraintLog'];
}

export const ReportRestraintLog: React.FC<ReportRestraintLogProps> = ({ restraintLog }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!restraintLog || restraintLog.length === 0) return null;

    const getIconForCategory = (category: string) => {
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes('lore') || lowerCat.includes('detail') || lowerCat.includes('fact')) {
            return <ShieldCheck className="w-4 h-4 text-blue-500" />;
        }
        if (lowerCat.includes('rhythm') || lowerCat.includes('sensory') || lowerCat.includes('flow') || lowerCat.includes('enhance')) {
            return <Sparkles className="w-4 h-4 text-purple-500" />;
        }
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    };

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden transition-all duration-300">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-surface-container-highest/30 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-sky/10 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-accent-sky" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-headline text-xl font-bold text-on-surface">Preservation Log ({restraintLog.length})</h3>
                        <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Respect & Fidelity</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-on-surface-variant/50" />
                ) : (
                    <ChevronDown className="w-6 h-6 text-on-surface-variant/50" />
                )}
            </button>

            {isExpanded && (
                <div className="p-6 pt-0 border-t border-outline-variant/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        {restraintLog.map((log, idx) => {
                            const [isJustificationExpanded, setIsJustificationExpanded] = useState(false);
                            return (
                                <div key={idx} className="group p-4 bg-surface-container-highest/20 rounded-xl border border-outline-variant/5 hover:border-accent-sky/20 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {getIconForCategory(log.category)}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">{log.category}</span>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-accent-sky/30 group-hover:bg-accent-sky transition-colors"></div>
                                    </div>
                                    <h4 className="font-headline text-sm font-bold mb-2 text-on-surface/90">"{log.target}"</h4>
                                    <div 
                                        className={`flex gap-2 bg-surface-container-highest/30 p-2 rounded-lg border border-outline-variant/5 cursor-pointer transition-all ${isJustificationExpanded ? 'ring-1 ring-accent-sky/30 shadow-sm' : ''}`}
                                        onClick={() => setIsJustificationExpanded(!isJustificationExpanded)}
                                    >
                                        <Info className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors ${isJustificationExpanded ? 'text-accent-sky' : 'text-accent-sky/40'}`} />
                                        <div className="flex-1">
                                            <p className={`text-[11px] text-on-surface-variant/80 leading-relaxed italic ${!isJustificationExpanded ? 'line-clamp-2' : ''}`}>
                                                {log.justification}
                                            </p>
                                            {log.justification.length > 80 && (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-accent-sky mt-1 block opacity-60">
                                                    {isJustificationExpanded ? 'Show Less' : 'Read More'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
