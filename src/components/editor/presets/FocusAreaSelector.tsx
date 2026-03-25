import React from 'react';
import { FocusArea, RefineMode } from '../../../types';
import { MessageSquareQuote, Waves, Smile, Network, Eye, Globe, MessagesSquare, Clock, ShieldCheck } from 'lucide-react';

export const focusAreaOptions: { id: FocusArea, label: string, icon: React.ReactNode, title: string }[] = [
  { id: 'tone', label: 'Tone', icon: <MessageSquareQuote className="w-5 h-5" />, title: 'Adjust Tone (Atmosphere & Mood)' },
  { id: 'rhythm', label: 'Rhythm', icon: <Waves className="w-5 h-5" />, title: 'Rhythm & Cadence (Musicality)' },
  { id: 'emotion', label: 'Emotion', icon: <Smile className="w-5 h-5" />, title: 'Visceral Emotion (Show, Don\'t Tell)' },
  { id: 'plot', label: 'Plot', icon: <Network className="w-5 h-5" />, title: 'Narrative Drive & Logic' },
  { id: 'sensory', label: 'Sensory', icon: <Eye className="w-5 h-5" />, title: 'High-Fidelity Sensory Details' },
  { id: 'mythic', label: 'Mythic Weight', icon: <Globe className="w-5 h-5" />, title: 'Mythic Weight & Themes (Lore Elevation)' },
  { id: 'dialogue', label: 'Dialogue', icon: <MessagesSquare className="w-5 h-5" />, title: 'Dialogue Authenticity & Subtext' },
  { id: 'voiceIntegrity', label: 'Voice Integrity', icon: <ShieldCheck className="w-5 h-5" />, title: 'Preserve Authorial Voice & Style' },
  { id: 'structural', label: 'Structural Clock', icon: <Clock className="w-5 h-5" />, title: 'Structural Clock & Continuity' },
];

export const reviewFocusAreaOptions: { id: FocusArea, label: string, icon: React.ReactNode, title: string }[] = [
  { id: 'tone', label: 'Tone Check', icon: <MessageSquareQuote className="w-5 h-5" />, title: 'Critique Tone & Atmosphere' },
  { id: 'rhythm', label: 'Pacing', icon: <Waves className="w-5 h-5" />, title: 'Review Rhythm & Pacing' },
  { id: 'emotion', label: 'Emotional Impact', icon: <Smile className="w-5 h-5" />, title: 'Assess Emotional Resonance' },
  { id: 'plot', label: 'Plot Holes', icon: <Network className="w-5 h-5" />, title: 'Identify Plot Inconsistencies' },
  { id: 'sensory', label: 'Sensory Review', icon: <Eye className="w-5 h-5" />, title: 'Evaluate Sensory Details' },
  { id: 'mythic', label: 'Theme Analysis', icon: <Globe className="w-5 h-5" />, title: 'Analyze Thematic Depth' },
  { id: 'dialogue', label: 'Dialogue Critique', icon: <MessagesSquare className="w-5 h-5" />, title: 'Critique Dialogue Authenticity' },
  { id: 'voiceIntegrity', label: 'Voice Audit', icon: <ShieldCheck className="w-5 h-5" />, title: 'Audit Stylistic Consistency' },
  { id: 'structural', label: 'Continuity Check', icon: <Clock className="w-5 h-5" />, title: 'Check Structural Continuity' },
];

export const reactionFocusAreaOptions: { id: FocusArea, label: string, icon: React.ReactNode, title: string }[] = [
  { id: 'tone', label: 'Vibe Check', icon: <MessageSquareQuote className="w-5 h-5" />, title: 'React to Tone & Atmosphere' },
  { id: 'rhythm', label: 'Flow', icon: <Waves className="w-5 h-5" />, title: 'React to Rhythm & Pacing' },
  { id: 'emotion', label: 'Feelings', icon: <Smile className="w-5 h-5" />, title: 'React to Emotional Resonance' },
  { id: 'plot', label: 'Story Thoughts', icon: <Network className="w-5 h-5" />, title: 'React to Plot & Story' },
  { id: 'sensory', label: 'Immersion', icon: <Eye className="w-5 h-5" />, title: 'React to Sensory Details' },
  { id: 'mythic', label: 'Deep Thoughts', icon: <Globe className="w-5 h-5" />, title: 'React to Themes & Lore' },
  { id: 'dialogue', label: 'Chatter', icon: <MessagesSquare className="w-5 h-5" />, title: 'React to Dialogue' },
  { id: 'voiceIntegrity', label: 'Authenticity', icon: <ShieldCheck className="w-5 h-5" />, title: 'React to Voice Authenticity' },
  { id: 'structural', label: 'Believability', icon: <Clock className="w-5 h-5" />, title: 'React to Continuity' },
];

interface FocusAreaButtonProps {
    opt: typeof focusAreaOptions[0];
    isSelected: boolean;
    onClick: () => void;
}

const FocusAreaButton: React.FC<FocusAreaButtonProps> = React.memo(({ opt, isSelected, onClick }) => (
    <button 
        onClick={onClick} 
        title={opt.title} 
        className={`
            flex items-center justify-center gap-3 p-4 text-[10px] font-label uppercase tracking-[0.15em] font-black rounded-2xl border-2 transition-all duration-300 relative group overflow-hidden
            ${isSelected 
                ? 'bg-primary text-on-primary-fixed border-primary shadow-xl scale-[1.05] z-10 ring-2 ring-primary/30 ring-offset-2 ring-offset-surface-container-low' 
                : 'bg-surface-container-highest/20 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-highest/40 hover:border-outline-variant/30 hover:text-on-surface'
            }
        `}
    >
        {isSelected && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
        <span className={`transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-on-primary-fixed' : 'text-primary'}`}>
            {opt.icon}
        </span>
        <span className="relative z-10">{opt.label}</span>
    </button>
));

interface FocusAreaSelectorProps {
    focusAreas: FocusArea[];
    setFocusAreas: (areas: FocusArea[] | ((prev: FocusArea[]) => FocusArea[])) => void;
    mode: RefineMode;
}

export const FocusAreaSelector: React.FC<FocusAreaSelectorProps> = React.memo(({ focusAreas, setFocusAreas, mode }) => {
    const options = mode === 'review' ? reviewFocusAreaOptions : mode === 'reaction' ? reactionFocusAreaOptions : focusAreaOptions;
    
    const categories = [
        {
            title: 'Atmosphere & Style',
            ids: ['tone', 'rhythm', 'sensory'] as FocusArea[]
        },
        {
            title: 'Narrative & Character',
            ids: ['emotion', 'dialogue', 'voiceIntegrity'] as FocusArea[]
        },
        {
            title: 'Structure & Depth',
            ids: ['plot', 'mythic', 'structural'] as FocusArea[]
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/50 font-black">
                    Focus Areas
                </label>
                <span className="text-on-surface-variant/40 font-black text-[9px] uppercase tracking-widest">
                    {focusAreas.length} SELECTED
                </span>
            </div>
            
            <div className="space-y-6">
                {categories.map(category => (
                    <div key={category.title} className="space-y-3">
                        <h4 className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant/60 font-bold border-b border-outline-variant/20 pb-1">
                            {category.title}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {category.ids.map(id => {
                                const opt = options.find(o => o.id === id);
                                if (!opt) return null;
                                return (
                                    <FocusAreaButton 
                                        key={opt.id}
                                        opt={opt}
                                        isSelected={focusAreas.includes(opt.id)}
                                        onClick={() => setFocusAreas(p => {
                                            const prev = Array.isArray(p) ? p : [];
                                            return prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id];
                                        })}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
