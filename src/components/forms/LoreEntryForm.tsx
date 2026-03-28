import React, { useState, useEffect, useRef } from 'react';
import { X, Save, BookOpen, Fingerprint, Cpu, Waypoints, Plus, Trash2, Loader2 } from 'lucide-react';
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
  const [storyDay, setStoryDay] = useState<number | undefined>(initialData?.storyDay);
  const [linkedEntityIds, setLinkedEntityIds] = useState<string[]>(initialData?.linkedEntityIds || []);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [content]);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setCategory(initialData?.category || 'World Mechanics');
    setContent(initialData?.content || '');
    setAliases(initialData?.aliases?.join(', ') || '');
    setGender(initialData?.gender || 'unspecified');
    setSensoryPalette(initialData?.sensoryPalette || '');
    setRelationships(initialData?.relationships || []);
    setStoryDay(initialData?.storyDay);
    setLinkedEntityIds(initialData?.linkedEntityIds || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSaving) return;

    setIsSaving(true);
    try {
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
        storyDay: category === 'Timeline' ? storyDay : undefined,
        linkedEntityIds: category === 'Timeline' ? linkedEntityIds : undefined,
        lastModified: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to save lore entry:", error);
    } finally {
      setIsSaving(false);
    }
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
    <div className="w-full h-full flex flex-col bg-transparent">
      <form onSubmit={handleSubmit} className="space-y-12 flex-1 flex flex-col">
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
          
          {/* Properties Area */}
          <div className="space-y-4 pt-2">
            {/* Core Properties */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 group">
              <div className="flex items-center gap-2 text-on-surface-variant/40">
                <Cpu className="w-3.5 h-3.5" />
                <span className="text-[10px] font-label uppercase tracking-widest">Category</span>
              </div>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as LoreEntry['category'])}
                className="bg-primary/10 text-primary px-3 py-1 rounded-md text-[10px] font-label uppercase tracking-widest border-none outline-none appearance-none cursor-pointer hover:bg-primary/20 transition-colors w-fit"
              >
                {Object.keys(placeholders).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {category === 'Characters' && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4 group">
                <div className="flex items-center gap-2 text-on-surface-variant/40">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-label uppercase tracking-widest">Gender</span>
                </div>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="bg-secondary/10 text-secondary px-3 py-1 rounded-md text-[10px] font-label uppercase tracking-widest border-none outline-none appearance-none cursor-pointer hover:bg-secondary/20 transition-colors w-fit"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="unspecified">Neutral</option>
                </select>
              </div>
            )}

            {category === 'Timeline' && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4 group">
                <div className="flex items-center gap-2 text-on-surface-variant/40">
                  <Waypoints className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-label uppercase tracking-widest">Story Day</span>
                </div>
                <input 
                  type="number"
                  value={storyDay || ''}
                  onChange={(e) => setStoryDay(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-transparent border-none text-[11px] font-mono text-primary outline-none w-16"
                  placeholder="Day #"
                />
              </div>
            )}

            {/* Metadata Properties */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 group">
              <div className="flex items-center gap-2 text-on-surface-variant/40">
                <Fingerprint className="w-3.5 h-3.5" />
                <span className="text-[10px] font-label uppercase tracking-widest">Aliases</span>
              </div>
              <input 
                type="text"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="Empty"
                className="bg-transparent border-none text-[11px] text-on-surface outline-none placeholder:text-on-surface-variant/20"
              />
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4 group">
              <div className="flex items-center gap-2 text-on-surface-variant/40">
                <Fingerprint className="w-3.5 h-3.5" />
                <span className="text-[10px] font-label uppercase tracking-widest">Sensory</span>
              </div>
              <input 
                type="text"
                value={sensoryPalette}
                onChange={(e) => setSensoryPalette(e.target.value)}
                placeholder="Empty"
                className="bg-transparent border-none text-[11px] text-on-surface outline-none placeholder:text-on-surface-variant/20"
              />
            </div>

            {category === 'Characters' && (
              <div className="grid grid-cols-[120px_1fr] items-start gap-4 group pt-2">
                <div className="flex items-center gap-2 text-on-surface-variant/40 pt-1">
                  <Waypoints className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-label uppercase tracking-widest">Relations</span>
                </div>
                <div className="space-y-3">
                  {relationships.map((rel, index) => (
                    <div key={index} className="flex items-center gap-3 group/rel">
                      <select 
                        value={rel.targetId}
                        onChange={(e) => updateRelationship(index, { targetId: e.target.value })}
                        className="bg-transparent border-none text-[11px] text-on-surface outline-none cursor-pointer hover:text-primary transition-colors"
                      >
                        {otherCharacters.map(char => (
                          <option key={char.id} value={char.id}>{char.title}</option>
                        ))}
                      </select>
                      <input 
                        type="text"
                        value={rel.type}
                        onChange={(e) => updateRelationship(index, { type: e.target.value })}
                        placeholder="Relation..."
                        className="bg-transparent border-none text-[11px] text-primary outline-none w-24"
                      />
                      <button 
                        type="button"
                        onClick={() => removeRelationship(index)}
                        className="opacity-0 group-hover/rel:opacity-100 p-1 text-on-surface-variant/40 hover:text-error transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={addRelationship}
                    disabled={otherCharacters.length === 0}
                    className="text-[9px] font-label uppercase tracking-widest text-primary/40 hover:text-primary disabled:opacity-30 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Relation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-[400px] pt-8 border-t border-outline-variant/10">
          <textarea 
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
