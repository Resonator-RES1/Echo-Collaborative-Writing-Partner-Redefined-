import React from 'react';
import { FeedbackDepth, RefineMode } from '../../../types';

export const DEPTH_CONFIG: Record<FeedbackDepth, { label: string; temperature: number }> = {
  casual: { label: 'Casual Polish', temperature: 0.3 },
  balanced: { label: 'Balanced Polish', temperature: 0.7 },
  'in-depth': { label: 'In-depth Polish', temperature: 0.9 },
};

export const REVIEW_DEPTH_CONFIG: Record<FeedbackDepth, { label: string; temperature: number }> = {
  casual: { label: 'Casual Review', temperature: 0.3 },
  balanced: { label: 'Balanced Review', temperature: 0.7 },
  'in-depth': { label: 'In-depth Review', temperature: 0.9 },
};

export const REACTION_DEPTH_CONFIG: Record<FeedbackDepth, { label: string; temperature: number }> = {
  casual: { label: 'Quick Thoughts', temperature: 0.5 },
  balanced: { label: 'Balanced Reaction', temperature: 0.8 },
  'in-depth': { label: 'Deep Dive', temperature: 1.0 },
};

interface PolishDepthSelectorProps {
    feedbackDepth: FeedbackDepth;
    setFeedbackDepth: (depth: FeedbackDepth) => void;
    mode?: RefineMode;
}

export const PolishDepthSelector: React.FC<PolishDepthSelectorProps> = React.memo(({ 
    feedbackDepth, setFeedbackDepth, mode = 'collaborative'
}) => {
    const config = mode === 'review' ? REVIEW_DEPTH_CONFIG : mode === 'reaction' ? REACTION_DEPTH_CONFIG : DEPTH_CONFIG;
    const title = mode === 'review' ? 'Review Depth' : mode === 'reaction' ? 'Reaction Depth' : 'Polish Depth';

    return (
        <div>
            <label htmlFor="feedback-depth" className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-3">{title}</label>
            <div className="flex gap-2 bg-surface-container-highest/30 p-1.5 rounded-[0.75rem] border border-outline-variant/20">
                {Object.keys(config).map(key => (
                    <button 
                        key={key} 
                        onClick={() => setFeedbackDepth(key as FeedbackDepth)} 
                        className={`flex-1 py-1.5 px-2 text-xs font-label uppercase tracking-wider rounded-[0.5rem] transition-all font-bold ${feedbackDepth === key ? 'bg-primary text-on-primary-fixed shadow-sm' : 'hover:bg-surface-container-highest/50 text-on-surface-variant hover:text-on-surface'}`}
                    >
                        {config[key as FeedbackDepth].label}
                    </button>
                ))}
            </div>
        </div>
    );
});
