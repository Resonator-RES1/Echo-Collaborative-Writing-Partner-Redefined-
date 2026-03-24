import React from 'react';
import { BarChart3, Info } from 'lucide-react';
import { RefinedVersion, ProseMetrics } from '../../types';

interface ReportMetricsProps {
    metrics: RefinedVersion['metrics'];
}

export const ReportMetrics: React.FC<ReportMetricsProps> = ({ metrics }) => {
    if (!metrics) return null;

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 shadow-sm h-full">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">Prose Metrics</h3>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Technical Performance</p>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(metrics as ProseMetrics).map(([key, metric]) => (
                    <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">{key.replace(/_/g, ' ')}</span>
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
    );
};
