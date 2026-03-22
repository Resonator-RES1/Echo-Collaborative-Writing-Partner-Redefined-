import React, { useState } from 'react';
import { VoiceProfile } from '../../../types';
import { Users, PlusCircle, CheckCircle2, X } from 'lucide-react';

interface VoiceProfileManagerProps {
    voiceProfiles: VoiceProfile[];
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    showToast: (message: string) => void;
}

export const VoiceProfileManager: React.FC<VoiceProfileManagerProps> = React.memo(({ 
    voiceProfiles, onAddVoiceProfile, showToast
}) => {
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const activeProfiles = voiceProfiles.filter(p => p.isActive);

    const handleToggleActive = (id: string) => {
        const profile = voiceProfiles.find(p => p.id === id);
        if (profile) {
            onAddVoiceProfile({ ...profile, isActive: !profile.isActive });
            showToast(`"${profile.name}" voice ${profile.isActive ? 'deactivated' : 'activated'}.`);
            setSelectedProfileId('');
        }
    };

    return (
        <div className="pt-4 border-t border-outline-variant/20">
            <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5"/> Character Voices
            </label>
            
            {activeProfiles.length > 0 ? (
                <div className="mb-4 space-y-2">
                    {activeProfiles.map(profile => (
                        <div key={profile.id} className="p-2.5 bg-primary/5 border border-primary/20 rounded-[0.75rem] flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm font-medium text-on-surface truncate">
                                    {profile.name}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleToggleActive(profile.id)}
                                className="p-1 rounded-full hover:bg-primary/20 text-primary transition-colors"
                                title="Remove voice"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mb-4 p-3 bg-surface-container-highest/30 border border-dashed border-outline-variant/40 rounded-[0.75rem] text-center">
                    <p className="text-xs text-on-surface-variant">No active character voices selected.</p>
                </div>
            )}

            <div className="flex items-center gap-2 w-full">
                <select 
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 text-sm flex-grow text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                >
                    <option value="">-- Add character voice --</option>
                    {voiceProfiles.map(p => (
                        <option key={p.id} value={p.id} disabled={p.isActive}>{p.name} {p.isActive ? '(Active)' : ''}</option>
                    ))}
                </select>
                <button 
                    onClick={() => handleToggleActive(selectedProfileId)}
                    disabled={!selectedProfileId}
                    className="p-2.5 bg-primary hover:bg-primary/90 rounded-[0.75rem] text-on-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title="Toggle active"
                >
                    <PlusCircle className="w-5 h-5" />
                </button>
            </div>
            <p className="mt-2 text-[10px] text-on-surface-variant italic">
                Active character voices ensure dialogue and behavior remain consistent.
            </p>
        </div>
    );
});
