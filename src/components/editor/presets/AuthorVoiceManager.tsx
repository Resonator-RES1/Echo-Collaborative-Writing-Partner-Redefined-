import React, { useState } from 'react';
import { AuthorVoice } from '../../../types';
import { Library, PlusCircle, CheckCircle2 } from 'lucide-react';

interface AuthorVoiceManagerProps {
    authorVoices: AuthorVoice[];
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    onDeleteAuthorVoice: (id: string) => void;
}

export const AuthorVoiceManager: React.FC<AuthorVoiceManagerProps> = React.memo(({ 
    authorVoices, onAddAuthorVoice, onDeleteAuthorVoice
}) => {
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const activeVoice = authorVoices.find(v => v.isActive);

    const handleSetActive = (id: string) => {
        const voice = authorVoices.find(v => v.id === id);
        if (voice) {
            onAddAuthorVoice({ ...voice, isActive: true });
            setSelectedLibraryId('');
        }
    };

    return (
        <div className="pt-6 border-t border-outline-variant/20 space-y-4">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/50 font-black">
                    <Library className="w-4 h-4 text-primary"/> Author Voice
                </label>
                {activeVoice && (
                    <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-1 rounded-full font-black border border-primary/20">
                        ACTIVE
                    </span>
                )}
            </div>
            
            {activeVoice ? (
                <div className="p-4 bg-primary/5 border border-primary/30 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-black text-on-surface truncate tracking-tight">
                                {activeVoice.name}
                            </span>
                            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                                Primary Style
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onAddAuthorVoice({ ...activeVoice, isActive: false })}
                        className="p-2 rounded-xl hover:bg-error/10 text-error transition-all"
                        title="Deactivate"
                    >
                        <PlusCircle className="w-5 h-5 rotate-45" />
                    </button>
                </div>
            ) : (
                <div className="p-6 bg-surface-container-highest/20 border border-dashed border-outline-variant/30 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-on-surface-variant font-medium">No active author voice. Select a library entry to ground prose style.</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <div className="relative flex-grow w-full sm:w-auto">
                    <select 
                        value={selectedLibraryId}
                        onChange={(e) => setSelectedLibraryId(e.target.value)}
                        className="w-full bg-surface-container-highest/40 border border-outline-variant/20 rounded-2xl p-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium appearance-none pr-10"
                    >
                        <option value="">-- Switch author voice --</option>
                        {authorVoices.map(v => (
                            <option key={v.id} value={v.id}>{v.name} {v.isActive ? '(Active)' : ''}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/50">
                        <PlusCircle className="w-4 h-4" />
                    </div>
                </div>
                <button 
                    onClick={() => handleSetActive(selectedLibraryId)}
                    disabled={!selectedLibraryId || authorVoices.find(v => v.id === selectedLibraryId)?.isActive}
                    className="w-full sm:w-auto p-3.5 bg-primary hover:bg-primary/90 rounded-2xl text-on-primary-fixed punchy-button flex items-center justify-center gap-2"
                    title="Set as active"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span className="sm:hidden font-black text-[10px] uppercase tracking-widest">Set Active</span>
                </button>
            </div>
            <p className="text-[10px] text-on-surface-variant italic font-medium px-1">
                The active author voice guides Echo's narrative style and prose structure.
            </p>
        </div>
    );
});
