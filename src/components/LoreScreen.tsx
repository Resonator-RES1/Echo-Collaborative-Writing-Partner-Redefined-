import React, { useState, useRef } from 'react';
import { Search, Filter, BookOpen, Plus, Download, Upload, Trash2 } from 'lucide-react';
import { LoreEntry, Screen } from '../types';
import { LoreEntryForm } from './forms/LoreEntryForm';
import { BulkLoreExtractorModal } from './BulkExtractorModals';
import { Sparkles } from 'lucide-react';

interface LoreScreenProps {
  setCurrentScreen: (screen: Screen) => void;
  loreEntries: LoreEntry[];
  onAddEntry: (entry: LoreEntry) => void;
  onDeleteEntry: (id: string) => void;
  onImportEntries: (entries: LoreEntry[]) => void;
}

export function LoreScreen({ setCurrentScreen, loreEntries, onAddEntry, onDeleteEntry, onImportEntries }: LoreScreenProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LoreEntry | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveEntry = (entry: LoreEntry) => {
    onAddEntry(entry);
    setShowForm(false);
    setEditingEntry(undefined);
  };

  const handleEditEntry = (entry: LoreEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingEntry(undefined);
    setShowForm(true);
  };

  const handleAddBulk = (newEntries: LoreEntry[]) => {
    newEntries.forEach(entry => onAddEntry(entry));
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
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const entries = JSON.parse(content);
        if (Array.isArray(entries)) {
          onImportEntries(entries);
        }
      } catch (error) {
        console.error("Failed to import lore entries:", error);
      }
    };
    reader.readAsText(file);
  };

  const filteredEntries = activeCategory === 'All' 
    ? loreEntries 
    : loreEntries.filter(e => e.category === activeCategory);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Search & Filter Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="font-headline text-4xl md:text-5xl font-light text-on-surface">Lore Codex</h2>
            <p className="font-label text-xs uppercase tracking-[0.3em] text-primary/60">World Bible & Context</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowBulkModal(true)}
                className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all"
                title="Bulk AI Extract"
              >
                <Sparkles className="w-5 h-5" />
              </button>
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
            <div className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="text-primary/50 w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Search Lore Archives..." 
                className="w-full bg-surface-container-lowest border-none rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 transition-all duration-500 font-body text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Search & Filters */}
        <div className="lg:col-span-3 space-y-10">
          <div className="space-y-6">
            <h3 className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Lore Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'World Mechanics', 'Geography & Ecology', 'Societal Strata', 'Historical Context', 'Current State'].map((filter) => (
                <button 
                  key={filter} 
                  onClick={() => setActiveCategory(filter)}
                  className={`px-4 py-2 rounded-full border border-outline-variant/30 font-label text-[10px] uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === filter ? 'bg-primary text-on-primary border-primary' : 'hover:bg-primary/10'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lore List */}
        <div className="lg:col-span-9 space-y-12">
          {filteredEntries.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-on-surface-variant/40" />
              </div>
              <div className="space-y-2">
                <h4 className="font-headline text-2xl font-light">The Codex is empty</h4>
                <p className="font-body text-on-surface-variant max-w-xs mx-auto text-sm">
                  Add major lore elements here to provide Echo with the context it needs for a final polish.
                </p>
              </div>
              <button 
                onClick={handleAddNew}
                className="px-8 py-3 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-500 shadow-lg shadow-primary/20"
              >
                Add Lore Entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEntries.map(entry => (
                <div 
                  key={entry.id} 
                  onClick={() => handleEditEntry(entry)}
                  className="glass-slab p-6 rounded-[0.75rem] border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-label text-[10px] uppercase tracking-widest text-primary">{entry.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-label text-[9px] text-on-surface-variant/50">{new Date(entry.lastModified).toLocaleDateString()}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteEntry(entry.id); }}
                        className="text-on-surface-variant/30 hover:text-error transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-headline text-xl mb-2 group-hover:text-primary transition-colors">{entry.title}</h4>
                  <p className="font-body text-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={handleAddNew}
        className="fixed bottom-24 right-8 lg:bottom-12 lg:right-12 w-16 h-16 rounded-full lore-gradient shadow-[0_10px_30px_rgba(208,192,255,0.3)] flex items-center justify-center text-on-primary-fixed z-40 hover:scale-110 transition-transform duration-500"
      >
        <Plus className="w-8 h-8" />
      </button>

      {showForm && (
        <LoreEntryForm 
          onClose={() => setShowForm(false)} 
          onSave={handleSaveEntry}
          initialData={editingEntry}
        />
      )}

      {showBulkModal && (
        <BulkLoreExtractorModal
          onClose={() => setShowBulkModal(false)}
          onAddEntries={handleAddBulk}
        />
      )}
    </div>
  );
}

