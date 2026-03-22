import React, { useState } from 'react';
import { LoreEntry } from '../../types';
import { BookOpen, ChevronDown, ChevronUp, Info, Plus, X } from 'lucide-react';
import { LoreEntryForm } from '../forms/LoreEntryForm';

interface LoreContextManagerProps {
  loreEntries: LoreEntry[];
  onAddLoreEntry: (entry: LoreEntry) => void;
}

export const LoreContextManager: React.FC<LoreContextManagerProps> = ({ loreEntries, onAddLoreEntry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLoreId, setSelectedLoreId] = useState<string>('');
  const activeEntries = loreEntries.filter(e => e.isActive);

  const handleToggleActive = (id: string) => {
    const entry = loreEntries.find(e => e.id === id);
    if (entry) {
      onAddLoreEntry({ ...entry, isActive: !entry.isActive });
      setSelectedLoreId('');
    }
  };

  return (
    <div className="bg-surface-container-low rounded-[0.75rem] border border-outline-variant/20 p-4 shadow-sm mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-sm font-label font-bold text-on-surface-variant uppercase tracking-widest"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Lore Context</span>
          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">
            {activeEntries.length}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {activeEntries.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Lore</h3>
              {activeEntries.map(entry => (
                <div key={entry.id} className="p-2.5 bg-primary/5 border border-primary/20 rounded-[0.75rem] flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface truncate">{entry.title}</span>
                  <button onClick={() => handleToggleActive(entry.id)} className="p-1 rounded-full hover:bg-primary/20 text-primary transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 w-full">
            <select 
              value={selectedLoreId}
              onChange={(e) => setSelectedLoreId(e.target.value)}
              className="bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 text-sm flex-grow text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="">-- Add lore entry --</option>
              {loreEntries.filter(e => !e.isActive).map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <button 
              onClick={() => handleToggleActive(selectedLoreId)}
              disabled={!selectedLoreId}
              className="p-2.5 bg-primary hover:bg-primary/90 rounded-[0.75rem] text-on-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full text-center text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
          >
            + Create New Lore Entry
          </button>
        </div>
      )}
      {isFormOpen && (
        <LoreEntryForm 
          onClose={() => setIsFormOpen(false)}
          onSave={(entry) => {
            onAddLoreEntry(entry);
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );
};
