import React, { useState } from 'react';
import { X, Save, PenTool, Layout, Zap, Type, Anchor } from 'lucide-react';
import { AuthorVoice } from '../../types';

interface AuthorVoiceFormProps {
  onClose: () => void;
  onSave: (voice: AuthorVoice) => void;
  initialData?: AuthorVoice;
}

export function AuthorVoiceForm({ onClose, onSave, initialData }: AuthorVoiceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [narrativeStyle, setNarrativeStyle] = useState(initialData?.narrativeStyle || '');
  const [proseStructure, setProseStructure] = useState(initialData?.proseStructure || '');
  const [pacingAndRhythm, setPacingAndRhythm] = useState(initialData?.pacingAndRhythm || '');
  const [vocabularyAndDiction, setVocabularyAndDiction] = useState(initialData?.vocabularyAndDiction || '');
  const [thematicAnchors, setThematicAnchors] = useState(initialData?.thematicAnchors || '');
  const [isActive, setIsActive] = useState(initialData?.isActive || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id || Date.now().toString(),
      name,
      narrativeStyle,
      proseStructure,
      pacingAndRhythm,
      vocabularyAndDiction,
      thematicAnchors,
      isActive,
      lastModified: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface-container-low rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <PenTool className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {initialData ? 'Edit Author Voice' : 'New Author Voice'}
              </h2>
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
                Narrative Style & Prose DNA
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
          <div className="space-y-2">
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
              Voice Name / Label
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Gritty Noir, Whimsical Fantasy"
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface"
              required
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
            <input 
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary/20"
            />
            <label htmlFor="isActive" className="flex flex-col cursor-pointer">
              <span className="text-sm font-headline font-bold text-on-surface">Set as Active Master Voice</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">The primary narrative guide for this project</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
              <PenTool className="w-3.5 h-3.5" />
              Narrative Style
            </label>
            <textarea 
              value={narrativeStyle}
              onChange={(e) => setNarrativeStyle(e.target.value)}
              placeholder="Describe the overall tone, perspective, and narrative distance..."
              rows={3}
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                <Layout className="w-3.5 h-3.5" />
                Prose Structure
              </label>
              <textarea 
                value={proseStructure}
                onChange={(e) => setProseStructure(e.target.value)}
                placeholder="Paragraph length, dialogue integration, description density..."
                rows={3}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                <Zap className="w-3.5 h-3.5" />
                Pacing & Rhythm
              </label>
              <textarea 
                value={pacingAndRhythm}
                onChange={(e) => setPacingAndRhythm(e.target.value)}
                placeholder="Sentence variety, flow, tension building through prose..."
                rows={3}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                <Type className="w-3.5 h-3.5" />
                Vocabulary & Diction
              </label>
              <textarea 
                value={vocabularyAndDiction}
                onChange={(e) => setVocabularyAndDiction(e.target.value)}
                placeholder="Word choice, complexity, specific jargon or linguistic flavor..."
                rows={3}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                <Anchor className="w-3.5 h-3.5" />
                Thematic Anchors
              </label>
              <textarea 
                value={thematicAnchors}
                onChange={(e) => setThematicAnchors(e.target.value)}
                placeholder="Recurring motifs, emotional undertones, core themes..."
                rows={3}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
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
              className="flex items-center gap-2 px-8 py-3 bg-secondary text-on-secondary-fixed rounded-full font-label text-sm uppercase tracking-wider font-bold shadow-lg hover:shadow-xl hover:bg-secondary/90 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Author Voice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
