import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search, Filter, BookOpen, Plus, Download, Upload, Trash2, ChevronRight, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { LoreEntry, Screen } from '../types';
import { LoreEntryForm } from './forms/LoreEntryForm';
import { getEmbedding } from '../utils/contextScanner';

import { useLore } from '../contexts/LoreContext';

interface LoreScreenProps {
  setCurrentScreen: (screen: Screen) => void;
}

export function LoreScreen({ setCurrentScreen }: LoreScreenProps) {
  const { loreEntries, addLoreEntry, deleteLoreEntry, importLoreEntries } = useLore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEntry, setEditingEntry] = useState<LoreEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveEntry = async (entry: LoreEntry) => {
    await addLoreEntry(entry);
    setIsCreating(false);
    setEditingEntry(entry); // Keep it selected after saving
  };

  const handleSyncEmbeddings = async () => {
    const entriesToSync = loreEntries.filter(e => !e.embedding);
    if (entriesToSync.length === 0) return;

    setIsSyncing(true);
    try {
      for (const entry of entriesToSync) {
        const embedding = await getEmbedding(`${entry.title}: ${entry.content}`);
        if (embedding) {
          await addLoreEntry({ ...entry, embedding });
        }
      }
    } catch (error) {
      console.error("Failed to sync embeddings:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditEntry = (entry: LoreEntry) => {
    setEditingEntry(entry);
    setIsCreating(false);
  };

  const handleAddNew = () => {
    setEditingEntry(undefined);
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(loreEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'echo-lore-codex.json';
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
        const entries = JSON.parse(content);
        if (Array.isArray(entries)) {
          await importLoreEntries(entries);
        }
      } catch (error) {
        console.error("Failed to import lore entries:", error);
      }
    };
    reader.readAsText(file);
  };

  const filteredEntries = useMemo(() => {
    return loreEntries.filter(entry => {
      const matchesCategory = activeCategory === 'All' || entry.category === activeCategory;
      const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            entry.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [loreEntries, activeCategory, searchQuery]);

  const categories = [
    'All',
    'Characters',
    'Locations',
    'Items',
    'World Mechanics',
    'Timeline',
    'Geography & Ecology',
    'Societal Strata',
    'Historical Context',
    'Current State',
    'Other'
  ];

  const unsyncedCount = useMemo(() => loreEntries.filter(e => !e.embedding).length, [loreEntries]);

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-700">
      {/* Header Section */}
      <section className="shrink-0 mb-4 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-1 md:space-y-2">
            <h2 className="font-headline text-3xl md:text-5xl font-light text-on-surface">Lore Codex</h2>
            <p className="font-label text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary/60">World Bible & Context</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {unsyncedCount > 0 && (
                <button 
                  onClick={handleSyncEmbeddings}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-label text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50"
                  title={`Generate embeddings for ${unsyncedCount} entries`}
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>{isSyncing ? 'Syncing Intelligence...' : `Sync Intelligence (${unsyncedCount})`}</span>
                </button>
              )}
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
          </div>
        </div>
      </section>

      {/* Main Content Split Pane */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8">
        {/* Left Pane: List (1/3) */}
        <div className={`w-full lg:w-1/3 flex flex-col gap-6 min-h-0 ${isMobile && (isCreating || editingEntry) ? 'hidden' : 'flex'}`}>
          {/* Search Bar */}
          <div className="relative w-full shrink-0">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-primary/50 w-5 h-5" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Lore Archives..." 
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-full py-3 pl-12 pr-6 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-body text-sm outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar pb-2 shrink-0 gap-2">
            {categories.map((filter) => (
              <button 
                key={filter} 
                onClick={() => setActiveCategory(filter)}
                className={`px-4 py-2 rounded-full border whitespace-nowrap font-label text-[10px] uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === filter ? 'bg-primary text-on-primary-fixed border-primary' : 'border-outline-variant/30 hover:bg-primary/10 text-on-surface-variant'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Entry List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {loreEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
                  <BookOpen className="w-8 h-8 text-on-surface-variant/40" />
                </div>
                <p className="font-body text-on-surface-variant text-sm px-4">
                  No lore yet? Start by adding your protagonist to keep Echo consistent.
                </p>
                <button 
                  onClick={handleAddNew}
                  className="px-6 py-2 rounded-full bg-primary/10 text-primary font-label text-xs uppercase tracking-widest hover:bg-primary/20 transition-all"
                >
                  Add First Entry
                </button>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant text-sm">
                No entries match your search.
              </div>
            ) : (
              filteredEntries.map(entry => (
                <div 
                  key={entry.id} 
                  onClick={() => handleEditEntry(entry)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                    editingEntry?.id === entry.id 
                      ? 'bg-primary/5 border-primary/30 shadow-sm' 
                      : 'bg-surface-container-lowest border-outline-variant/10 hover:border-primary/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label text-[9px] uppercase tracking-widest text-primary">{entry.category}</span>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        deleteLoreEntry(entry.id);
                        if (editingEntry?.id === entry.id) handleCloseForm();
                      }}
                      className="text-on-surface-variant/30 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="font-headline text-base mb-1 text-on-surface">{entry.title}</h4>
                  <p className="font-body text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={handleAddNew}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-label text-xs uppercase tracking-widest shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Lore Entry
          </button>
        </div>

        {/* Right Pane: Edit Form (2/3) */}
        <div className={`w-full lg:w-2/3 h-full ${isMobile && !(isCreating || editingEntry) ? 'hidden' : 'block'}`}>
          {isCreating || editingEntry ? (
            <div className="flex flex-col h-full">
              {isMobile && (
                <button 
                  onClick={handleCloseForm}
                  className="flex items-center gap-2 mb-4 text-primary font-label text-[10px] uppercase tracking-widest"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to List
                </button>
              )}
              <LoreEntryForm 
                onClose={handleCloseForm}
                onSave={handleSaveEntry}
                initialData={editingEntry}
                isModal={false}
                loreEntries={loreEntries}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-surface-container-lowest/50 rounded-3xl border border-outline-variant/10">
              <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-on-surface-variant/30" />
              </div>
              <h3 className="text-2xl font-headline font-light text-on-surface mb-2">Select an Entry</h3>
              <p className="text-on-surface-variant max-w-md">
                Choose a lore entry from the list to view or edit its details, or create a new one to expand your world.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
