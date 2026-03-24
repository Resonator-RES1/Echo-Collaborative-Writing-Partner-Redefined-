import React from 'react';
import { BookOpen, Users, User, Sparkles, Zap, AlertCircle, PlusCircle } from 'lucide-react';
import { LoreEntry, VoiceProfile, AuthorVoice } from '../../types';
import { AuthorVoiceManager } from './presets/AuthorVoiceManager';
import { VoiceProfileManager } from './presets/VoiceProfileManager';
import { LoreContextManager } from './LoreContextManager';

interface ContextPanelProps {
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    authorVoices: AuthorVoice[];
    onAddLoreEntry: (entry: LoreEntry) => void;
    onDeleteLoreEntry: (id: string) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    onDeleteVoiceProfile: (id: string) => void;
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    onDeleteAuthorVoice: (id: string) => void;
    suggestions: { type: 'lore' | 'voice', id: string, name: string }[];
    onActivateSuggestion: (suggestion: { type: 'lore' | 'voice', id: string }) => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
    loreEntries,
    voiceProfiles,
    authorVoices,
    onAddLoreEntry,
    onDeleteLoreEntry,
    onAddVoiceProfile,
    onDeleteVoiceProfile,
    onAddAuthorVoice,
    onDeleteAuthorVoice,
    suggestions,
    onActivateSuggestion
}) => {
    const activeLoreCount = loreEntries.filter(e => e.isActive).length;
    const activeVoiceCount = voiceProfiles.filter(p => p.isActive).length;
    const activeAuthorCount = authorVoices.filter(a => a.isActive).length;

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto animate-in fade-in duration-500 custom-scrollbar pr-2 pb-12">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h3 className="font-headline text-3xl font-bold">Active Context</h3>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-black">Source of Truth Selection</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                            {activeLoreCount + activeVoiceCount + activeAuthorCount} Active Profiles
                        </span>
                    </div>
                </div>
            </div>

            {suggestions.length > 0 && (
                <div className="bg-accent-sky/5 border border-accent-sky/20 rounded-3xl p-6 mb-8 space-y-4 shadow-inner">
                    <div className="flex items-center gap-2 text-accent-sky font-black text-[10px] uppercase tracking-widest">
                        <AlertCircle className="w-4 h-4" />
                        <span>Smart Context Detected</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(s => (
                            <button 
                                key={s.id}
                                onClick={() => onActivateSuggestion(s)}
                                className="text-[10px] font-black bg-surface-container-highest/40 border border-accent-sky/30 text-accent-sky px-4 py-2 rounded-2xl hover:bg-accent-sky hover:text-white transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider"
                            >
                                <PlusCircle className="w-3.5 h-3.5" />
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 p-8 shadow-sm space-y-8">
                    <div className="space-y-8">
                        <AuthorVoiceManager 
                            authorVoices={authorVoices}
                            onAddAuthorVoice={onAddAuthorVoice}
                            onDeleteAuthorVoice={onDeleteAuthorVoice}
                        />

                        <div className="h-px bg-outline-variant/10" />

                        <VoiceProfileManager 
                            voiceProfiles={voiceProfiles}
                            onAddVoiceProfile={onAddVoiceProfile}
                            onDeleteVoiceProfile={onDeleteVoiceProfile}
                        />

                        <div className="h-px bg-outline-variant/10" />

                        <LoreContextManager 
                            loreEntries={loreEntries} 
                            onAddLoreEntry={onAddLoreEntry} 
                            onDeleteLoreEntry={onDeleteLoreEntry}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
