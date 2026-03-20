import React from 'react';
import { FocusArea, RefineMode } from '../../../types';
import { MessageSquareQuote, Waves, Smile, Network, Eye, Globe, MessagesSquare, Clock, ShieldCheck } from 'lucide-react';

export const focusAreaOptions: { id: FocusArea, label: string, icon: React.ReactNode, title: string }[] = [
  { id: 'tone', label: 'Tone', icon: <MessageSquareQuote className="w-5 h-5" />, title: 'Adjust Tone (Atmosphere & Mood)' },
  { id: 'rhythm', label: 'Rhythm', icon: <Waves className="w-5 h-5" />, title: 'Rhythm & Cadence (Musicality)' },
  { id: 'emotion', label: 'Emotion', icon: <Smile className="w-5 h-5" />, title: 'Visceral Emotion (Show, Don\'t Tell)' },
  { id: 'plot', label: 'Plot', icon: <Network className="w-5 h-5" />, title: 'Narrative Drive & Logic' },
  { id: 'sensory', label: 'Sensory', icon: <Eye className="w-5 h-5" />, title: 'High-Fidelity Sensory Details' },
  { id: 'thematic', label: 'Mythic Weight', icon: <Globe className="w-5 h-5" />, title: 'Mythic Weight & Themes (Lore Elevation)' },
  { id: 'dialogue', label: 'Dialogue', icon: <MessagesSquare className="w-5 h-5" />, title: 'Dialogue Authenticity & Subtext' },
  { id: 'voiceIntegrity', label: 'Voice Integrity', icon: <ShieldCheck className="w-5 h-5" />, title: 'Preserve Authorial Voice & Style' },
  { id: 'continuity', label: 'Structural Clock', icon: <Clock className="w-5 h-5" />, title: 'Structural Clock & Continuity' },
];

export const reviewFocusAreaOptions: { id: FocusArea, label: string, icon: React.ReactNode, title: string }[] = [
  { id: 'tone', label: 'Tone Check', icon: <MessageSquareQuote className="w-5 h-5" />, title: 'Critique Tone & Atmosphere' },
  { id: 'rhythm', label: 'Pacing', icon: <Waves className="w-5 h-5" />, title: 'Review Rhythm & Pacing' },
  { id: 'emotion', label: 'Emotional Impact', icon: <Smile className="w-5 h-5" />, title: 'Assess Emotional Resonance' },
  { id: 'plot', label: 'Plot Holes', icon: <Network className="w-5 h-5" />, title: 'Identify Plot Inconsistencies' },
  { id: 'sensory', label: 'Sensory Review', icon: <Eye className="w-5 h-5" />, title: 'Evaluate Sensory Details' },
  { id: 'thematic', label: 'Theme Analysis', icon: <Globe className="w-5 h-5" />, title: 'Analyze Thematic Depth' },
  { id: 'dialogue', label: 'Dialogue Critique', icon: <MessagesSquare className="w-5 h-5" />, title: 'Critique Dialogue Authenticity' },
  { id: 'voiceIntegrity', label: 'Voice Audit', icon: <ShieldCheck className="w-5 h-5" />, title: 'Audit Stylistic Consistency' },
  { id: 'continuity', label: 'Continuity Check', icon: <Clock className="w-5 h-5" />, title: 'Check Structural Continuity' },
];

export const reactionFocusAreaOptions: { id: FocusArea, label: string, icon: React.ReactNode, title: string }[] = [
  { id: 'tone', label: 'Vibe Check', icon: <MessageSquareQuote className="w-5 h-5" />, title: 'React to Tone & Atmosphere' },
  { id: 'rhythm', label: 'Flow', icon: <Waves className="w-5 h-5" />, title: 'React to Rhythm & Pacing' },
  { id: 'emotion', label: 'Feelings', icon: <Smile className="w-5 h-5" />, title: 'React to Emotional Resonance' },
  { id: 'plot', label: 'Story Thoughts', icon: <Network className="w-5 h-5" />, title: 'React to Plot & Story' },
  { id: 'sensory', label: 'Immersion', icon: <Eye className="w-5 h-5" />, title: 'React to Sensory Details' },
  { id: 'thematic', label: 'Deep Thoughts', icon: <Globe className="w-5 h-5" />, title: 'React to Themes & Lore' },
  { id: 'dialogue', label: 'Chatter', icon: <MessagesSquare className="w-5 h-5" />, title: 'React to Dialogue' },
  { id: 'voiceIntegrity', label: 'Authenticity', icon: <ShieldCheck className="w-5 h-5" />, title: 'React to Voice Authenticity' },
  { id: 'continuity', label: 'Believability', icon: <Clock className="w-5 h-5" />, title: 'React to Continuity' },
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
            flex items-center justify-center gap-2.5 p-3 text-xs font-label uppercase tracking-wider font-bold rounded-[0.75rem] border transition-all duration-200 relative
            ${isSelected 
                ? 'bg-primary text-on-primary-fixed border-primary shadow-sm' 
                : 'bg-surface-container-highest/30 border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest hover:border-outline-variant/40 hover:text-on-surface'
            }
        `}
    >
        <span className={isSelected ? 'text-on-primary-fixed' : 'text-primary'}>
            {opt.icon}
        </span>
        <span>{opt.label}</span>
    </button>
));

interface FocusAreaSelectorProps {
    focusAreas: FocusArea[];
    setFocusAreas: (areas: FocusArea[] | ((prev: FocusArea[]) => FocusArea[])) => void;
    mode: RefineMode;
}

export const FocusAreaSelector: React.FC<FocusAreaSelectorProps> = React.memo(({ focusAreas, setFocusAreas, mode }) => {
    const options = mode === 'review' ? reviewFocusAreaOptions : mode === 'reaction' ? reactionFocusAreaOptions : focusAreaOptions;
    
    return (
        <div>
            <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-3">
                Focus Areas <span className="text-on-surface-variant/60 font-normal text-[10px] ml-2 tracking-normal">(Select multiple)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {options.map(opt => (
                    <FocusAreaButton 
                        key={opt.id}
                        opt={opt}
                        isSelected={focusAreas.includes(opt.id)}
                        onClick={() => setFocusAreas(p => {
                            const prev = Array.isArray(p) ? p : [];
                            return prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id];
                        })}
                    />
                ))}
            </div>
        </div>
    );
});
