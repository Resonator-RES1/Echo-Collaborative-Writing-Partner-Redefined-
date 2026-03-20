import React from 'react';
import { CheckCircle, AlertCircle, Info, Zap, Mic2, ShieldCheck, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ComplianceReport } from '../../src/types';

interface ComplianceReportViewProps {
    report: ComplianceReport | string;
}

export const ComplianceReportView: React.FC<ComplianceReportViewProps> = React.memo(({ report }) => {
    if (!report) return null;

    if (typeof report === 'string') {
        return (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 prose prose-invert prose-sm max-w-none">
                <p className="text-gray-400 italic mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Legacy Report Format
                </p>
                <ReactMarkdown>{report}</ReactMarkdown>
            </div>
        );
    }

    const items = [
        {
            id: 'mythic',
            label: 'Mythic Resonance',
            icon: <Zap className="w-4 h-4" />,
            data: report.mythicResonance,
            color: report.mythicResonance.status === 'Pass' ? 'text-emerald-400' : 'text-amber-400',
            bgColor: report.mythicResonance.status === 'Pass' ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            borderColor: report.mythicResonance.status === 'Pass' ? 'border-emerald-500/20' : 'border-amber-500/20',
        },
        {
            id: 'voice',
            label: 'Character Voice',
            icon: <Mic2 className="w-4 h-4" />,
            data: report.characterVoice,
            color: report.characterVoice.status === 'Pass' ? 'text-emerald-400' : 'text-amber-400',
            bgColor: report.characterVoice.status === 'Pass' ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            borderColor: report.characterVoice.status === 'Pass' ? 'border-emerald-500/20' : 'border-amber-500/20',
        },
        {
            id: 'lore',
            label: 'Lore Consistency',
            icon: <ShieldCheck className="w-4 h-4" />,
            data: report.loreConsistency,
            color: report.loreConsistency.status === 'Pass' ? 'text-emerald-400' : 'text-amber-400',
            bgColor: report.loreConsistency.status === 'Pass' ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            borderColor: report.loreConsistency.status === 'Pass' ? 'border-emerald-500/20' : 'border-amber-500/20',
        }
    ];

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className={`p-3 rounded-lg border ${item.bgColor} ${item.borderColor} transition-all hover:bg-opacity-20`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className={item.color}>{item.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {item.data.status === 'Pass' ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                )}
                                <span className={`text-xs font-bold ${item.data.status === 'Pass' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {item.data.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400 leading-relaxed pl-6 border-l border-gray-700/50 prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{item.data.reasoning}</ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>

            {report.thematicNote && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 relative overflow-hidden group">
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Quote className="w-16 h-16 text-purple-400" />
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Quote className="w-3 h-3 text-purple-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Thematic Note</span>
                    </div>
                    <div className="text-sm text-purple-200/80 italic leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{`"${report.thematicNote}"`}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
});
