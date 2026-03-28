import React, { useState } from 'react';
import { BookOpen, User, MessageSquare, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { RefinedVersion } from '../../types';

interface ReportContextProps {
    activeContext: RefinedVersion['activeContext'];
}

export const ReportContext: React.FC<ReportContextProps> = ({ activeContext }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const hasContext = activeContext && (
        activeContext.authorVoice || 
        activeContext.characterVoices.length > 0 || 
        activeContext.loreProfiles.length > 0 || 
        activeContext.focusAreas.length > 0
    );

    return (
        <div className={`bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-sm overflow-hidden transition-all duration-300 ${hasContext ? 'border-l-4 border-primary' : 'border-l-4 border-accent-emerald'}`}>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-container-highest/10 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${hasContext ? 'bg-primary/10 text-primary' : 'bg-accent-emerald/10 text-accent-emerald'}`}>
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-on-surface">Active Context</h3>
                        <p className="text-[9px] text-on-surface-variant/60 uppercase font-bold">Source Integrity</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!hasContext && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded">All Clear</span>
                    )}
                    <div className="text-on-surface-variant/50">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-outline-variant/5">
                    {!hasContext ? (
                        <div className="py-4 text-center">
                            <p className="text-xs text-on-surface-variant/60 italic">No specific context active. Echo is operating on draft logic alone.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                            <ContextItem 
                                icon={<User className="w-3 h-3" />} 
                                label="Author Voice" 
                                value={activeContext?.authorVoice || 'None (Respecting Draft)'} 
                            />
                            <ContextItem 
                                icon={<MessageSquare className="w-3 h-3" />} 
                                label="Character Voices" 
                                value={activeContext?.characterVoices.length ? activeContext.characterVoices.join(', ') : 'None (Respecting Draft)'} 
                            />
                            <ContextItem 
                                icon={<BookOpen className="w-3 h-3" />} 
                                label="Lore Profiles" 
                                value={activeContext?.loreProfiles.length ? activeContext.loreProfiles.join(', ') : 'None (Respecting Draft)'} 
                            />
                            <ContextItem 
                                icon={<Target className="w-3 h-3" />} 
                                label="Focus Areas" 
                                value={activeContext?.focusAreas.length ? activeContext.focusAreas.join(', ') : 'None (General Polish)'} 
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ContextItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="p-2 bg-surface-container-highest/10 rounded border border-outline-variant/5 hover:border-primary/20 transition-all group">
        <div className="flex items-center gap-2 mb-1 text-on-surface-variant/50 group-hover:text-primary transition-colors">
            {icon}
            <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-[10px] font-bold text-on-surface/80 leading-relaxed truncate">{value}</p>
    </div>
);
