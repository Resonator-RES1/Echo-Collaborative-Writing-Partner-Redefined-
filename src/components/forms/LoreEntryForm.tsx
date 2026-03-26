import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Fingerprint, Database, Cpu, Waypoints, Plus, Trash2 } from 'lucide-react';
import { LoreEntry, Gender, Relationship } from '../../types';

interface LoreEntryFormProps {
  onClose: () => void;
  onSave: (entry: LoreEntry) => void;
  initialData?: LoreEntry;
  isModal?: boolean;
  loreEntries?: LoreEntry[];
}

export function LoreEntryForm({ onClose, onSave, initialData, isModal = true, loreEntries = [] }: LoreEntryFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<LoreEntry['category']>(initialData?.category || 'World Mechanics');
  const [content, setContent] = useState(initialData?.content || '');
  const [aliases, setAliases] = useState(initialData?.aliases?.join(', ') || '');
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'unspecified');
  const [sensoryPalette, setSensoryPalette] = useState(initialData?.sensoryPalette || '');
  const [relationships, setRelationships] = useState<Relationship[]>(initialData?.relationships || []);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setCategory(initialData?.category || 'World Mechanics');
    setContent(initialData?.content || '');
    setAliases(initialData?.aliases?.join(', ') || '');
    setGender(initialData?.gender || 'unspecified');
    setSensoryPalette(initialData?.sensoryPalette || '');
    setRelationships(initialData?.relationships || []);
  }, [initialData]);

  const placeholders: Record<string, string> = {
    'Characters': "Physical description, key traits, and personal history...",
    'Locations': "Describe the atmosphere, layout, and key features...",
    'Items': "Appearance, function, and significance...",
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
      gender: category === 'Characters' ? gender : undefined,
      sensoryPalette,
      relationships: category === 'Characters' ? relationships : undefined,
      lastModified: new Date().toISOString(),
    });
  };

  const addRelationship = () => {
    const otherCharacters = loreEntries.filter(e => e.category === 'Characters' && e.id !== initialData?.id);
    if (otherCharacters.length === 0) return;
    
    setRelationships([
      ...relationships,
      { targetId: otherCharacters[0].id, type: 'Ally', tension: 1, context: '' }
    ]);
  };

  const updateRelationship = (index: number, updates: Partial<Relationship>) => {
    const newRelationships = [...relationships];
    newRelationships[index] = { ...newRelationships[index], ...updates };
    setRelationships(newRelationships);
  };

  const removeRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const otherCharacters = loreEntries.filter(e => e.category === 'Characters' && e.id !== initialData?.id);

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
                placeholder={category === 'Characters' ? "Character Name (e.g. Elara Vance)" : "e.g., The Shattered Isles"}
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
                <optgroup label="Identity (Local Guard)">
                  <option value="Characters">Characters</option>
                  <option value="Locations">Locations</option>
                  <option value="Items">Items</option>
                </optgroup>
                <optgroup label="Engine (AI Refinement)">
                  <option value="World Mechanics">World Mechanics</option>
                  <option value="Geography & Ecology">Geography & Ecology</option>
                  <option value="Societal Strata">Societal Strata</option>
                  <option value="Historical Context">Historical Context</option>
                  <option value="Current State">Current State</option>
                  <option value="Other">Other</option>
                </optgroup>
              </select>
            </div>
          </div>

          {category === 'Characters' && (
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface appearance-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="unspecified">Other / Neutral</option>
              </select>
              <p className="text-[10px] text-on-surface-variant/50 italic ml-1">Used for pronoun consistency checks.</p>
            </div>
          )}

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
            <Cpu className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">World Engine</h3>
            <span className="text-[10px] font-label text-on-surface-variant/60 ml-2 italic">
              Advanced logic used by Echo to mirror this entry's facts and rules during refinement.
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

          <div className="space-y-2">
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
              Sensory Palette
            </label>
            <input 
              type="text"
              value={sensoryPalette}
              onChange={(e) => setSensoryPalette(e.target.value)}
              placeholder="e.g. ozone, cold iron, flickering shadows, damp stone"
              className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
            />
            <p className="text-[10px] text-on-surface-variant/50 italic ml-1">Keywords Echo will weave into descriptions when 'Sensory' focus is active.</p>
          </div>
        </div>

        {/* Section 3: Web of Fate (Relationships) - Only for Characters */}
        {category === 'Characters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <Waypoints className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">Web of Fate</h3>
                <span className="text-[10px] font-label text-on-surface-variant/60 ml-2 italic">
                  Define social dynamics and tensions between characters.
                </span>
              </div>
              <button 
                type="button"
                onClick={addRelationship}
                disabled={otherCharacters.length === 0}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-label text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                Add Relation
              </button>
            </div>

            {relationships.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-outline-variant/10 rounded-2xl">
                <p className="text-xs text-on-surface-variant italic">No relationships defined. Connect this character to others in the codex.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {relationships.map((rel, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-surface-container-highest/30 border border-outline-variant/20 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Target Character</label>
                          <select 
                            value={rel.targetId}
                            onChange={(e) => updateRelationship(index, { targetId: e.target.value })}
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/30"
                          >
                            {otherCharacters.map(char => (
                              <option key={char.id} value={char.id}>{char.title}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Relation Type</label>
                          <input 
                            type="text"
                            value={rel.type}
                            onChange={(e) => updateRelationship(index, { type: e.target.value })}
                            placeholder="e.g. Rival, Mentor, Sibling"
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/30"
                          />
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeRelationship(index)}
                        className="p-2 text-on-surface-variant/40 hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Tension (1-5)</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => updateRelationship(index, { tension: num as any })}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                rel.tension === num 
                                  ? 'bg-primary text-on-primary-fixed' 
                                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Context / History</label>
                        <input 
                          type="text"
                          value={rel.context}
                          onChange={(e) => updateRelationship(index, { context: e.target.value })}
                          placeholder="Briefly describe the nature of their bond or conflict..."
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
