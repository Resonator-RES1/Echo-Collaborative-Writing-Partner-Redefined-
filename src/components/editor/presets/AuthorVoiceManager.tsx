import React, { useState } from 'react';
import { AuthorVoice } from '../../../types';
import { Library, PlusCircle, CheckCircle2 } from 'lucide-react';

interface AuthorVoiceManagerProps {
    authorVoices: AuthorVoice[];
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    showToast: (message: string) => void;
}

export const AuthorVoiceManager: React.FC<AuthorVoiceManagerProps> = React.memo(({ 
    authorVoices, onAddAuthorVoice, showToast
}) => {
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const activeVoice = authorVoices.find(v => v.isActive);

    const handleSetActive = (id: string) => {
        const voice = authorVoices.find(v => v.id === id);
        if (voice) {
            onAddAuthorVoice({ ...voice, isActive: true });
            showToast(`"${voice.name}" set as active author voice.`);
            setSelectedLibraryId('');
        }
    };

    return (
        <div className="pt-4 border-t border-outline-variant/20">
            <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-3 flex items-center gap-1.5">
                <Library className="w-3.5 h-3.5"/> Author Voice
            </label>
            
            {activeVoice ? (
                <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-[0.75rem] flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-on-surface truncate">
                            {activeVoice.name}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-primary bg-primary/10 px-1.5 py-0.5 rounded">Active</span>
                </div>
            ) : (
                <div className="mb-4 p-3 bg-surface-container-highest/30 border border-dashed border-outline-variant/40 rounded-[0.75rem] text-center">
                    <p className="text-xs text-on-surface-variant">No active author voice selected.</p>
                </div>
            )}

            <div className="flex items-center gap-2 w-full">
                <select 
                    value={selectedLibraryId}
                    onChange={(e) => setSelectedLibraryId(e.target.value)}
                    className="bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 text-sm flex-grow text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                >
                    <option value="">-- Switch author voice --</option>
                    {authorVoices.map(v => (
                        <option key={v.id} value={v.id}>{v.name} {v.isActive ? '(Active)' : ''}</option>
                    ))}
                </select>
                <button 
                    onClick={() => handleSetActive(selectedLibraryId)}
                    disabled={!selectedLibraryId || authorVoices.find(v => v.id === selectedLibraryId)?.isActive}
                    className="p-2.5 bg-primary hover:bg-primary/90 rounded-[0.75rem] text-on-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title="Set as active"
                >
                    <PlusCircle className="w-5 h-5" />
                </button>
            </div>
            <p className="mt-2 text-[10px] text-on-surface-variant italic">
                The active author voice guides Echo's narrative style and prose structure.
            </p>
        </div>
    );
});
