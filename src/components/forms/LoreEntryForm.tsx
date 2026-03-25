import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Fingerprint, Database } from 'lucide-react';
import { LoreEntry } from '../../types';

interface LoreEntryFormProps {
  onClose: () => void;
  onSave: (entry: LoreEntry) => void;
  initialData?: LoreEntry;
  isModal?: boolean;
}

export function LoreEntryForm({ onClose, onSave, initialData, isModal = true }: LoreEntryFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<LoreEntry['category']>(initialData?.category || 'World Mechanics');
  const [content, setContent] = useState(initialData?.content || '');
  const [aliases, setAliases] = useState(initialData?.aliases?.join(', ') || '');

  useEffect(() => {
    setTitle(initialData?.title || '');
    setCategory(initialData?.category || 'World Mechanics');
    setContent(initialData?.content || '');
    setAliases(initialData?.aliases?.join(', ') || '');
  }, [initialData]);

  const placeholders: Record<string, string> = {
    'World Mechanics': "Laws of magic, physics, fundamental rules of the universe...",
    'Geography & Ecology': "Landscapes, climates, flora, fauna, and environmental systems...",
    'Societal Strata': "Class structures, political systems, cultural norms, and hierarchies...",
    'Historical Context': "Key events, eras, legends, and the weight of the past...",
    'Current State': "Present-day conflicts, active threats, and the immediate world status...",
    'Other': "Any other worldbuilding details..."
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const aliasList = aliases.split(',').map(a => a.trim()).filter(a => a !== '');

    onSave({
      id: initialData?.id || Date.now().toString(),
      title,
      category,
      content,
      aliases: aliasList,
      lastModified: new Date().toISOString(),
    });
  };

  const formContent = (
    <div className={`w-full h-full flex flex-col bg-surface-container-low ${isModal ? 'max-w-3xl rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300' : 'rounded-2xl border border-outline-variant/10 shadow-sm'}`}>
      <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              {initialData ? 'Edit Lore Entry' : 'New Lore Entry'}
            </h2>
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
              Codex Documentation
            </p>
          </div>
        </div>
        {isModal && (
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Section 1: Identity Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
            <Fingerprint className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">Identity Card</h3>
            <span className="text-[10px] font-label text-on-surface-variant/60 ml-2 italic">
              Used by Continuity Guard to track mentions and aliases in real-time.
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Entry Title
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Shattered Isles"
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Category
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as LoreEntry['category'])}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface appearance-none"
              >
                <option value="World Mechanics">World Mechanics</option>
                <option value="Geography & Ecology">Geography & Ecology</option>
                <option value="Societal Strata">Societal Strata</option>
                <option value="Historical Context">Historical Context</option>
                <option value="Current State">Current State</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
              Aliases (Comma separated)
            </label>
            <input 
              type="text"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              placeholder="e.g., The Broken Lands, The Void Sea"
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
            />
          </div>
        </div>

        {/* Section 2: World Engine */}
        <div className="space-y-4 flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
            <Database className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">World Engine</h3>
            <span className="text-[10px] font-label text-on-surface-variant/60 ml-2 italic">
              Actual facts and rules used by Echo to ensure logical consistency.
            </span>
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
              Content & Description
            </label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholders[category as string] || placeholders['Other']}
              className="w-full flex-1 bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-on-surface leading-relaxed"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-full font-label text-sm uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-highest transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary-fixed rounded-full font-label text-sm uppercase tracking-wider font-bold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Entry</span>
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {formContent}
      </div>
    );
  }

  return formContent;
}
