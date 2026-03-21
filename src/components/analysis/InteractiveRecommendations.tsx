import React from 'react';
import { Lightbulb, ArrowRight, Shield, Zap, Wind, CheckCircle2 } from 'lucide-react';
import { Recommendation } from '../../types';

interface InteractiveRecommendationsProps {
  recommendations?: Recommendation[];
  onApply?: (fix: string) => void;
}

export const InteractiveRecommendations: React.FC<InteractiveRecommendationsProps> = ({ recommendations = [], onApply }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-headline text-2xl font-light tracking-tight">Interactive Recommendations</h2>
          <p className="text-on-surface-variant text-sm font-label tracking-wide opacity-70 uppercase">Actionable Polish Insights</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-primary font-bold">
          <Lightbulb className="w-4 h-4" />
          <span>{recommendations.length} Suggestions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => (
          <div 
            key={idx} 
            className="group p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${
                rec.type === 'voice' ? 'bg-primary/10 text-primary' : 
                rec.type === 'lore' ? 'bg-secondary/10 text-secondary' : 
                'bg-tertiary/10 text-tertiary'
              }`}>
                {rec.type === 'voice' ? <Zap className="w-4 h-4" /> : 
                 rec.type === 'lore' ? <Shield className="w-4 h-4" /> : 
                 <Wind className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                rec.type === 'voice' ? 'text-primary' : 
                rec.type === 'lore' ? 'text-secondary' : 
                'text-tertiary'
              }`}>
                {rec.type}
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">{rec.title}</h3>
              <p className="text-xs text-on-surface-variant/80 leading-relaxed">{rec.description}</p>
              {rec.actionable && (
                <div className="p-2 rounded bg-surface-container-high/50 border border-outline-variant/5">
                  <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mb-1">Action</p>
                  <p className="text-[11px] text-on-surface-variant italic">{rec.actionable}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-top border-outline-variant/10">
              <button 
                onClick={() => rec.suggestedFix && onApply?.(rec.suggestedFix)}
                disabled={!rec.suggestedFix}
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  rec.suggestedFix 
                    ? 'text-primary hover:gap-3 cursor-pointer' 
                    : 'text-on-surface-variant/20 cursor-not-allowed'
                }`}
              >
                {rec.suggestedFix ? 'Apply Suggestion' : 'Manual Fix Required'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {recommendations.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-surface-container-low/30 rounded-3xl border border-dashed border-outline-variant/20 text-on-surface-variant/40 space-y-4">
            <CheckCircle2 className="w-12 h-12 opacity-10" />
            <p className="text-xs font-label uppercase tracking-widest">Your draft is highly optimized. No new recommendations.</p>
          </div>
        )}
      </div>
    </div>
  );
};
