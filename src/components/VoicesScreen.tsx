import React, { useState, useRef, useMemo } from 'react';
import { Download, Upload, Search, PenTool, Users, Plus, Trash2, Sparkles, User } from 'lucide-react';
import { VoiceProfile, Screen, AuthorVoice } from '../types';
import { VoiceProfileForm } from './forms/VoiceProfileForm';
import { AuthorVoiceForm } from './forms/AuthorVoiceForm';

import { useLore } from '../contexts/LoreContext';

interface VoicesScreenProps {
  setCurrentScreen: (screen: Screen) => void;
}

export function VoicesScreen({ 
  setCurrentScreen
}: VoicesScreenProps) {
  const { 
    voiceProfiles, 
    authorVoices, 
    addVoiceProfile, 
    deleteVoiceProfile, 
    addAuthorVoice, 
    deleteAuthorVoice, 
    importVoiceProfiles, 
    importAuthorVoices 
  } = useLore();

  const [activeTab, setActiveTab] = useState<'author' | 'character'>('author');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingProfile, setEditingProfile] = useState<VoiceProfile | undefined>(undefined);
  const [editingAuthorVoice, setEditingAuthorVoice] = useState<AuthorVoice | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (profile: VoiceProfile) => {
    await addVoiceProfile(profile);
    setIsCreating(false);
    setEditingProfile(profile);
  };

  const handleSaveAuthorVoice = async (voice: AuthorVoice) => {
    await addAuthorVoice(voice);
    setIsCreating(false);
    setEditingAuthorVoice(voice);
  };

  const handleEditProfile = (profile: VoiceProfile) => {
    setEditingProfile(profile);
    setEditingAuthorVoice(undefined);
    setIsCreating(false);
  };

  const handleEditAuthorVoice = (voice: AuthorVoice) => {
    setEditingAuthorVoice(voice);
    setEditingProfile(undefined);
    setIsCreating(false);
  };

  const handleAddNew = () => {
    setEditingProfile(undefined);
    setEditingAuthorVoice(undefined);
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingProfile(undefined);
    setEditingAuthorVoice(undefined);
  };

  const handleExport = () => {
    const dataToExport = activeTab === 'author' ? authorVoices : voiceProfiles;
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = activeTab === 'author' ? 'echo-author-voices.json' : 'echo-character-voices.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          if (activeTab === 'author') {
              await importAuthorVoices(data);
          } else {
              await importVoiceProfiles(data);
          }
        }
      } catch (error) {
        console.error("Failed to import voices:", error);
      }
    };
    reader.readAsText(file);
  };

  const filteredAuthorVoices = useMemo(() => {
    return authorVoices.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.narrativeStyle?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [authorVoices, searchQuery]);

  const filteredCharacterVoices = useMemo(() => {
    return voiceProfiles.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.archetype?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [voiceProfiles, searchQuery]);

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-700">
      {/* Subtle Background Element */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Header Section */}
      <section className="mb-8 flex flex-col md:flex-row justify-between items-end gap-8 shrink-0">
        <div className="max-w-2xl">
          <h2 className="font-headline text-5xl md:text-7xl font-light tracking-tight mb-4">Voice Profiles</h2>
          <p className="font-headline italic text-xl text-on-surface-variant max-w-lg">
            Soul-Patterns and Dialogue DNA to anchor your narrative's distinct personality.
          </p>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={handleExport}
            className="p-3 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all"
            title="Export JSON"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all"
            title="Import JSON"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </section>

      {/* Main Content Split Pane */}
      <div className="flex-1 min-h-0 flex gap-8">
        {/* Left Pane: List (1/3) */}
        <div className="w-1/3 flex flex-col gap-6 min-h-0">
          {/* Search Bar */}
          <div className="relative w-full shrink-0">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-primary/50 w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Voices..." 
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-full py-3 pl-12 pr-6 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-body text-sm outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar pb-2 shrink-0 gap-2">
            <button 
              onClick={() => { setActiveTab('author'); handleCloseForm(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap font-label text-[10px] uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'author' ? 'bg-secondary text-on-secondary border-secondary' : 'border-outline-variant/30 hover:bg-secondary/10 text-on-surface-variant'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Author Voices
            </button>
            <button 
              onClick={() => { setActiveTab('character'); handleCloseForm(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap font-label text-[10px] uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'character' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 hover:bg-primary/10 text-on-surface-variant'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Character Voices
            </button>
          </div>

          {/* Entry List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {activeTab === 'author' ? (
              filteredAuthorVoices.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant text-sm">
                  No author voices found.
                </div>
              ) : (
                filteredAuthorVoices.map(voice => (
                  <div 
                    key={voice.id} 
                    onClick={() => handleEditAuthorVoice(voice)}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                      editingAuthorVoice?.id === voice.id 
                        ? 'bg-secondary/5 border-secondary/30 shadow-sm' 
                        : 'bg-surface-container-lowest border-outline-variant/10 hover:border-secondary/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-label text-[9px] uppercase tracking-widest text-secondary flex items-center gap-1">
                        {voice.isActive && <Sparkles className="w-2.5 h-2.5" />}
                        {voice.isActive ? 'Active Master' : 'Author Voice'}
                      </span>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          deleteAuthorVoice(voice.id);
                          if (editingAuthorVoice?.id === voice.id) handleCloseForm();
                        }}
                        className="text-on-surface-variant/30 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Voice"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <h4 className="font-headline text-base mb-1 text-on-surface">{voice.name}</h4>
                    <p className="font-body text-xs text-on-surface-variant line-clamp-2 leading-relaxed italic">
                      {voice.narrativeStyle || "No style description defined."}
                    </p>
                  </div>
                ))
              )
            ) : (
              filteredCharacterVoices.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant text-sm">
                  No character voices found.
                </div>
              ) : (
                filteredCharacterVoices.map(voice => (
                  <div 
                    key={voice.id} 
                    onClick={() => handleEditProfile(voice)}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                      editingProfile?.id === voice.id 
                        ? 'bg-primary/5 border-primary/30 shadow-sm' 
                        : 'bg-surface-container-lowest border-outline-variant/10 hover:border-primary/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-label text-[9px] uppercase tracking-widest text-primary flex items-center gap-1">
                        {voice.isActive && <Sparkles className="w-2.5 h-2.5" />}
                        {voice.isActive ? 'Active Context' : 'Character Voice'}
                      </span>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          deleteVoiceProfile(voice.id);
                          if (editingProfile?.id === voice.id) handleCloseForm();
                        }}
                        className="text-on-surface-variant/30 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Voice"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <h4 className="font-headline text-base mb-1 text-on-surface">{voice.name}</h4>
                    <p className="font-body text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {voice.archetype || "No archetype defined."}
                    </p>
                  </div>
                ))
              )
            )}
          </div>
          
          <button 
            onClick={handleAddNew}
            className={`w-full py-4 rounded-2xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant transition-all flex items-center justify-center gap-2 font-label text-xs uppercase tracking-widest shrink-0 ${
              activeTab === 'author' 
                ? 'hover:text-secondary hover:border-secondary/30 hover:bg-secondary/5' 
                : 'hover:text-primary hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <Plus className="w-4 h-4" />
            New {activeTab === 'author' ? 'Author' : 'Character'} Voice
          </button>
        </div>

        {/* Right Pane: Edit Form (2/3) */}
        <div className="w-2/3 h-full">
          {isCreating || editingAuthorVoice || editingProfile ? (
            activeTab === 'author' ? (
              <AuthorVoiceForm
                onClose={handleCloseForm}
                onSave={handleSaveAuthorVoice}
                initialData={editingAuthorVoice}
                isModal={false}
              />
            ) : (
              <VoiceProfileForm 
                onClose={handleCloseForm}
                onSave={handleSaveProfile}
                initialData={editingProfile}
                isModal={false}
              />
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-surface-container-lowest/50 rounded-3xl border border-outline-variant/10">
              <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
                {activeTab === 'author' ? (
                  <PenTool className="w-10 h-10 text-on-surface-variant/30" />
                ) : (
                  <User className="w-10 h-10 text-on-surface-variant/30" />
                )}
              </div>
              <h3 className="text-2xl font-headline font-light text-on-surface mb-2">Select a Voice Profile</h3>
              <p className="text-on-surface-variant max-w-md">
                Choose a {activeTab === 'author' ? 'author' : 'character'} voice from the list to view or edit its details, or create a new one to define your narrative's personality.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
