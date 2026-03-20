import React, { useState, useRef, useEffect } from 'react';
import { CharacterProfile } from '../../../src/types';
import { FileUp, FileDown, Sparkles, PlusCircle, GripVertical, ChevronDown, Trash2, Save, Library } from 'lucide-react';

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
        className={`bg-gray-700/50 rounded-md transition-opacity ${isDragged ? 'opacity-50' : ''}`}
    >
        <div className="w-full flex justify-between items-center p-3 text-left font-medium">
            <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-500 cursor-move" />
                <input 
                    type="checkbox" 
                    checked={profile.isActive !== false} 
                    onChange={(e) => onUpdate('isActive', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 cursor-pointer"
                    title="Include in refinement"
                />
                <button onClick={onToggleExpand} className={`truncate hover:text-purple-300 ${profile.isActive === false ? 'text-gray-500 line-through' : ''}`}>
                    {profile.name || 'New Character'}
                </button>
            </div>
            <button onClick={onToggleExpand}>
                <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
        {isExpanded && (
            <div className="p-3 border-t border-gray-600 space-y-3 text-sm">
                <input type="text" placeholder="Character Name" value={profile.name} onChange={(e) => onUpdate('name', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500" />
                <textarea placeholder="Voice & Diction" value={profile.voice} onChange={(e) => onUpdate('voice', e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
                <select value={profile.gender} onChange={(e) => onUpdate('gender', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                    <option value="unspecified">Unspecified Gender</option> <option value="male">Male</option> <option value="female">Female</option> <option value="non-binary">Non-binary</option>
                </select>
                <textarea placeholder="Backstory" value={profile.backstory} onChange={(e) => onUpdate('backstory', e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
                <textarea placeholder="Motivations" value={profile.motivations} onChange={(e) => onUpdate('motivations', e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
                <textarea placeholder="Relationships" value={profile.relationships} onChange={(e) => onUpdate('relationships', e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={onSaveToLibrary} className="flex items-center gap-1 px-2 py-1 text-xs text-blue-400 hover:bg-blue-900/50 rounded-md" title="Save to reusable library"><Save className="w-3 h-3"/> Save to Library</button>
                    <button onClick={onRemove} className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:bg-red-900/50 rounded-md"><Trash2 className="w-3 h-3"/> Remove</button>
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
}

export const CharacterVoiceManager: React.FC<CharacterVoiceManagerProps> = React.memo(({ 
    characterProfiles, setCharacterProfiles, onOpenCreatorModal, showToast 
}) => {
    const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const importProfilesRef = useRef<HTMLInputElement>(null);

    const [voiceLibrary, setVoiceLibrary] = useState<CharacterProfile[]>(() => {
        try {
            const saved = localStorage.getItem('echo-voice-library');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('echo-voice-library', JSON.stringify(voiceLibrary));
    }, [voiceLibrary]);

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
        setVoiceLibrary(prev => {
            const exists = prev.findIndex(p => p.id === profile.id);
            if (exists >= 0) {
                const next = [...prev];
                next[exists] = profile;
                return next;
            }
            return [...prev, profile];
        });
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
                    setVoiceLibrary(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const toAdd = newProfiles.filter(p => !existingIds.has(p.id));
                        return [...prev, ...toAdd];
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
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Active Character Voices</label>
                <div className="flex items-center gap-2">
                    <input type="file" ref={importProfilesRef} onChange={handleImportCharacters} accept=".json" className="hidden" />
                    <button onClick={() => importProfilesRef.current?.click()} title="Import Profiles" className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-700"><FileUp className="w-4 h-4" /></button>
                    <button onClick={handleExportCharacters} title="Export Profiles" className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-700"><FileDown className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="space-y-2">
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
                <div className="mt-2 flex items-center gap-4 flex-wrap">
                    <button onClick={onOpenCreatorModal} className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 p-1 font-semibold"><Sparkles className="w-4 h-4" /> Add with AI</button>
                    <button onClick={handleAddCharacterManually} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-1"><PlusCircle className="w-4 h-4" /> Add Manually</button>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-700">
                    <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1"><Library className="w-3 h-3"/> Voice Library</label>
                    <div className="flex items-center gap-2 w-full">
                        <select 
                            value={selectedLibraryId}
                            onChange={(e) => setSelectedLibraryId(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-md p-1.5 text-sm flex-grow text-gray-200 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">-- Select stored voice --</option>
                            {voiceLibrary.map(v => (
                                <option key={v.id} value={v.id}>{v.name || 'Unnamed Character'}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => {
                                if (selectedLibraryId) {
                                    const profile = voiceLibrary.find(p => p.id === selectedLibraryId);
                                    if (profile) {
                                        setCharacterProfiles(prev => {
                                            const profiles = Array.isArray(prev) ? prev : [];
                                            if (!profiles.find(p => p.id === profile.id)) {
                                                return [...profiles, { ...profile, isActive: true }];
                                            }
                                            return profiles;
                                        });
                                        showToast(`${profile.name || 'Character'} added to active voices.`);
                                    }
                                    setSelectedLibraryId('');
                                }
                            }}
                            disabled={!selectedLibraryId}
                            className="p-1.5 bg-purple-600 hover:bg-purple-700 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Add to active voices"
                        >
                            <PlusCircle className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => {
                                if (selectedLibraryId) {
                                    setVoiceLibrary(prev => prev.filter(p => p.id !== selectedLibraryId));
                                    showToast("Removed from library.");
                                    setSelectedLibraryId('');
                                }
                            }}
                            disabled={!selectedLibraryId}
                            className="p-1.5 bg-red-600/80 hover:bg-red-700 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Remove from stored voices"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

