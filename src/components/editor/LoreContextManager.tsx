import React, { useState } from 'react';
import { LoreEntry } from '../../types';
import { BookOpen, ChevronDown, ChevronUp, Info, Plus } from 'lucide-react';
import { LoreEntryForm } from '../forms/LoreEntryForm';

interface LoreContextManagerProps {
  loreEntries: LoreEntry[];
  onAddLoreEntry: (entry: LoreEntry) => void;
}

export const LoreContextManager: React.FC<LoreContextManagerProps> = ({ loreEntries, onAddLoreEntry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
            {loreEntries.length}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Codex</h3>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-1 text-[9px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-tighter"
            >
              <Plus className="w-3 h-3" />
              <span>Add Entry</span>
            </button>
          </div>

          {loreEntries.length === 0 ? (
            <div className="p-4 bg-surface-container-highest/20 rounded-lg border border-dashed border-outline-variant/30 text-center">
              <p className="text-[10px] text-on-surface-variant italic">
                No lore entries found in Codex.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {loreEntries.map(entry => (
                <div key={entry.id} className="p-3 bg-surface-container-highest/30 rounded-lg border border-outline-variant/10 group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">{entry.category}</span>
                    <Info className="w-3 h-3 text-on-surface-variant/30 group-hover:text-primary transition-colors cursor-help" />
                  </div>
                  <h4 className="text-xs font-headline font-semibold text-on-surface mb-1">{entry.title}</h4>
                  <p className="text-[10px] text-on-surface-variant line-clamp-2 leading-tight">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
          <p className="text-[9px] text-on-surface-variant/60 leading-tight italic">
            Echo uses these entries to ensure world-building consistency during refinement.
          </p>
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
