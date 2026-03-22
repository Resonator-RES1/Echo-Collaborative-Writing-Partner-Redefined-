import React, { useState } from 'react';
import { X, Save, Sparkles, Type, Wind, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { MasterVoice } from '../../types';

interface MasterVoiceFormProps {
  onClose: () => void;
  onSave: (voice: MasterVoice) => void;
  initialData?: MasterVoice;
}

export function MasterVoiceForm({ onClose, onSave, initialData }: MasterVoiceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [narrativeStyle, setNarrativeStyle] = useState(initialData?.narrativeStyle || 'Third Person Limited');
  const [tone, setTone] = useState(initialData?.tone || 'Atmospheric & Melancholic');
  const [vocabularyLevel, setVocabularyLevel] = useState(initialData?.vocabularyLevel || 'Sophisticated');
  const [pacingPreference, setPacingPreference] = useState(initialData?.pacingPreference || 'Balanced');
  const [description, setDescription] = useState(initialData?.description || '');
  const [signaturePhrases, setSignaturePhrases] = useState<string[]>(initialData?.signaturePhrases || ['']);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleAddPhrase = () => setSignaturePhrases([...signaturePhrases, '']);
  const handleRemovePhrase = (index: number) => setSignaturePhrases(signaturePhrases.filter((_, i) => i !== index));
  const handlePhraseChange = (index: number, value: string) => {
    const newPhrases = [...signaturePhrases];
    newPhrases[index] = value;
    setSignaturePhrases(newPhrases);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !narrativeStyle.trim()) return;

    onSave({
      id: initialData?.id || Date.now().toString(),
      name,
      narrativeStyle,
      tone,
      vocabularyLevel,
      pacingPreference,
      description,
      signaturePhrases: signaturePhrases.filter(p => p.trim()),
      lastModified: new Date().toISOString(),
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface-container-low rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {initialData ? 'Edit Master Narrative Voice' : 'New Master Narrative Voice'}
              </h2>
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
                Global Narrative Style
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
                Voice Name
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., The Chronicler"
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Narrative Style
              </label>
              <input 
                type="text"
                value={narrativeStyle}
                onChange={(e) => setNarrativeStyle(e.target.value)}
                placeholder="e.g., Third Person Omniscient"
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Tone</label>
              <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Vocabulary</label>
              <input type="text" value={vocabularyLevel} onChange={(e) => setVocabularyLevel(e.target.value)} className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Pacing</label>
              <input type="text" value={pacingPreference} onChange={(e) => setPacingPreference(e.target.value)} className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
              Voice Essence (Description)
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the overarching feel and rules of this narrative voice..."
              rows={3}
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Signature Narrative Phrases
              </label>
              <button type="button" onClick={handleAddPhrase} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {signaturePhrases.map((phrase, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={phrase} onChange={(e) => handlePhraseChange(index, e.target.value)} placeholder="e.g., 'The shadows lengthened as if reaching for...'" className="flex-1 bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  {signaturePhrases.length > 1 && (
                    <button type="button" onClick={() => handleRemovePhrase(index)} className="p-3 rounded-xl text-error hover:bg-error/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <input 
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
            />
            <label htmlFor="isActive" className="flex flex-col cursor-pointer">
              <span className="text-sm font-headline font-bold text-on-surface">Set as Active Narrative Voice</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">Only one Master Voice can be active at a time</span>
            </label>
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
              <span>Save Narrative Voice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
