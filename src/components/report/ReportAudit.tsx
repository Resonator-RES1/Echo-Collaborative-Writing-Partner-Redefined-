import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { RefinedVersion } from '../../types';

interface ReportAuditProps {
    audit: RefinedVersion['audit'];
}

export const ReportAudit: React.FC<ReportAuditProps> = ({ audit }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!audit) return null;

    return (
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 border-l-4 border-primary shadow-sm overflow-hidden transition-all duration-300">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-container-highest/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-on-surface">Fidelity Audit</h3>
                        <p className="text-[9px] text-on-surface-variant/60 uppercase font-bold">Integrity Check</p>
                    </div>
                </div>
                <div className="text-on-surface-variant/50">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-outline-variant/5">
                    <div className="space-y-4 mt-4">
                        <AuditItem 
                            label="Voice Fidelity" 
                            score={audit.voiceFidelityScore} 
                            reasoning={audit.voiceFidelityReasoning} 
                            primary
                        />
                        <div className="h-px bg-outline-variant/10" />
                        <div className="grid grid-cols-1 gap-4">
                            <AuditItem 
                                label="Lore Compliance" 
                                score={audit.loreCompliance} 
                                reasoning={audit.loreComplianceReasoning} 
                                compact
                            />
                            <AuditItem 
                                label="Voice Adherence" 
                                score={audit.voiceAdherence} 
                                reasoning={audit.voiceAdherenceReasoning} 
                                compact
                            />
                            <AuditItem 
                                label="Focus Alignment" 
                                score={audit.focusAreaAlignment} 
                                reasoning={audit.focusAreaAlignmentReasoning} 
                                compact
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const getStatusLabel = (score: number) => {
    if (score >= 9) return "Crystal Clear";
    if (score >= 7) return "Minor Drift";
    return "Review Required";
};

const getStatusColor = (score: number) => {
    if (score >= 9) return "text-accent-emerald bg-accent-emerald/10";
    if (score >= 7) return "text-accent-amber bg-accent-amber/10";
    return "text-error bg-error/10";
};

const AuditItem: React.FC<{ label: string; score: number; reasoning: string; primary?: boolean; compact?: boolean }> = ({ label, score, reasoning, primary, compact }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div 
            className={`${compact ? "space-y-1.5" : "space-y-2"} cursor-pointer group/audit`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 group-hover/audit:text-primary transition-colors">{label}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getStatusColor(score)}`}>
                        {getStatusLabel(score)}
                    </span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className={`${compact ? 'text-sm' : 'text-base'} font-bold ${primary ? 'text-primary' : 'text-on-surface'}`}>{score}</span>
                    <span className="text-[9px] text-on-surface-variant/30 font-bold">/ 10</span>
                </div>
            </div>
            <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${primary ? 'bg-primary' : 'bg-on-surface-variant/30'}`} 
                    style={{ width: `${score * 10}%` }}
                />
            </div>
            <div className={`flex gap-2 bg-surface-container-highest/10 ${compact ? 'p-2' : 'p-3'} rounded border border-outline-variant/5 transition-all ${isExpanded ? 'ring-1 ring-primary/30 shadow-sm' : ''}`}>
                <Info className={`w-3 h-3 shrink-0 mt-0.5 transition-colors ${isExpanded ? 'text-primary' : 'text-primary/50'}`} />
                <div className="flex-1">
                    <p className={`text-[10px] text-on-surface-variant/80 leading-relaxed italic ${compact && !isExpanded ? 'line-clamp-1' : ''}`}>
                        {reasoning}
                    </p>
                    {compact && reasoning.length > 100 && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-primary mt-1 block opacity-60">
                            {isExpanded ? 'Show Less' : 'Read More'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
