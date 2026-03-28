import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Download, Upload, Search, PenTool, Users, Plus, Trash2, Sparkles, User, X, ChevronRight } from 'lucide-react';
import { VoiceProfile, AuthorVoice } from '../types';
import { VoiceProfileForm } from './forms/VoiceProfileForm';
import { AuthorVoiceForm } from './forms/AuthorVoiceForm';
import { motion } from 'motion/react';
import { useLore } from '../contexts/LoreContext';

interface VoicesScreenProps {
  onClose: () => void;
}

export function VoicesScreen({ 
  onClose
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
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50]"
      />

      {/* Drawer */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-[95vw] md:w-[70vw] lg:w-[50vw] max-w-3xl bg-surface-container-lowest/95 backdrop-blur-xl shadow-2xl border-l border-outline-variant/20 z-[60] flex flex-col overflow-hidden"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container-highest transition-colors z-20"
        >
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>

        <div className="flex-1 min-h-0 flex flex-col p-6 md:p-10 lg:p-12">
          {/* Header Section */}
          <section className="mb-8 flex flex-col gap-4 shrink-0">
            <div className="max-w-2xl">
              <h2 className="font-headline text-3xl md:text-4xl font-light tracking-tight mb-2">Voice Profiles</h2>
              <p className="font-headline italic text-sm text-on-surface-variant">
                Soul-Patterns and Dialogue DNA to anchor personality.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExport}
                className="p-2 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all"
                title="Export JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all"
                title="Import JSON"
              >
                <Upload className="w-4 h-4" />
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
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8">
            {/* Left Pane: List (1/3) */}
            <div className={`w-full lg:w-[35%] flex flex-col gap-6 min-h-0 ${isMobile && (editingProfile || editingAuthorVoice || isCreating) ? 'hidden' : 'flex'}`}>
              {/* Search Bar */}
              <div className="relative w-full shrink-0">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="text-primary/50 w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Voices..." 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-full py-2.5 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-body text-xs outline-none"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex overflow-x-auto custom-scrollbar pb-2 shrink-0 gap-2 w-full">
                <button 
                  onClick={() => { setActiveTab('author'); handleCloseForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border whitespace-nowrap font-label text-[9px] uppercase tracking-widest transition-all duration-300 ${
                    activeTab === 'author' ? 'bg-secondary text-on-secondary border-secondary' : 'border-outline-variant/30 hover:bg-secondary/10 text-on-surface-variant'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  Author
                </button>
                <button 
                  onClick={() => { setActiveTab('character'); handleCloseForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border whitespace-nowrap font-label text-[9px] uppercase tracking-widest transition-all duration-300 ${
                    activeTab === 'character' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/30 hover:bg-primary/10 text-on-surface-variant'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  Character
                </button>
              </div>

              {/* Entry List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {activeTab === 'author' ? (
                  filteredAuthorVoices.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant text-xs">
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
                          <span className="font-label text-[8px] uppercase tracking-widest text-secondary flex items-center gap-1">
                            {voice.isActive && <Sparkles className="w-2.5 h-2.5" />}
                            {voice.isActive ? 'Active' : 'Author'}
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
                        <h4 className="font-headline text-sm mb-1 text-on-surface">{voice.name}</h4>
                        <p className="font-body text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed italic">
                          {voice.narrativeStyle || "No style description defined."}
                        </p>
                      </div>
                    ))
                  )
                ) : (
                  filteredCharacterVoices.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant text-xs">
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
                          <span className="font-label text-[8px] uppercase tracking-widest text-primary flex items-center gap-1">
                            {voice.isActive && <Sparkles className="w-2.5 h-2.5" />}
                            {voice.isActive ? 'Active' : 'Character'}
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
                        <h4 className="font-headline text-sm mb-1 text-on-surface">{voice.name}</h4>
                        <p className="font-body text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                          {voice.archetype || "No archetype defined."}
                        </p>
                      </div>
                    ))
                  )
                )}
              </div>
              
              <button 
                onClick={handleAddNew}
                className={`w-full py-3 rounded-2xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant transition-all flex items-center justify-center gap-2 font-label text-[10px] uppercase tracking-widest shrink-0 ${
                  activeTab === 'author' 
                    ? 'hover:text-secondary hover:border-secondary/30 hover:bg-secondary/5' 
                    : 'hover:text-primary hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                New {activeTab === 'author' ? 'Author' : 'Character'}
              </button>
            </div>

            {/* Right Pane: Edit Form (2/3) */}
            <div className={`w-full lg:w-[65%] h-full ${isMobile && !(editingProfile || editingAuthorVoice || isCreating) ? 'hidden' : 'block'}`}>
              {isCreating || editingAuthorVoice || editingProfile ? (
                <div className="flex flex-col h-full">
                  {isMobile && (
                    <button 
                      onClick={handleCloseForm}
                      className={`flex items-center gap-2 mb-4 font-label text-[10px] uppercase tracking-widest ${activeTab === 'author' ? 'text-secondary' : 'text-primary'}`}
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Back to List
                    </button>
                  )}
                  {activeTab === 'author' ? (
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
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-surface-container-lowest/50 rounded-3xl border border-outline-variant/10">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6">
                    {activeTab === 'author' ? (
                      <PenTool className="w-8 h-8 text-on-surface-variant/30" />
                    ) : (
                      <User className="w-8 h-8 text-on-surface-variant/30" />
                    )}
                  </div>
                  <h3 className="text-xl font-headline font-light text-on-surface mb-2">Select a Voice</h3>
                  <p className="text-on-surface-variant text-sm max-w-xs">
                    Choose a {activeTab === 'author' ? 'author' : 'character'} voice from the list to view or edit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default VoicesScreen;
