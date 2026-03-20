import React, { useState, useRef, useEffect } from 'react';
import { CharacterProfile, VoiceProfile } from '../../../types';
import { FileUp, FileDown, Sparkles, PlusCircle, GripVertical, ChevronDown, Trash2, Save, Library, UserPlus } from 'lucide-react';

interface CharacterProfileItemProps {
    profile: CharacterProfile;
    isExpanded: boolean;
    isDragged: boolean;
    onToggleExpand: () => void;
    onUpdate: (field: keyof CharacterProfile, value: string | boolean) => void;
    onRemove: () => void;
    onSaveToLibrary: () => void;
    onDragStart: (e: React.DragEvent<HTMLLIElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLLIElement>) => void;
    onDragEnd: () => void;
}

const CharacterProfileItem: React.FC<CharacterProfileItemProps> = React.memo(({ 
    profile, isExpanded, isDragged, onToggleExpand, onUpdate, onRemove, onSaveToLibrary, onDragStart, onDragOver, onDragEnd 
}) => (
    <li 
        draggable 
        onDragStart={onDragStart} 
        onDragOver={onDragOver} 
        onDragEnd={onDragEnd} 
        className={`bg-surface-container-highest/30 border border-outline-variant/20 rounded-[0.75rem] transition-all ${isDragged ? 'opacity-50 scale-[0.98]' : 'hover:border-outline-variant/40'}`}
    >
        <div className="w-full flex justify-between items-center p-3 text-left font-medium">
            <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-on-surface-variant cursor-move hover:text-on-surface transition-colors" />
                <input 
                    type="checkbox" 
                    checked={profile.isActive !== false} 
                    onChange={(e) => onUpdate('isActive', e.target.checked)}
                    className="w-4 h-4 text-primary bg-surface-container-highest border-outline-variant/30 rounded focus:ring-primary cursor-pointer transition-colors"
                    title="Include in refinement"
                />
                <button onClick={onToggleExpand} className={`truncate font-headline text-sm hover:text-primary transition-colors ${profile.isActive === false ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                    {profile.name || 'New Character'}
                </button>
            </div>
            <button onClick={onToggleExpand} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
        {isExpanded && (
            <div className="p-3 border-t border-outline-variant/20 space-y-3 text-sm bg-surface-container-highest/10 rounded-b-[0.75rem]">
                <input type="text" placeholder="Character Name" value={profile.name} onChange={(e) => onUpdate('name', e.target.value)} className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/50" />
                <textarea placeholder="Voice & Diction" value={profile.voice} onChange={(e) => onUpdate('voice', e.target.value)} rows={2} className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/50 resize-y min-h-[60px]" />
                <select value={profile.gender} onChange={(e) => onUpdate('gender', e.target.value)} className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all">
                    <option value="unspecified">Unspecified Gender</option> <option value="male">Male</option> <option value="female">Female</option> <option value="non-binary">Non-binary</option>
                </select>
                <textarea placeholder="Backstory" value={profile.backstory} onChange={(e) => onUpdate('backstory', e.target.value)} rows={3} className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/50 resize-y min-h-[80px]" />
                <textarea placeholder="Motivations" value={profile.motivations} onChange={(e) => onUpdate('motivations', e.target.value)} rows={2} className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/50 resize-y min-h-[60px]" />
                <textarea placeholder="Relationships" value={profile.relationships} onChange={(e) => onUpdate('relationships', e.target.value)} rows={2} className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/50 resize-y min-h-[60px]" />
                <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/10">
                    <button onClick={onSaveToLibrary} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-[0.5rem] transition-colors" title="Save to reusable library"><Save className="w-3.5 h-3.5"/> Save to Library</button>
                    <button onClick={onRemove} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10 rounded-[0.5rem] transition-colors"><Trash2 className="w-3.5 h-3.5"/> Remove</button>
                </div>
            </div>
        )}
    </li>
));

interface CharacterVoiceManagerProps {
    characterProfiles: CharacterProfile[];
    setCharacterProfiles: (profiles: CharacterProfile[] | ((prev: CharacterProfile[]) => CharacterProfile[])) => void;
    onOpenCreatorModal: () => void;
    showToast: (message: string) => void;
    voiceProfiles: VoiceProfile[];
    onAddVoiceProfile: (profile: VoiceProfile) => void;
}

export const CharacterVoiceManager: React.FC<CharacterVoiceManagerProps> = React.memo(({ 
    characterProfiles, setCharacterProfiles, onOpenCreatorModal, showToast, voiceProfiles, onAddVoiceProfile
}) => {
    const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const importProfilesRef = useRef<HTMLInputElement>(null);

    const handleUpdateCharacter = (id: string, field: keyof CharacterProfile, value: string | boolean) => {
        setCharacterProfiles(prev => {
            const profiles = Array.isArray(prev) ? prev : [];
            return profiles.map(p => p.id === id ? { ...p, [field]: value } : p);
        });
    };

    const handleAddCharacterManually = () => {
        const newProfile: CharacterProfile = {
            id: Date.now().toString() + Math.random().toString(),
            name: 'New Character', voice: '', gender: 'unspecified',
            backstory: '', motivations: '', relationships: '',
            isActive: true,
        };
        setCharacterProfiles(prev => {
            const profiles = Array.isArray(prev) ? prev : [];
            return [...profiles, newProfile];
        });
        setExpandedProfile(newProfile.id);
        showToast("New character added.");
    };

    const handleSaveToLibrary = (profile: CharacterProfile) => {
        const voiceProfile: VoiceProfile = {
            id: profile.id,
            name: profile.name,
            archetype: profile.backstory,
            patterns: profile.voice.split(',').map(s => s.trim()).filter(s => s !== ''),
            idioms: [],
            lastModified: new Date().toISOString(),
            isActive: true
        };
        onAddVoiceProfile(voiceProfile);
        showToast(`${profile.name || 'Character'} saved to library.`);
    };

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;
        setCharacterProfiles(prev => {
            const profiles = Array.isArray(prev) ? [...prev] : [];
            const [draggedItem] = profiles.splice(draggedItemIndex, 1);
            profiles.splice(index, 0, draggedItem);
            return profiles;
        });
        setDraggedItemIndex(index);
    };

    const handleExportCharacters = () => {
        if (characterProfiles.length === 0) {
            showToast("No character profiles to export.");
            return;
        }
        const blob = new Blob([JSON.stringify(characterProfiles, null, 2)], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'echo-characters.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Character profiles exported.");
    };

    const handleImportCharacters = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const importedProfiles = JSON.parse(content);
                    if (!Array.isArray(importedProfiles)) throw new Error("File is not a valid profile array.");
                    
                    const newProfiles = importedProfiles.map((p: any) => ({
                         id: p.id || Date.now().toString() + Math.random().toString(),
                         name: p.name || 'Unnamed Imported Character', voice: p.voice || '',
                         gender: p.gender || 'unspecified', backstory: p.backstory || '',
                         motivations: p.motivations || '', relationships: p.relationships || '',
                         isActive: true,
                    }));
                    
                    setCharacterProfiles(prev => {
                        const profiles = Array.isArray(prev) ? prev : [];
                        return [...profiles, ...newProfiles];
                    });
                    
                    // Auto-save imported to library
                    newProfiles.forEach(p => {
                        const voiceProfile: VoiceProfile = {
                            id: p.id,
                            name: p.name,
                            archetype: p.backstory,
                            patterns: p.voice.split(',').map(s => s.trim()).filter(s => s !== ''),
                            idioms: [],
                            lastModified: new Date().toISOString(),
                            isActive: true
                        };
                        onAddVoiceProfile(voiceProfile);
                    });
                    
                    showToast(`${newProfiles.length} character(s) imported successfully.`);
                } catch (error) {
                    console.error("Failed to import characters:", error);
                    showToast(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                    if (event.target) event.target.value = '';
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium">Active Character Voices</label>
                <div className="flex items-center gap-1">
                    <input type="file" ref={importProfilesRef} onChange={handleImportCharacters} accept=".json" className="hidden" />
                    <button onClick={() => importProfilesRef.current?.click()} title="Import Profiles" className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors"><FileUp className="w-4 h-4" /></button>
                    <button onClick={handleExportCharacters} title="Export Profiles" className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors"><FileDown className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="space-y-3">
                <ul className="space-y-2">
                    {characterProfiles.map((profile, index) => (
                        <CharacterProfileItem 
                            key={profile.id}
                            profile={profile}
                            isExpanded={expandedProfile === profile.id}
                            isDragged={draggedItemIndex === index}
                            onToggleExpand={() => setExpandedProfile(p => p === profile.id ? null : profile.id)}
                            onUpdate={(field, value) => handleUpdateCharacter(profile.id, field, value)}
                            onRemove={() => setCharacterProfiles(prev => {
                                const profiles = Array.isArray(prev) ? prev : [];
                                return profiles.filter(i => i.id !== profile.id);
                            })}
                            onSaveToLibrary={() => handleSaveToLibrary(profile)}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={() => setDraggedItemIndex(null)}
                        />
                    ))}
                </ul>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <button onClick={onOpenCreatorModal} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 px-2 py-1.5 font-medium transition-colors rounded-[0.5rem] hover:bg-primary/5"><Sparkles className="w-4 h-4" /> Add with AI</button>
                    <button onClick={handleAddCharacterManually} className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface px-2 py-1.5 font-medium transition-colors rounded-[0.5rem] hover:bg-surface-container-highest"><PlusCircle className="w-4 h-4" /> Add Manually</button>
                </div>

                <div className="mt-5 pt-4 border-t border-outline-variant/20">
                    <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-3 flex items-center gap-1.5"><Library className="w-3.5 h-3.5"/> Voice Library</label>
                    
                    <div className="flex items-center gap-2 w-full">
                        <select 
                            value={selectedLibraryId}
                            onChange={(e) => setSelectedLibraryId(e.target.value)}
                            className="bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 text-sm flex-grow text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        >
                            <option value="">-- Select stored voice --</option>
                            {voiceProfiles.map(v => (
                                <option key={v.id} value={v.id}>{v.name || 'Unnamed Character'}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => {
                                if (selectedLibraryId) {
                                    const v = voiceProfiles.find(p => p.id === selectedLibraryId);
                                    if (v) {
                                        setCharacterProfiles(prev => {
                                            const profiles = Array.isArray(prev) ? prev : [];
                                            if (!profiles.find(p => p.name === v.name)) {
                                                return [...profiles, {
                                                    id: v.id,
                                                    name: v.name,
                                                    voice: v.patterns.join(', '),
                                                    gender: 'unspecified',
                                                    backstory: v.archetype,
                                                    motivations: '',
                                                    relationships: '',
                                                    isActive: true
                                                }];
                                            }
                                            return profiles;
                                        });
                                        showToast(`${v.name || 'Character'} added to active voices.`);
                                    }
                                    setSelectedLibraryId('');
                                }
                            }}
                            disabled={!selectedLibraryId}
                            className="p-2.5 bg-primary hover:bg-primary/90 rounded-[0.75rem] text-on-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            title="Add to active voices"
                        >
                            <PlusCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

