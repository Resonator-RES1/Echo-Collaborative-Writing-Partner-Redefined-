import React from 'react';

export const MetricBar: React.FC<{ label: string, metric: any, isRecommended?: boolean }> = ({ label, metric, isRecommended }) => (
    <div className="flex flex-col gap-2 p-4 bg-surface-container-highest/10 rounded-2xl border border-outline-variant/10">
        <div className="flex justify-between items-center">
            <div className="flex flex-col">
                <span className={`text-[10px] uppercase tracking-widest font-black ${isRecommended ? "text-primary" : "text-on-surface/60"}`}>
                    {label}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit mt-1 ${metric.qualifier === 'By Design' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-sky/10 text-accent-sky'}`}>
                    {metric.qualifier}
                </span>
            </div>
            <div className="text-right">
                <span className="text-lg font-black text-primary">{metric.score}/10</span>
            </div>
        </div>
        
        <div className="flex gap-0.5">
            {[...Array(10)].map((_, i) => (
                <div 
                    key={i} 
                    className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${i < metric.score ? (isRecommended ? 'bg-primary' : 'bg-primary/60') : 'bg-surface-container-highest'}`}
                />
            ))}
        </div>
        
        {metric.note && (
            <p className="text-[11px] text-on-surface-variant leading-relaxed italic mt-1">
                {metric.note}
            </p>
        )}
    </div>
);
