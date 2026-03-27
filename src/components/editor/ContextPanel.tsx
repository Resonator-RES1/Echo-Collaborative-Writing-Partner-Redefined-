import React from 'react';
import { BookOpen, Users, User, Sparkles, Zap } from 'lucide-react';
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
}

export const ContextPanel = React.memo(({
    loreEntries,
    voiceProfiles,
    authorVoices,
    onAddLoreEntry,
    onDeleteLoreEntry,
    onAddVoiceProfile,
    onDeleteVoiceProfile,
    onAddAuthorVoice,
    onDeleteAuthorVoice
}: ContextPanelProps) => {
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
});
