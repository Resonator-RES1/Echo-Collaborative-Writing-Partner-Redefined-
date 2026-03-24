import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { RefinedVersion } from '../../types';

interface ReportAuditProps {
    audit: RefinedVersion['audit'];
}

export const ReportAudit: React.FC<ReportAuditProps> = ({ audit }) => {
    if (!audit) return null;

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">Fidelity Audit</h3>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Integrity Check</p>
                </div>
            </div>

            <div className="space-y-6">
                <AuditItem 
                    label="Voice Fidelity" 
                    score={audit.voiceFidelityScore} 
                    reasoning={audit.voiceFidelityReasoning} 
                    primary
                />
                <div className="h-px bg-outline-variant/10" />
                <div className="grid grid-cols-1 gap-6">
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
    );
};

const AuditItem: React.FC<{ label: string; score: number; reasoning: string; primary?: boolean; compact?: boolean }> = ({ label, score, reasoning, primary, compact }) => (
    <div className={compact ? "space-y-2" : "space-y-3"}>
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className={`${compact ? 'text-xl' : 'text-2xl'} font-headline font-black ${primary ? 'text-primary' : 'text-on-surface'}`}>{score}</span>
                <span className="text-[10px] text-on-surface-variant/30 font-bold">/ 10</span>
            </div>
        </div>
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-1000 ${primary ? 'bg-primary' : 'bg-on-surface-variant/30'}`} 
                style={{ width: `${score * 10}%` }}
            />
        </div>
        <div className={`flex gap-3 bg-surface-container-highest/30 ${compact ? 'p-3' : 'p-4'} rounded-xl border border-outline-variant/5`}>
            <Info className="w-4 h-4 text-primary/50 shrink-0 mt-0.5" />
            <p className={`text-[11px] text-on-surface-variant/80 leading-relaxed italic ${compact ? 'line-clamp-2' : ''}`}>{reasoning}</p>
        </div>
    </div>
);
