import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, CheckCircle2, Sparkles } from 'lucide-react';
import { RefinedVersion } from '../../types';

interface ReportRestraintLogProps {
    restraintLog: RefinedVersion['restraintLog'];
}

const RestraintLogItem = ({ log, getIconForCategory }: { log: any, getIconForCategory: (cat: string) => React.ReactElement }) => {
    const [isJustificationExpanded, setIsJustificationExpanded] = useState(false);
    return (
        <div className="group p-2 bg-surface-container-highest/10 rounded border border-outline-variant/10 hover:border-accent-sky/20 transition-all">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    {getIconForCategory(log.category)}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/70">{log.category}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent-sky/30 group-hover:bg-accent-sky transition-colors"></div>
            </div>
            <h4 className="text-[11px] font-bold mb-1.5 text-on-surface/90">"{log.target}"</h4>
            <div 
                className={`flex gap-2 bg-surface-container-highest/20 p-1.5 rounded border border-outline-variant/5 cursor-pointer transition-all ${isJustificationExpanded ? 'ring-1 ring-accent-sky/30' : ''}`}
                onClick={() => setIsJustificationExpanded(!isJustificationExpanded)}
            >
                <Info className={`w-3 h-3 shrink-0 mt-0.5 transition-colors ${isJustificationExpanded ? 'text-accent-sky' : 'text-accent-sky/40'}`} />
                <div className="flex-1">
                    <p className={`text-[10px] text-on-surface-variant/80 leading-relaxed italic ${!isJustificationExpanded ? 'line-clamp-1' : ''}`}>
                        {log.justification}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ReportRestraintLog: React.FC<ReportRestraintLogProps> = ({ restraintLog }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasRestraint = restraintLog && restraintLog.length > 0;

    const getIconForCategory = (category: string) => {
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes('lore') || lowerCat.includes('detail') || lowerCat.includes('fact')) {
            return <ShieldCheck className="w-3 h-3 text-blue-500" />;
        }
        if (lowerCat.includes('rhythm') || lowerCat.includes('sensory') || lowerCat.includes('flow') || lowerCat.includes('enhance')) {
            return <Sparkles className="w-3 h-3 text-purple-500" />;
        }
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
    };

    return (
        <div className={`bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-sm overflow-hidden transition-all duration-300 ${hasRestraint ? 'border-l-4 border-accent-sky' : 'border-l-4 border-accent-emerald'}`}>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-container-highest/10 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${hasRestraint ? 'bg-accent-sky/10 text-accent-sky' : 'bg-accent-emerald/10 text-accent-emerald'}`}>
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-on-surface">Preservation Log {hasRestraint ? `(${restraintLog.length})` : ''}</h3>
                        <p className="text-[9px] text-on-surface-variant/60 uppercase font-bold">Respect & Fidelity</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!hasRestraint && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded">All Clear</span>
                    )}
                    <div className="text-on-surface-variant/50">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-outline-variant/5">
                    {!hasRestraint ? (
                        <div className="py-4 text-center">
                            <p className="text-xs text-on-surface-variant/60 italic">No restraint overrides needed. Every element of the draft was preserved.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                            {restraintLog.map((log, idx) => (
                                <RestraintLogItem 
                                    key={idx} 
                                    log={log} 
                                    getIconForCategory={getIconForCategory} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
