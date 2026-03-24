import React from 'react';
import { BookOpen, User, MessageSquare, Target } from 'lucide-react';
import { RefinedVersion } from '../../types';

interface ReportContextProps {
    activeContext: RefinedVersion['activeContext'];
}

export const ReportContext: React.FC<ReportContextProps> = ({ activeContext }) => {
    if (!activeContext) return null;

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">Active Context</h3>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Source Integrity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <ContextItem 
                    icon={<User className="w-4 h-4" />} 
                    label="Author Voice" 
                    value={activeContext.authorVoice || 'None (Respecting Draft)'} 
                />
                <ContextItem 
                    icon={<MessageSquare className="w-4 h-4" />} 
                    label="Character Voices" 
                    value={activeContext.characterVoices.length > 0 ? activeContext.characterVoices.join(', ') : 'None (Respecting Draft)'} 
                />
                <ContextItem 
                    icon={<BookOpen className="w-4 h-4" />} 
                    label="Lore Profiles" 
                    value={activeContext.loreProfiles.length > 0 ? activeContext.loreProfiles.join(', ') : 'None (Respecting Draft)'} 
                />
                <ContextItem 
                    icon={<Target className="w-4 h-4" />} 
                    label="Focus Areas" 
                    value={activeContext.focusAreas.length > 0 ? activeContext.focusAreas.join(', ') : 'None (General Polish)'} 
                />
            </div>
        </div>
    );
};

const ContextItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="p-4 bg-surface-container-highest/20 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all group">
        <div className="flex items-center gap-2 mb-2 text-on-surface-variant/50 group-hover:text-primary transition-colors">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-xs font-headline font-bold text-on-surface/80 leading-relaxed">{value}</p>
    </div>
);
