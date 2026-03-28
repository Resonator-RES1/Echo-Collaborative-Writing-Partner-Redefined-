import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search, BookOpen, Plus, Download, Upload, Trash2, ChevronRight, X } from 'lucide-react';
import { LoreEntry } from '../types';
import { LoreEntryForm } from './forms/LoreEntryForm';
import { motion, AnimatePresence } from 'motion/react';


import { useLore } from '../contexts/LoreContext';

interface LoreScreenProps {
  onClose: () => void;
}

export function LoreScreen({ onClose }: LoreScreenProps) {
  const { loreEntries, addLoreEntry, deleteLoreEntry, importLoreEntries } = useLore();
  const [view, setView] = useState<'index' | 'focus'>('index');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Characters', 'Locations']));
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEntry, setEditingEntry] = useState<LoreEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (cat: string) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setExpandedCategories(next);
  };

  const handleSaveEntry = async (entry: LoreEntry) => {
    await addLoreEntry(entry);
    setIsCreating(false);
    setEditingEntry(entry);
    setView('focus');
  };

  const handleEditEntry = (entry: LoreEntry) => {
    setEditingEntry(entry);
    setIsCreating(false);
    setView('focus');
  };

  const handleAddNew = () => {
    setEditingEntry(undefined);
    setIsCreating(true);
    setView('focus');
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
    setView('index');
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

  const categories = [
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

  const entriesByCategory = useMemo(() => {
    const map: Record<string, LoreEntry[]> = {};
    categories.forEach(cat => {
      map[cat] = loreEntries.filter(e => e.category === cat && (
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.content.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    });
    return map;
  }, [loreEntries, searchQuery]);

  return (
    <>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50]"
      />

      {/* Drawer */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-[95vw] md:w-[60vw] lg:w-[45vw] bg-surface-container-lowest/98 backdrop-blur-2xl shadow-2xl border-l border-outline-variant/20 z-[60] flex flex-col overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {view === 'index' ? (
            <motion.div 
              key="index"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Header */}
              <header className="p-10 pb-6 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-headline text-4xl font-light text-on-surface tracking-tight">Lore Codex</h2>
                  <p className="font-label text-[9px] uppercase tracking-[0.4em] text-primary/40 mt-1">The Sovereign Archives</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleExport}
                    className="p-2.5 rounded-xl hover:bg-surface-container-highest transition-all group"
                    title="Export"
                  >
                    <Download className="w-4 h-4 text-on-surface-variant/60 group-hover:text-primary transition-colors" />
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl hover:bg-surface-container-highest transition-all group"
                    title="Import"
                  >
                    <Upload className="w-4 h-4 text-on-surface-variant/60 group-hover:text-primary transition-colors" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                  <button 
                    onClick={onClose}
                    className="p-2.5 rounded-xl hover:bg-surface-container-highest transition-all group"
                  >
                    <X className="w-5 h-5 text-on-surface-variant/60 group-hover:text-error transition-colors" />
                  </button>
                </div>
              </header>

              {/* Search */}
              <div className="px-10 mb-8 shrink-0">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the archives..."
                    className="w-full bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/20"
                  />
                </div>
              </div>

              {/* Categories Accordion */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-32">
                <div className="space-y-1">
                  {categories.map(cat => {
                    const entries = entriesByCategory[cat];
                    if (searchQuery && entries.length === 0) return null;
                    const isExpanded = expandedCategories.has(cat);

                    return (
                      <div key={cat} className="group/cat">
                        <button 
                          onClick={() => toggleCategory(cat)}
                          className="w-full py-4 flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-1 h-4 rounded-full transition-all ${entries.length > 0 ? (isExpanded ? 'bg-primary' : 'bg-primary/30') : 'bg-outline-variant/20'}`} />
                            <h3 className={`font-headline text-base font-light transition-colors ${isExpanded ? 'text-on-surface' : 'text-on-surface/40 group-hover:text-on-surface/70'}`}>
                              {cat}
                            </h3>
                            <span className="text-[10px] font-mono text-on-surface-variant/20 tracking-tighter">[{entries.length}]</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-on-surface-variant/20 transition-transform duration-500 ${isExpanded ? 'rotate-90 text-primary/40' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pb-4 space-y-1">
                                {entries.length === 0 ? (
                                  <p className="text-[10px] text-on-surface-variant/40 italic pl-4.5 py-2">No entries in this category.</p>
                                ) : (
                                  entries.map(entry => (
                                    <div 
                                      key={entry.id}
                                      onClick={() => handleEditEntry(entry)}
                                      className="w-full text-left p-3 pl-4.5 rounded-xl hover:bg-primary/5 group transition-colors flex items-center justify-between cursor-pointer"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <h4 className="text-xs font-medium text-on-surface group-hover:text-primary transition-colors truncate">{entry.title}</h4>
                                        <p className="text-[10px] text-on-surface-variant/60 truncate">{entry.content}</p>
                                      </div>
                                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); deleteLoreEntry(entry.id); }}
                                          className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant/40 hover:text-error transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floating Action Button */}
              <div className="absolute bottom-8 right-8">
                <button 
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed rounded-full shadow-2xl shadow-primary/20 hover:scale-105 transition-transform font-label text-[10px] uppercase tracking-widest font-black"
                >
                  <Plus className="w-4 h-4" />
                  New Entry
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="focus"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Focus Header */}
              <header className="p-8 pb-4 flex items-center justify-between shrink-0">
                <button 
                  onClick={handleCloseForm}
                  className="flex items-center gap-2 text-primary font-label text-[10px] uppercase tracking-[0.2em] hover:gap-3 transition-all"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to Codex
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
                  >
                    <X className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>
              </header>

              {/* Notion-style Form */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 lg:px-16 pt-8 pb-24">
                <LoreEntryForm 
                  onClose={handleCloseForm}
                  onSave={handleSaveEntry}
                  initialData={editingEntry}
                  isModal={false}
                  loreEntries={loreEntries}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export default LoreScreen;
