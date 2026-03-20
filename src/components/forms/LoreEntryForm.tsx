import React, { useState } from 'react';
import { X, Save, BookOpen } from 'lucide-react';
import { LoreEntry } from '../../types';

interface LoreEntryFormProps {
  onClose: () => void;
  onSave: (entry: LoreEntry) => void;
  initialData?: LoreEntry;
}

export function LoreEntryForm({ onClose, onSave, initialData }: LoreEntryFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<LoreEntry['category']>(initialData?.category || 'World Mechanics');
  const [content, setContent] = useState(initialData?.content || '');

  const placeholders: Record<LoreEntry['category'], string> = {
    'World Mechanics': "Define 'hard rules': magic costs, tech limits, active cosmology...",
    'Geography & Ecology': "Sensory-rich data: flora, fauna, atmospheric hazards...",
    'Societal Strata': "Power hierarchies, naming conventions, social taboos...",
    'Historical Context': "Era 'vibe', shifting agendas of major factions...",
    'Current State': "Transient lore: ongoing wars, rumors, environmental crises..."
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSave({
      id: initialData?.id || Date.now().toString(),
      title,
      category,
      content,
      lastModified: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface-container-low rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
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
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              Content & Description
            </label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholders[category]}
              rows={8}
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
    </div>
  );
}
