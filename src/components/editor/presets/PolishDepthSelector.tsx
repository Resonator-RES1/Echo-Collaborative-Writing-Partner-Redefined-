import React from 'react';
import { FeedbackDepth, RefineMode } from '../../../types';
import { Zap, Scale, Search } from 'lucide-react';

export const DEPTH_CONFIG: Record<FeedbackDepth, { label: string; temperature: number; icon: React.ReactNode; description: string }> = {
  casual: { 
    label: 'Casual', 
    temperature: 0.3, 
    icon: <Zap className="w-4 h-4" />, 
    description: 'Quick, light polish for flow and clarity.' 
  },
  balanced: { 
    label: 'Balanced', 
    temperature: 0.7, 
    icon: <Scale className="w-4 h-4" />, 
    description: 'Standard refinement for professional prose.' 
  },
  'in-depth': { 
    label: 'In-depth', 
    temperature: 0.9, 
    icon: <Search className="w-4 h-4" />, 
    description: 'Deep stylistic overhaul and narrative audit.' 
  },
};

export const REVIEW_DEPTH_CONFIG: Record<FeedbackDepth, { label: string; temperature: number; icon: React.ReactNode; description: string }> = {
  casual: { 
    label: 'Casual', 
    temperature: 0.3, 
    icon: <Zap className="w-4 h-4" />, 
    description: 'Quick check for glaring errors.' 
  },
  balanced: { 
    label: 'Balanced', 
    temperature: 0.7, 
    icon: <Scale className="w-4 h-4" />, 
    description: 'Thorough review of prose and logic.' 
  },
  'in-depth': { 
    label: 'In-depth', 
    temperature: 0.9, 
    icon: <Search className="w-4 h-4" />, 
    description: 'Comprehensive audit of all narrative layers.' 
  },
};

export const REACTION_DEPTH_CONFIG: Record<FeedbackDepth, { label: string; temperature: number; icon: React.ReactNode; description: string }> = {
  casual: { 
    label: 'Quick', 
    temperature: 0.5, 
    icon: <Zap className="w-4 h-4" />, 
    description: 'Immediate impressions and vibes.' 
  },
  balanced: { 
    label: 'Balanced', 
    temperature: 0.8, 
    icon: <Scale className="w-4 h-4" />, 
    description: 'Thoughtful reaction to scene and character.' 
  },
  'in-depth': { 
    label: 'Deep', 
    temperature: 1.0, 
    icon: <Search className="w-4 h-4" />, 
    description: 'Profound analysis of emotional and thematic resonance.' 
  },
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
        <div className="space-y-4">
            <label htmlFor="feedback-depth" className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/50 font-black">{title}</label>
            <div className="grid grid-cols-3 gap-3">
                {Object.keys(config).map(key => {
                    const opt = config[key as FeedbackDepth];
                    const isSelected = feedbackDepth === key;
                    return (
                        <button 
                            key={key} 
                            onClick={() => setFeedbackDepth(key as FeedbackDepth)} 
                            title={opt.description}
                            className={`
                                flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all text-center group relative overflow-hidden
                                ${isSelected 
                                    ? 'bg-primary text-on-primary-fixed border-primary shadow-lg scale-[1.02] z-10' 
                                    : 'bg-surface-container-highest/20 border-outline-variant/10 text-on-surface-variant hover:border-outline-variant/30 hover:bg-surface-container-highest/40'
                                }
                            `}
                        >
                            {isSelected && (
                                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                            )}
                            <div className={`transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-on-primary-fixed' : 'text-primary'}`}>
                                {opt.icon}
                            </div>
                            <span className="font-label text-[9px] uppercase tracking-[0.15em] leading-none font-black relative z-10">
                                {opt.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
