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
    if (score >= 9) return "text-accent-emerald bg-accent-emerald/10";
    if (score >= 7) return "text-accent-amber bg-accent-amber/10";
    return "text-error bg-error/10";
};

export const ReportMetrics: React.FC<ReportMetricsProps> = ({ metrics }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const hasMetrics = metrics && Object.keys(metrics).length > 0;

    return (
        <div className={`bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-sm overflow-hidden transition-all duration-300 ${hasMetrics ? 'border-l-4 border-primary' : 'border-l-4 border-accent-emerald'}`}>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-container-highest/10 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${hasMetrics ? 'bg-primary/10 text-primary' : 'bg-accent-emerald/10 text-accent-emerald'}`}>
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-on-surface">Prose Metrics</h3>
                        <p className="text-[9px] text-on-surface-variant/60 uppercase font-bold">Technical Performance</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!hasMetrics && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded">All Clear</span>
                    )}
                    <div className="text-on-surface-variant/50">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-outline-variant/5">
                    {!hasMetrics ? (
                        <div className="py-4 text-center">
                            <p className="text-xs text-on-surface-variant/60 italic">No metrics available for this version.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 mt-4">
                            {Object.entries(metrics as ProseMetrics).map(([key, metric]) => (
                                <div key={key} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">{key.replace(/_/g, ' ')}</span>
                                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getStatusColor(metric.score)}`}>
                                                {getStatusLabel(metric.score)}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-on-surface">{metric.score}</span>
                                            <span className="text-[9px] text-on-surface-variant/30 font-bold">/ 10</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary/40 transition-all duration-1000" 
                                            style={{ width: `${metric.score * 10}%` }}
                                        />
                                    </div>
                                    <div className="flex gap-2 bg-surface-container-highest/10 p-2 rounded border border-outline-variant/5">
                                        <Info className="w-3 h-3 text-primary/50 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-on-surface-variant/80 leading-relaxed italic line-clamp-1">{metric.note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
