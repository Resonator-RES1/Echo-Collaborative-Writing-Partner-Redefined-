import React, { useState } from 'react';
import { LoreEntry } from '../../types';
import { BookOpen, CheckCircle2, PlusCircle, X, Sparkles } from 'lucide-react';
import { LoreEntryForm } from '../forms/LoreEntryForm';

interface LoreContextManagerProps {
  loreEntries: LoreEntry[];
  onAddLoreEntry: (entry: LoreEntry) => void;
  onDeleteLoreEntry: (id: string) => void;
}

export const LoreContextManager: React.FC<LoreContextManagerProps> = ({ loreEntries, onAddLoreEntry, onDeleteLoreEntry }) => {
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
    <div className="pt-6 border-t border-outline-variant/20 space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface/60 font-black">
          <BookOpen className="w-4 h-4 text-primary" />
          Lore Context
        </label>
        {activeEntries.length > 0 && (
          <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-1 rounded-full font-black border border-primary/20">
            {activeEntries.length} ACTIVE
          </span>
        )}
      </div>

      {activeEntries.length > 0 ? (
        <div className="space-y-3">
          {activeEntries.map(entry => (
            <div 
              key={entry.id} 
              className="p-4 bg-primary/5 border border-primary/30 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in zoom-in duration-300"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-black text-on-surface truncate tracking-tight">
                    {entry.title}
                  </span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                    {entry.category}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleToggleActive(entry.id)} 
                className="p-2 rounded-xl hover:bg-accent-rose/10 text-on-surface-variant hover:text-accent-rose transition-all active:scale-90"
                title="Deactivate Lore"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-surface-container-highest/20 border border-dashed border-outline-variant/30 rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 bg-surface-container-highest/40 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-on-surface-variant/40" />
          </div>
          <p className="text-xs text-on-surface-variant font-medium">No active lore context. Add entries below to ground your prose.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-grow w-full sm:w-auto">
          <select 
            value={selectedLoreId}
            onChange={(e) => setSelectedLoreId(e.target.value)}
            className="w-full bg-surface-container-highest/40 border border-outline-variant/20 rounded-2xl p-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium appearance-none pr-10"
          >
            <option value="">-- Add lore entry --</option>
            {loreEntries.filter(e => !e.isActive).map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/50">
            <PlusCircle className="w-4 h-4" />
          </div>
        </div>
        <button 
          onClick={() => handleToggleActive(selectedLoreId)}
          disabled={!selectedLoreId}
          className="w-full sm:w-auto p-3.5 bg-primary hover:bg-primary/90 rounded-2xl text-on-primary-fixed punchy-button flex items-center justify-center gap-2"
          title="Activate Lore"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="sm:hidden font-black text-[10px] uppercase tracking-widest">Activate</span>
        </button>
      </div>
      
      <button 
        onClick={() => setIsFormOpen(true)}
        className="w-full py-3 border border-dashed border-primary/30 rounded-2xl text-[10px] font-black text-primary hover:bg-primary/5 transition-all uppercase tracking-widest"
      >
        + Create New Lore Entry
      </button>

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
