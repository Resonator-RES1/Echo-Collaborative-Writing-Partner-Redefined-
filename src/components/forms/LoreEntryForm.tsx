import React, { useState, useEffect, useRef } from 'react';
import { X, Save, BookOpen, Fingerprint, Cpu, Waypoints, Plus, Trash2, Loader2, Users } from 'lucide-react';
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
  const [description, setDescription] = useState(initialData?.description || '');
  const [aliases, setAliases] = useState(initialData?.aliases?.join(', ') || '');
  const [gender, setGender] = useState<string>(initialData?.gender || 'unspecified');
  const [sensoryPalette, setSensoryPalette] = useState(initialData?.sensoryPalette || '');
  const [relations, setRelations] = useState(initialData?.relations || '');
  const [storyDay, setStoryDay] = useState<number>(initialData?.storyDay || 0);
  const [linkedEntityIds, setLinkedEntityIds] = useState<string[]>(initialData?.linkedEntityIds || []);
  const [relationships, setRelationships] = useState<Relationship[]>(initialData?.relationships || []);
  const [isSaving, setIsSaving] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [description]);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setCategory(initialData?.category || 'World Mechanics');
    setDescription(initialData?.description || '');
    setAliases(initialData?.aliases?.join(', ') || '');
    setGender(initialData?.gender || 'unspecified');
    setSensoryPalette(initialData?.sensoryPalette || '');
    setRelations(initialData?.relations || '');
    setStoryDay(initialData?.storyDay || 0);
    setLinkedEntityIds(initialData?.linkedEntityIds || []);
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
    'Timeline': "Describe the event, its significance, and its impact on the world...",
    'Other': "Any other worldbuilding details..."
  };

  const handleAddRelationship = () => {
    setRelationships([...relationships, { targetId: '', type: '', tension: 3, context: '' }]);
  };

  const handleRemoveRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const handleRelationshipChange = (index: number, field: keyof Relationship, value: any) => {
    const newRels = [...relationships];
    newRels[index] = { ...newRels[index], [field]: value };
    setRelationships(newRels);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const aliasList = aliases.split(',').map(a => a.trim()).filter(a => a !== '');

      onSave({
        id: initialData?.id || Date.now().toString(),
        title,
        category,
        description,
        aliases: aliasList,
        gender: category === 'Characters' ? gender : undefined,
        sensoryPalette,
        relations: category === 'Characters' ? relations : undefined,
        relationships: relationships.filter(r => r.targetId),
        storyDay,
        linkedEntityIds,
        lastModified: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to save lore entry:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formContent = (
    <div className="w-full h-full flex flex-col bg-transparent overflow-y-auto custom-scrollbar p-8">
      <form onSubmit={handleSubmit} className="space-y-12 flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Notion-style Title */}
        <div className="space-y-6">
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Entry"
            className="w-full bg-transparent border-none text-4xl md:text-5xl font-headline font-light text-on-surface placeholder:text-on-surface-variant/20 outline-none p-0"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Section 1: Local Scanner Attributes */}
          <div className="space-y-6">
            <div className="pb-2 border-b border-outline-variant/10">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-primary" />
                Local Scanner Attributes
              </h3>
              <p className="text-[10px] text-on-surface-variant mt-1">These fields power the real-time Continuity Guard.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">Category</span>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LoreEntry['category'])}
                  className="bg-surface-container-highest/50 text-on-surface px-3 py-2 rounded-xl text-xs border border-outline-variant/30 outline-none focus:border-primary transition-colors"
                >
                  {Object.keys(placeholders).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">Aliases</span>
                <input 
                  type="text"
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  placeholder="Comma separated..."
                  className="bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">Story Day</span>
                <input 
                  type="number"
                  value={storyDay}
                  onChange={(e) => setStoryDay(parseInt(e.target.value) || 0)}
                  className="bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-colors w-24"
                />
              </div>
            </div>
          </div>

          {/* Section 2: AI Audit Attributes */}
          <div className="space-y-6">
            <div className="pb-2 border-b border-outline-variant/10">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Cpu className="w-4 h-4 text-secondary" />
                AI Audit Attributes
              </h3>
              <p className="text-[10px] text-on-surface-variant mt-1">These fields are sent to the Cynical Mirror during an Audit.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">Sensory</span>
                <input 
                  type="text"
                  value={sensoryPalette}
                  onChange={(e) => setSensoryPalette(e.target.value)}
                  placeholder="Smells, sounds, textures..."
                  className="bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary transition-colors"
                />
              </div>

              {category === 'Characters' && (
                <>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                    <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">Gender</span>
                    <input 
                      type="text"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      placeholder="e.g., Male, Female, Non-binary..."
                      className="bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                    <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">Relations</span>
                    <input 
                      type="text"
                      value={relations}
                      onChange={(e) => setRelations(e.target.value)}
                      placeholder="Key relationships..."
                      className="bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Social Dynamics Section (Only for Characters) */}
        {category === 'Characters' && (
          <div className="space-y-6 pt-8 border-t border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Social Dynamics</h3>
                  <p className="text-[10px] text-on-surface-variant">Define structured relationships for social consistency audits.</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleAddRelationship}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full font-label text-[9px] uppercase tracking-widest hover:bg-primary/20 transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Relation
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relationships.map((rel, idx) => (
                <div key={idx} className="p-4 bg-surface-container-highest/30 border border-outline-variant/20 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Target</label>
                        <select 
                          value={rel.targetId}
                          onChange={(e) => handleRelationshipChange(idx, 'targetId', e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                        >
                          <option value="">Select Character...</option>
                          {loreEntries.filter(p => p.id !== initialData?.id && p.category === 'Characters').map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Type</label>
                        <input 
                          type="text"
                          value={rel.type}
                          onChange={(e) => handleRelationshipChange(idx, 'type', e.target.value)}
                          placeholder="e.g., Rival, Mentor"
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Tension (1-5)</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range"
                          min="1"
                          max="5"
                          value={rel.tension}
                          onChange={(e) => handleRelationshipChange(idx, 'tension', parseInt(e.target.value))}
                          className="flex-1 accent-primary"
                        />
                        <span className={`text-xs font-bold w-4 ${rel.tension >= 4 ? 'text-error' : rel.tension <= 2 ? 'text-emerald-500' : 'text-primary'}`}>
                          {rel.tension}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Context</label>
                        <input 
                          type="text"
                          value={rel.context}
                          onChange={(e) => handleRelationshipChange(idx, 'context', e.target.value)}
                          placeholder="Brief history..."
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveRelationship(idx)}
                        className="mt-5 p-2 text-on-surface-variant/40 hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {relationships.length === 0 && (
                <p className="text-[10px] text-on-surface-variant/40 italic py-4">No structured relationships defined.</p>
              )}
            </div>
          </div>
        )}

        {/* Description Area */}
        <div className="flex-1 flex flex-col min-h-[300px] pt-8 border-t border-outline-variant/10">
          <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/40 mb-4">Core Description (AI Engine Context)</label>
          <textarea 
            ref={descriptionRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholders[category as string] || "Start writing..."}
            className="w-full flex-1 bg-transparent border-none text-lg text-on-surface/80 placeholder:text-on-surface-variant/20 outline-none resize-none leading-relaxed p-0 overflow-hidden"
            required
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-outline-variant/10 shrink-0">
          <div className="text-[9px] font-mono text-on-surface-variant/40 italic">
            Last modified: {initialData ? new Date(initialData.lastModified).toLocaleString() : 'Just now'}
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary-fixed rounded-full font-label text-[10px] uppercase tracking-[0.2em] font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              {isSaving ? 'Synchronizing...' : 'Commit to Codex'}
            </button>
          </div>
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
