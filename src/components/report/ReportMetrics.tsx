import React, { useState } from 'react';
import { TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { RefinedVersion, ProseMetrics } from '../../types';

interface ReportMetricsProps {
    metrics: RefinedVersion['metrics'];
}

const getStatusLabel = (score: number) => {
    if (score >= 9) return "Crystal Clear";
    if (score >= 7) return "Minor Drift";
    return "Review Required";
};

const getStatusColor = (score: number) => {
    if (score >= 9) return "text-green-500 bg-green-500/10";
    if (score >= 7) return "text-amber-500 bg-amber-500/10";
    return "text-red-500 bg-red-500/10";
};

export const ReportMetrics: React.FC<ReportMetricsProps> = ({ metrics }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!metrics) return null;

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden transition-all duration-300">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-surface-container-highest/30 transition-colors text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-headline text-xl font-bold text-on-surface">Prose Metrics</h3>
                        <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Technical Performance</p>
                    </div>
                </div>
                <div className="p-2 rounded-full bg-surface-container-highest/50 text-on-surface-variant">
                    {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
            </button>

            {isExpanded && (
                <div className="p-6 pt-0 border-t border-outline-variant/5">
                    <div className="space-y-6 mt-6">
                        {Object.entries(metrics as ProseMetrics).map(([key, metric]) => (
                            <div key={key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">{key.replace(/_/g, ' ')}</span>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(metric.score)}`}>
                                            {getStatusLabel(metric.score)}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-headline font-black text-on-surface">{metric.score}</span>
                                        <span className="text-[10px] text-on-surface-variant/30 font-bold">/ 10</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary/40 transition-all duration-1000" 
                                        style={{ width: `${metric.score * 10}%` }}
                                    />
                                </div>
                                <div className="flex gap-3 bg-surface-container-highest/30 p-3 rounded-xl border border-outline-variant/5">
                                    <Info className="w-4 h-4 text-primary/50 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-on-surface-variant/80 leading-relaxed italic line-clamp-2">{metric.note}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
