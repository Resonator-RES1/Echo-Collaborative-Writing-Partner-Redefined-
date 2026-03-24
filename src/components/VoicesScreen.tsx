import React, { useState, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { VoiceProfile, Screen, AuthorVoice } from '../types';
import { VoiceProfileForm } from './forms/VoiceProfileForm';
import { AuthorVoiceForm } from './forms/AuthorVoiceForm';
import { AuthorVoicesList } from './voices/AuthorVoicesList';
import { CharacterVoicesList } from './voices/CharacterVoicesList';

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

  const [showForm, setShowForm] = useState(false);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<VoiceProfile | undefined>(undefined);
  const [editingAuthorVoice, setEditingAuthorVoice] = useState<AuthorVoice | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (profile: VoiceProfile) => {
    await addVoiceProfile(profile);
    setShowForm(false);
    setEditingProfile(undefined);
  };

  const handleSaveAuthorVoice = async (voice: AuthorVoice) => {
    await addAuthorVoice(voice);
    setShowAuthorForm(false);
    setEditingAuthorVoice(undefined);
  };

  const handleEditProfile = (profile: VoiceProfile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleEditAuthorVoice = (voice: AuthorVoice) => {
    setEditingAuthorVoice(voice);
    setShowAuthorForm(true);
  };

  const handleAddNew = () => {
    setEditingProfile(undefined);
    setShowForm(true);
  };

  const handleAddNewAuthor = () => {
    setEditingAuthorVoice(undefined);
    setShowAuthorForm(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(voiceProfiles, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'echo-voice-profiles.json';
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
        const profiles = JSON.parse(content);
        if (Array.isArray(profiles)) {
          await importVoiceProfiles(profiles);
        }
      } catch (error) {
        console.error("Failed to import voice profiles:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-12 animate-in fade-in duration-700 relative pr-2 scrollbar-thin scroll-smooth">
      {/* Subtle Background Element */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Header Section with Asymmetry */}
      <section className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Author Voices Section */}
        <AuthorVoicesList 
          authorVoices={authorVoices}
          onEdit={handleEditAuthorVoice}
          onAddNew={handleAddNewAuthor}
          onDelete={deleteAuthorVoice}
          onImport={importAuthorVoices}
        />

        {/* Character Voices Section */}
        <CharacterVoicesList
          voiceProfiles={voiceProfiles}
          onEdit={handleEditProfile}
          onAddNew={handleAddNew}
          onDelete={deleteVoiceProfile}
        />

      </div>

      {/* Modals */}
      {showForm && (
        <VoiceProfileForm 
          onClose={() => {
            setShowForm(false);
            setEditingProfile(undefined);
          }} 
          onSave={handleSaveProfile} 
          initialData={editingProfile}
        />
      )}

      {showAuthorForm && (
        <AuthorVoiceForm
          onClose={() => {
            setShowAuthorForm(false);
            setEditingAuthorVoice(undefined);
          }}
          onSave={handleSaveAuthorVoice}
          initialData={editingAuthorVoice}
        />
      )}
    </div>
  );
}
