import React from 'react';
import { FeedbackDepth, RefineMode } from '../../../src/types';

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
            <label htmlFor="feedback-depth" className="block text-sm font-medium text-gray-300 mb-2">{title}</label>
            <div className="flex gap-2 bg-gray-700/50 p-1 rounded-lg">
                {Object.keys(config).map(key => (
                    <button 
                        key={key} 
                        onClick={() => setFeedbackDepth(key as FeedbackDepth)} 
                        className={`flex-1 py-1 px-2 text-sm rounded-md transition-all ${feedbackDepth === key ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'}`}
                    >
                        {config[key as FeedbackDepth].label}
                    </button>
                ))}
            </div>
        </div>
    );
});
