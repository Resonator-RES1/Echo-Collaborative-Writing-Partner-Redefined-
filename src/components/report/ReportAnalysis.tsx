import React, { useState } from 'react';
import { Activity, Info, Search, Scale, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { RefinedVersion } from '../../types';

// Sub-component to safely handle state for each card
const ExpressionCard: React.FC<{ profile: any }> = ({ profile }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div 
            className={`bg-surface-container-highest/20 p-4 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all cursor-pointer ${isExpanded ? 'ring-1 ring-primary/30 shadow-sm' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">{profile.vibe}</span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${profile.qualifier === 'By Design' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-sky/10 text-accent-sky'}`}>
                    {profile.qualifier}
                </span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-headline font-black text-primary">{profile.score}</span>
                <span className="text-[10px] text-on-surface-variant/30 font-bold">/ 10</span>
            </div>
            <p className={`text-[11px] text-on-surface-variant/70 mt-2 leading-snug font-medium ${!isExpanded ? 'line-clamp-2' : ''}`}>
                {profile.note}
            </p>
        </div>
    );
};

export const ReportAnalysis: React.FC<{ version: RefinedVersion }> = ({ version }) => {
    const { analysis, expressionProfile } = version;
    if (!analysis && (!expressionProfile || expressionProfile.length === 0)) return null;

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
                {/* Analysis Block */}
                {analysis && (
                    <div className="bg-surface-container-highest/20 p-5 rounded-xl border border-outline-variant/5 relative overflow-hidden">
                        <div className="flex gap-4">
                            <Info className="w-4 h-4 text-primary/50 shrink-0 mt-1" />
                            <div className="prose prose-sm prose-slate max-w-none prose-p:text-sm prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:italic dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {analysis}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mirror Critique */}
                {version.mirrorEditorCritique && (
                    <div className="bg-surface-container-highest/20 p-5 rounded-xl border border-outline-variant/5 mt-4">
                        <div className="flex gap-4">
                            <Search className="w-4 h-4 text-primary/50 shrink-0 mt-1" />
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/50 mb-2">Mirror Critique</h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed">{version.mirrorEditorCritique}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* expressionProfile Loop */}
                {expressionProfile && expressionProfile.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        {expressionProfile.map((profile, idx) => (
                            <ExpressionCard key={idx} profile={profile} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
