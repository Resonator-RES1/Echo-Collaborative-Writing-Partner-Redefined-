import React, { useState } from 'react';
import { X, Save, Mic2, Quote, Brain, Plus, Trash2 } from 'lucide-react';
import { VoiceProfile } from '../../types';

interface VoiceProfileFormProps {
  onClose: () => void;
  onSave: (profile: VoiceProfile) => void;
  initialData?: VoiceProfile;
}

export function VoiceProfileForm({ onClose, onSave, initialData }: VoiceProfileFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [archetype, setArchetype] = useState(initialData?.archetype || '');
  const [soulPattern, setSoulPattern] = useState(initialData?.soulPattern || '');
  const [patterns, setPatterns] = useState<string[]>(initialData?.patterns || ['']);
  const [idioms, setIdioms] = useState<string[]>(initialData?.idioms || ['']);

  const handleAddPattern = () => setPatterns([...patterns, '']);
  const handleRemovePattern = (index: number) => setPatterns(patterns.filter((_, i) => i !== index));
  const handlePatternChange = (index: number, value: string) => {
    const newPatterns = [...patterns];
    newPatterns[index] = value;
    setPatterns(newPatterns);
  };

  const handleAddIdiom = () => setIdioms([...idioms, '']);
  const handleRemoveIdiom = (index: number) => setIdioms(idioms.filter((_, i) => i !== index));
  const handleIdiomChange = (index: number, value: string) => {
    const newIdioms = [...idioms];
    newIdioms[index] = value;
    setIdioms(newIdioms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !archetype.trim()) return;

    onSave({
      id: initialData?.id || Date.now().toString(),
      name,
      archetype,
      soulPattern,
      patterns: patterns.filter(p => p.trim()),
      idioms: idioms.filter(i => i.trim()),
      lastModified: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface-container-low rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {initialData ? 'Edit Voice Profile' : 'New Voice Profile'}
              </h2>
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
                Character Soul-Pattern
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Character Name
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Elara Vance"
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Archetype
              </label>
              <input 
                type="text"
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                placeholder="e.g., The Reluctant Hero"
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
              Soul-Pattern (Core Voice Description)
            </label>
            <textarea 
              value={soulPattern}
              onChange={(e) => setSoulPattern(e.target.value)}
              placeholder="Describe the core essence of their voice..."
              rows={3}
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                <Brain className="w-3.5 h-3.5" />
                Linguistic Patterns
              </label>
              <button 
                type="button" 
                onClick={handleAddPattern}
                className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    type="text"
                    value={pattern}
                    onChange={(e) => handlePatternChange(index, e.target.value)}
                    placeholder="e.g., Uses nautical metaphors"
                    className="flex-1 bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  {patterns.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemovePattern(index)}
                      className="p-3 rounded-xl text-error hover:bg-error/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                <Quote className="w-3.5 h-3.5" />
                Signature Idioms
              </label>
              <button 
                type="button" 
                onClick={handleAddIdiom}
                className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {idioms.map((idiom, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    type="text"
                    value={idiom}
                    onChange={(e) => handleIdiomChange(index, e.target.value)}
                    placeholder="e.g., 'By the Drowning Deep'"
                    className="flex-1 bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  {idioms.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveIdiom(index)}
                      className="p-3 rounded-xl text-error hover:bg-error/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
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
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
