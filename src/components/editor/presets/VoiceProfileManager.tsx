import React, { useState } from 'react';
import { VoiceProfile } from '../../../types';
import { Users, PlusCircle, X, Sparkles } from 'lucide-react';
import { GenderIcon } from '../../GenderIcon';

interface VoiceProfileManagerProps {
    voiceProfiles: VoiceProfile[];
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    onDeleteVoiceProfile: (id: string) => void;
}

export const VoiceProfileManager: React.FC<VoiceProfileManagerProps> = React.memo(({ 
    voiceProfiles, onAddVoiceProfile, onDeleteVoiceProfile
}) => {
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const activeProfiles = voiceProfiles.filter(p => p.isActive);

    const handleToggleActive = (id: string) => {
        const profile = voiceProfiles.find(p => p.id === id);
        if (profile) {
            onAddVoiceProfile({ ...profile, isActive: !profile.isActive });
            setSelectedProfileId('');
        }
    };

    return (
        <div className="pt-6 border-t border-outline-variant/20 space-y-4">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface/60 font-black">
                    <Users className="w-4 h-4 text-primary"/> Character Voices
                </label>
                {activeProfiles.length > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-1 rounded-full font-black border border-primary/20">
                        {activeProfiles.length} ACTIVE
                    </span>
                )}
            </div>
            
            {activeProfiles.length > 0 ? (
                <div className="space-y-3">
                    {activeProfiles.map(profile => (
                        <div 
                            key={profile.id} 
                            className="p-4 bg-primary/5 border border-primary/30 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in zoom-in duration-300"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <GenderIcon gender={profile.gender} size="sm" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-black text-on-surface truncate tracking-tight">
                                        {profile.name}
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                                        {profile.archetype || 'Active Voice'}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggleActive(profile.id)}
                                className="p-2 rounded-xl hover:bg-accent-rose/10 text-on-surface-variant hover:text-accent-rose transition-all active:scale-90"
                                title="Remove voice"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-6 bg-surface-container-highest/20 border border-dashed border-outline-variant/30 rounded-2xl text-center space-y-2">
                    <div className="w-10 h-10 bg-surface-container-highest/40 rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="w-5 h-5 text-on-surface-variant/40" />
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium">No active character voices. Select a profile below to ground dialogue.</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <div className="relative flex-grow w-full sm:w-auto">
                    <select 
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        className="w-full bg-surface-container-highest/40 border border-outline-variant/20 rounded-2xl p-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium appearance-none pr-10"
                    >
                        <option value="">-- Add character voice --</option>
                        {voiceProfiles.map(p => (
                            <option key={p.id} value={p.id} disabled={p.isActive}>{p.name} {p.isActive ? '(Active)' : ''}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/50">
                        <PlusCircle className="w-4 h-4" />
                    </div>
                </div>
                <button 
                    onClick={() => handleToggleActive(selectedProfileId)}
                    disabled={!selectedProfileId}
                    className="w-full sm:w-auto p-3.5 bg-primary hover:bg-primary/90 rounded-2xl text-on-primary-fixed punchy-button flex items-center justify-center gap-2"
                    title="Toggle active"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span className="sm:hidden font-black text-[10px] uppercase tracking-widest">Add Voice</span>
                </button>
            </div>
            <p className="text-[10px] text-on-surface-variant italic font-medium px-1">
                Active character voices ensure dialogue and behavior remain consistent with their established profiles.
            </p>
        </div>
    );
});
