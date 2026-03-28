import React, { useState } from 'react';
import { Activity, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { RefinedVersion } from '../../types';

// Sub-component to safely handle state for each card
const ExpressionCard: React.FC<{ profile: any }> = ({ profile }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div 
            className={`bg-surface-container-highest/10 p-3 rounded border border-outline-variant/5 hover:border-primary/20 transition-all cursor-pointer ${isExpanded ? 'ring-1 ring-primary/30 shadow-sm' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">{profile.vibe}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${profile.qualifier === 'By Design' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-sky/10 text-accent-sky'}`}>
                    {profile.qualifier}
                </span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-primary">{profile.score}</span>
                <span className="text-[9px] text-on-surface-variant/30 font-bold">/ 10</span>
            </div>
            <p className={`text-[10px] text-on-surface-variant/70 mt-1.5 leading-snug font-medium ${!isExpanded ? 'line-clamp-1' : ''}`}>
                {profile.note}
            </p>
        </div>
    );
};

export const ReportAnalysis: React.FC<{ version: RefinedVersion }> = ({ version }) => {
    const { analysis, expressionProfile, justification, mirrorEditorCritique } = version;
    if (!analysis && (!expressionProfile || expressionProfile.length === 0) && !justification && !mirrorEditorCritique) return null;

    return (
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 border-l-4 border-primary p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-on-surface">Mirror Editor Analysis</h3>
                    <p className="text-[9px] text-on-surface-variant/60 uppercase font-bold">Neutral Observation</p>
                </div>
            </div>

            <div className="space-y-4">
                {justification && (
                    <div className="bg-surface-container-highest/5 p-3 rounded border border-outline-variant/5">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Surgical Justification</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{justification}</p>
                    </div>
                )}

                {analysis && (
                    <div className="bg-surface-container-highest/10 p-3 rounded border border-outline-variant/5 relative overflow-hidden">
                        <div className="flex gap-3">
                            <Info className="w-3 h-3 text-primary/50 shrink-0 mt-1" />
                            <div className="prose prose-sm prose-slate max-w-none prose-p:text-xs prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:italic dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {analysis}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
                
                {mirrorEditorCritique && (
                    <div className="bg-surface-container-highest/5 p-3 rounded border border-outline-variant/5">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Mirror Editor Critique</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{mirrorEditorCritique}</p>
                    </div>
                )}

                {expressionProfile && expressionProfile.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {expressionProfile.map((profile, idx) => (
                            <ExpressionCard key={idx} profile={profile} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
