import React, { useState } from 'react';
import { Activity, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { RefinedVersion } from '../../types';

interface ReportAnalysisProps {
    analysis: RefinedVersion['analysis'];
    expressionProfile: RefinedVersion['expressionProfile'];
}

export const ReportAnalysis: React.FC<ReportAnalysisProps> = ({ analysis, expressionProfile }) => {
    if (!analysis) return null;

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">Mirror Editor Analysis</h3>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Neutral Observation</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-surface-container-highest/20 p-5 rounded-xl border border-outline-variant/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
                    <div className="flex gap-4">
                        <Info className="w-4 h-4 text-primary/50 shrink-0 mt-1" />
                        <div className="prose prose-sm prose-slate max-w-none 
                            prose-p:text-sm prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:italic
                            prose-strong:text-primary prose-strong:font-bold
                            dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                {analysis}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {expressionProfile && expressionProfile.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline-variant/10 pb-2">
                            <Activity className="w-4 h-4" />
                            <span>Expression Profile</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {expressionProfile.map((profile, idx) => {
                                const [isNoteExpanded, setIsNoteExpanded] = useState(false);
                                return (
                                    <div 
                                        key={idx} 
                                        className={`bg-surface-container-highest/20 p-4 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all group cursor-pointer ${isNoteExpanded ? 'ring-1 ring-primary/30 shadow-sm' : ''}`}
                                        onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 group-hover:text-primary transition-colors">{profile.vibe}</span>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${profile.qualifier === 'By Design' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-sky/10 text-accent-sky'}`}>
                                                {profile.qualifier}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-headline font-black text-primary">{profile.score}</span>
                                            <span className="text-[10px] text-on-surface-variant/30 font-bold">/ 10</span>
                                        </div>
                                        <p className={`text-[11px] text-on-surface-variant/70 mt-2 leading-snug font-medium ${!isNoteExpanded ? 'line-clamp-2' : ''}`}>
                                            {profile.note}
                                        </p>
                                        {profile.note.length > 60 && (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary mt-2 block opacity-60">
                                                {isNoteExpanded ? 'Show Less' : 'Read More'}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
