import React from 'react';
import { CheckCircle, AlertCircle, Info, Zap, Mic2, ShieldCheck, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ComplianceReport } from '../../types';

interface ComplianceReportViewProps {
    report: ComplianceReport | string;
}

export const ComplianceReportView: React.FC<ComplianceReportViewProps> = React.memo(({ report }) => {
    if (!report) return null;

    if (typeof report === 'string') {
        return (
            <div className="bg-surface-container-highest/30 rounded-[0.75rem] border border-outline-variant/20 p-6 prose prose-invert prose-sm max-w-none">
                <p className="text-on-surface/50 font-headline italic mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Legacy Report Format
                </p>
                <div className="text-on-surface/90 font-headline leading-relaxed">
                    <ReactMarkdown>{report}</ReactMarkdown>
                </div>
            </div>
        );
    }

    const items = [
        {
            id: 'lore',
            label: 'Lore Consistency',
            icon: <ShieldCheck className="w-4 h-4" />,
            score: report.metrics?.loreConsistency || 0,
            audit: report.audit?.lore || [],
            color: (report.metrics?.loreConsistency || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400',
            bgColor: (report.metrics?.loreConsistency || 0) >= 80 ? 'bg-emerald-500/5' : 'bg-amber-500/5',
            borderColor: (report.metrics?.loreConsistency || 0) >= 80 ? 'border-emerald-500/20' : 'border-amber-500/20',
        },
        {
            id: 'voice',
            label: 'Voice Authenticity',
            icon: <Mic2 className="w-4 h-4" />,
            score: report.metrics?.voiceAuthenticity || 0,
            audit: report.audit?.voice || [],
            color: (report.metrics?.voiceAuthenticity || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400',
            bgColor: (report.metrics?.voiceAuthenticity || 0) >= 80 ? 'bg-emerald-500/5' : 'bg-amber-500/5',
            borderColor: (report.metrics?.voiceAuthenticity || 0) >= 80 ? 'border-emerald-500/20' : 'border-amber-500/20',
        },
        {
            id: 'mythic',
            label: 'Mythic Resonance',
            icon: <Zap className="w-4 h-4" />,
            score: report.metrics?.mythicResonance || 0,
            audit: report.audit?.thematic || [],
            color: (report.metrics?.mythicResonance || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400',
            bgColor: (report.metrics?.mythicResonance || 0) >= 80 ? 'bg-emerald-500/5' : 'bg-amber-500/5',
            borderColor: (report.metrics?.mythicResonance || 0) >= 80 ? 'border-emerald-500/20' : 'border-amber-500/20',
        },
        {
            id: 'structure',
            label: 'Structural Compliance',
            icon: <ShieldCheck className="w-4 h-4" />,
            score: report.metrics?.structuralCompliance || 0,
            audit: report.audit?.structure || [],
            color: (report.metrics?.structuralCompliance || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400',
            bgColor: (report.metrics?.structuralCompliance || 0) >= 80 ? 'bg-emerald-500/5' : 'bg-amber-500/5',
            borderColor: (report.metrics?.structuralCompliance || 0) >= 80 ? 'border-emerald-500/20' : 'border-amber-500/20',
        }
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className={`p-5 rounded-[0.75rem] border ${item.bgColor} ${item.borderColor} transition-all hover:bg-opacity-20`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className={item.color}>{item.icon}</span>
                                <span className="text-xs font-label uppercase tracking-wider text-on-surface-variant font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.score >= 80 ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                )}
                                <span className={`text-xs font-label uppercase tracking-wider font-medium ${item.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {item.score}%
                                </span>
                            </div>
                        </div>
                        <div className="text-sm text-on-surface-variant leading-relaxed pl-7 border-l border-outline-variant/10 prose prose-invert prose-sm max-w-none">
                            <ul className="list-disc space-y-1">
                                {item.audit.map((observation, i) => (
                                    <li key={i} className="text-on-surface-variant/80">
                                        <ReactMarkdown>{observation}</ReactMarkdown>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {report.thematicNote && (
                <div className="bg-primary/5 border border-primary/20 rounded-[0.75rem] p-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Quote className="w-24 h-24 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                        <Quote className="w-4 h-4 text-primary" />
                        <span className="text-xs font-label uppercase tracking-wider text-primary font-medium">Thematic Note</span>
                    </div>
                    <div className="text-sm text-on-surface italic leading-relaxed prose prose-invert prose-sm max-w-none relative z-10">
                        <ReactMarkdown>{`"${report.thematicNote}"`}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
});
