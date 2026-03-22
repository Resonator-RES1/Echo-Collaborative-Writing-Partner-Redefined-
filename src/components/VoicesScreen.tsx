import React, { useState, useRef } from 'react';
import { User, UserPlus, Mic2, Quote, Brain, Plus, Download, Upload, Trash2, PenTool, Sparkles } from 'lucide-react';
import { VoiceProfile, Screen, AuthorVoice } from '../types';
import { VoiceProfileForm } from './forms/VoiceProfileForm';
import { AuthorVoiceForm } from './forms/AuthorVoiceForm';

interface VoicesScreenProps {
  setCurrentScreen: (screen: Screen) => void;
  voiceProfiles: VoiceProfile[];
  authorVoices: AuthorVoice[];
  onAddProfile: (profile: VoiceProfile) => void;
  onDeleteProfile: (id: string) => void;
  onAddAuthorVoice: (voice: AuthorVoice) => void;
  onDeleteAuthorVoice: (id: string) => void;
  onImportProfiles: (profiles: VoiceProfile[]) => void;
  onImportAuthorVoices: (voices: AuthorVoice[]) => void;
}

export function VoicesScreen({ 
  setCurrentScreen, 
  voiceProfiles, 
  authorVoices,
  onAddProfile, 
  onDeleteProfile, 
  onAddAuthorVoice,
  onDeleteAuthorVoice,
  onImportProfiles,
  onImportAuthorVoices
}: VoicesScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<VoiceProfile | undefined>(undefined);
  const [editingAuthorVoice, setEditingAuthorVoice] = useState<AuthorVoice | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authorFileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (profile: VoiceProfile) => {
    onAddProfile(profile);
    setShowForm(false);
    setEditingProfile(undefined);
  };

  const handleSaveAuthorVoice = (voice: AuthorVoice) => {
    onAddAuthorVoice(voice);
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
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const profiles = JSON.parse(content);
        if (Array.isArray(profiles)) {
          onImportProfiles(profiles);
        }
      } catch (error) {
        console.error("Failed to import voice profiles:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleExportAuthorVoices = () => {
    const dataStr = JSON.stringify(authorVoices, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'echo-author-voices.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportAuthorVoices = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const voices = JSON.parse(content);
        if (Array.isArray(voices)) {
          onImportAuthorVoices(voices);
        }
      } catch (error) {
        console.error("Failed to import author voices:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 relative">
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
        <div className="lg:col-span-12 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-headline text-3xl flex items-center gap-3">
                Author Voices
                <PenTool className="text-secondary w-7 h-7" />
              </h3>
              <span className="font-label text-xs font-normal text-on-surface-variant py-1 px-3 bg-surface-container rounded-full uppercase tracking-tighter">
                {String(authorVoices.length).padStart(2, '0')} Styles
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExportAuthorVoices}
                className="p-2 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-secondary transition-all"
                title="Export Author Voices"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => authorFileInputRef.current?.click()}
                className="p-2 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-secondary transition-all"
                title="Import Author Voices"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={authorFileInputRef} 
                onChange={handleImportAuthorVoices} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorVoices.map(voice => (
              <div 
                key={voice.id} 
                onClick={() => handleEditAuthorVoice(voice)}
                className={`glass-slab p-6 rounded-2xl border transition-all duration-500 group cursor-pointer ${voice.isActive ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/20' : 'border-outline-variant/10 hover:border-secondary/30'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${voice.isActive ? 'bg-secondary text-on-secondary' : 'bg-secondary/10 text-secondary'}`}>
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {voice.isActive && (
                      <span className="font-label text-[9px] uppercase tracking-widest text-secondary bg-secondary/10 py-1 px-2 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2 h-2" />
                        Active Master
                      </span>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteAuthorVoice(voice.id); }}
                      className="text-on-surface-variant/30 hover:text-error transition-colors"
                      title="Delete Author Voice"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <h4 className="font-headline text-xl mb-2 group-hover:text-secondary transition-colors">{voice.name}</h4>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 italic">
                  {voice.narrativeStyle || "No style description defined."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 bg-surface-container rounded-[4px] text-[9px] text-on-surface-variant uppercase tracking-wider">Prose</span>
                  <span className="px-2 py-0.5 bg-surface-container rounded-[4px] text-[9px] text-on-surface-variant uppercase tracking-wider">Pacing</span>
                </div>
              </div>
            ))}

            <div 
              onClick={handleAddNewAuthor}
              className="group border border-dashed border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-secondary/40 transition-all duration-500 cursor-pointer bg-surface-container/10"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                <Plus className="text-on-surface-variant group-hover:text-secondary transition-colors w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="font-headline text-lg">New Author Voice</h4>
                <p className="font-body text-[10px] text-on-surface-variant">Define the global narrative DNA.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Character Profiles Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-2xl flex items-center gap-3">
              Soul-Patterns
              <span className="font-label text-xs font-normal text-on-surface-variant py-1 px-3 bg-surface-container rounded-full uppercase tracking-tighter">
                {String(voiceProfiles.length).padStart(2, '0')} Entities
              </span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {voiceProfiles.map(profile => (
              <div 
                key={profile.id} 
                onClick={() => handleEditProfile(profile)}
                className="glass-slab p-8 rounded-[0.75rem] border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="text-primary w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/50">{profile.archetype}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteProfile(profile.id); }}
                      className="text-on-surface-variant/30 hover:text-error transition-colors"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <h4 className="font-headline text-2xl mb-4 group-hover:text-primary transition-colors">{profile.name}</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Signature Traits</span>
                    <div className="flex flex-wrap gap-2">
                      {profile.signatureTraits?.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-surface-container rounded text-[10px] text-on-surface-variant">{t}</span>
                      ))}
                      {profile.signatureTraits && profile.signatureTraits.length > 3 && (
                        <span className="px-2 py-1 bg-surface-container rounded text-[10px] text-on-surface-variant">+{profile.signatureTraits.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State / New Profile Slot */}
            <div 
              onClick={handleAddNew}
              className="group border border-dashed border-outline-variant/30 rounded-[0.75rem] p-12 flex flex-col items-center justify-center gap-6 hover:border-primary/40 transition-all duration-500 cursor-pointer bg-surface-container/10"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <UserPlus className="text-on-surface-variant group-hover:text-primary transition-colors w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="font-headline text-xl">Summon New Voice</h4>
                <p className="font-body text-xs text-on-surface-variant max-w-[200px]">Define your characters' unique voice patterns for the final polish.</p>
              </div>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Summon Entity</span>
            </div>
          </div>
        </div>

        {/* Linguistic Idioms (Side Column) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="flex flex-col gap-6">
            <h3 className="font-headline text-2xl flex items-center gap-3">
              Linguistic Idioms
              <Mic2 className="text-primary w-6 h-6" />
            </h3>
            
            <div className="space-y-4">
              {voiceProfiles.flatMap(p => p.idioms || []).length === 0 ? (
                /* Empty State for Phrases */
                <div className="glass-slab p-8 rounded-xl border border-dashed border-outline-variant/30 text-center space-y-4">
                  <Quote className="text-on-surface-variant/30 w-10 h-10 mx-auto" />
                  <p className="font-body text-xs text-on-surface-variant italic">
                    "The most powerful words are those yet to be captured."
                  </p>
                  <button 
                    onClick={handleAddNew}
                    className="font-label text-[10px] uppercase tracking-widest text-primary hover:underline"
                  >
                    Add First Phrase
                  </button>
                </div>
              ) : (
                voiceProfiles.flatMap(p => p.idioms || []).slice(0, 10).map((idiom, i) => (
                  <div key={i} className="glass-slab p-4 rounded-lg border border-outline-variant/10 italic text-sm text-on-surface-variant">
                    {idiom}
                  </div>
                ))
              )}
              {voiceProfiles.flatMap(p => p.idioms || []).length > 10 && (
                <p className="text-center text-[10px] font-label uppercase tracking-widest text-on-surface-variant/40">
                  + {voiceProfiles.flatMap(p => p.idioms || []).length - 10} more idioms in archives
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Character Creator FAB */}
      <button 
        onClick={handleAddNew}
        className="fixed bottom-24 right-8 z-[60] flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary-fixed shadow-[0_15px_30px_rgba(183,159,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-500 group"
      >
        <Brain className="w-5 h-5" />
        <span className="font-label text-xs uppercase font-bold tracking-[0.15em]">Voice Designer</span>
      </button>

      {showForm && (
        <VoiceProfileForm 
          onClose={() => setShowForm(false)} 
          onSave={handleSaveProfile}
          initialData={editingProfile}
        />
      )}

      {showAuthorForm && (
        <AuthorVoiceForm
          onClose={() => setShowAuthorForm(false)}
          onSave={handleSaveAuthorVoice}
          initialData={editingAuthorVoice}
        />
      )}
    </div>
  );
}

