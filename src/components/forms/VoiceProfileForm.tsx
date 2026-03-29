import React, { useState } from 'react';
import { X, Save, Mic2, Quote, Brain, Plus, Trash2, Fingerprint, Cpu, Sparkles, Users } from 'lucide-react';
import { VoiceProfile, Gender, Relationship } from '../../types';

interface VoiceProfileFormProps {
  onClose: () => void;
  onSave: (profile: VoiceProfile) => void;
  initialData?: VoiceProfile;
  isModal?: boolean;
  voiceProfiles?: VoiceProfile[];
}

export function VoiceProfileForm({ onClose, onSave, initialData, isModal = true, voiceProfiles = [] }: VoiceProfileFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [gender, setGender] = useState<Gender | 'other'>(initialData?.gender || 'unspecified');
  const [archetype, setArchetype] = useState(initialData?.archetype || '');
  const [coreMotivation, setCoreMotivation] = useState(initialData?.coreMotivation || '');
  const [aliases, setAliases] = useState(initialData?.aliases?.join(', ') || '');
  const [soulPattern, setSoulPattern] = useState(initialData?.soulPattern || '');
  const [cognitiveSpeech, setCognitiveSpeech] = useState(initialData?.cognitiveSpeech || '');
  const [conversationalRole, setConversationalRole] = useState(initialData?.conversationalRole || '');
  const [signatureTraits, setSignatureTraits] = useState(initialData?.signatureTraits?.join(', ') || '');
  const [idioms, setIdioms] = useState(initialData?.idioms?.join(', ') || '');
  const [exampleLines, setExampleLines] = useState<string[]>(initialData?.exampleLines || ['']);
  const [physicalTells, setPhysicalTells] = useState(initialData?.physicalTells || '');
  const [internalMonologue, setInternalMonologue] = useState(initialData?.internalMonologue || '');
  const [conflictStyle, setConflictStyle] = useState(initialData?.conflictStyle || '');
  const [preview, setPreview] = useState(initialData?.preview || '');
  const [relationships, setRelationships] = useState<Relationship[]>(initialData?.relationships || []);

  const handleAddExampleLine = () => setExampleLines([...exampleLines, '']);
  const handleRemoveExampleLine = (index: number) => setExampleLines(exampleLines.filter((_, i) => i !== index));
  const handleExampleLineChange = (index: number, value: string) => {
    const newLines = [...exampleLines];
    newLines[index] = value;
    setExampleLines(newLines);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !archetype.trim()) return;

    onSave({
      id: initialData?.id || Date.now().toString(),
      name,
      gender: gender as any,
      archetype,
      coreMotivation,
      aliases: aliases.split(',').map(s => s.trim()).filter(Boolean),
      soulPattern,
      cognitiveSpeech,
      conversationalRole,
      signatureTraits: signatureTraits.split(',').map(t => t.trim()).filter(Boolean),
      idioms: idioms.split(',').map(i => i.trim()).filter(Boolean),
      exampleLines: exampleLines.filter(l => l.trim()),
      physicalTells,
      internalMonologue,
      conflictStyle,
      preview,
      relationships: relationships.filter(r => r.targetId),
      lastModified: new Date().toISOString(),
      isActive: true,
    });
  };

  const content = (
    <div className={`w-full bg-surface-container-low rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col ${isModal ? 'max-w-2xl max-h-[90vh] animate-in fade-in zoom-in duration-300' : 'h-full'}`}>
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

      <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {initialData && (
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Voice DNA Quick-Copy</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {initialData.signatureTraits.map((trait, idx) => (
                  <button
                    key={`trait-${idx}`}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(trait);
                    }}
                    className="px-3 py-1 bg-surface-container-highest border border-outline-variant/20 rounded-full text-[10px] font-medium text-on-surface-variant hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all active:scale-95"
                    title="Click to copy trait"
                  >
                    {trait}
                  </button>
                ))}
                {initialData.idioms.map((idiom, idx) => (
                  <button
                    key={`idiom-${idx}`}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(idiom);
                    }}
                    className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-medium text-primary hover:bg-primary/20 transition-all active:scale-95"
                    title="Click to copy idiom"
                  >
                    "{idiom}"
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-on-surface-variant/40 italic">Click any badge to copy it to your clipboard for use in the editor.</p>
            </div>
          )}

          {/* Section 1: Identity Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
              <Fingerprint className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-on-surface">Identity Card (Local Guard)</h3>
                <p className="text-[10px] text-on-surface-variant">Used by Continuity Guard to track pronouns and mentions in real-time.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Gender
                </label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | 'other')}
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                >
                  <option value="unspecified">Unspecified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
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
              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                  Aliases (comma separated)
                </label>
                <input 
                  type="text"
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  placeholder="e.g., The Ghost, Captain"
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Voice Engine */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
              <Cpu className="w-5 h-5 text-secondary" />
              <div>
                <h3 className="text-sm font-bold text-on-surface">Voice Engine (AI Audit)</h3>
                <p className="text-[10px] text-on-surface-variant">Advanced logic used by Echo to mirror this character's unique prose during auditing.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                  Core Motivation
                </label>
                <textarea 
                  value={coreMotivation}
                  onChange={(e) => setCoreMotivation(e.target.value)}
                  placeholder="What drives this character's actions and speech? (e.g., Seeking redemption for a past failure...)"
                  rows={2}
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none"
                />
                <p className="text-[10px] text-on-surface-variant/50 italic ml-1">Used by Echo to craft dialogue subtext and intent.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                  Soul-Pattern (Core Voice Description)
                </label>
                <textarea 
                  value={soulPattern}
                  onChange={(e) => setSoulPattern(e.target.value)}
                  placeholder="Describe the core essence of their voice..."
                  rows={2}
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Cognitive Speech Patterns</label>
                <textarea 
                  value={cognitiveSpeech} 
                  onChange={(e) => setCognitiveSpeech(e.target.value)} 
                  placeholder="How they think and speak. e.g., Analytical, jumps to conclusions, stutters when nervous, uses complex vocabulary."
                  rows={3}
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                  <Brain className="w-3.5 h-3.5" />
                  Signature Traits (Comma separated)
                </label>
                <textarea 
                  value={signatureTraits} 
                  onChange={(e) => setSignatureTraits(e.target.value)} 
                  placeholder="e.g., Cynical wit, highly formal, prone to metaphor"
                  rows={2}
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                  <Quote className="w-3.5 h-3.5" />
                  Signature Idioms (Comma separated)
                </label>
                <textarea 
                  value={idioms} 
                  onChange={(e) => setIdioms(e.target.value)} 
                  placeholder="e.g., 'By the Drowning Deep', 'Mark my words'"
                  rows={2}
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none" 
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                    Example Lines
                  </label>
                  <button type="button" onClick={handleAddExampleLine} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {exampleLines.map((line, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={line} onChange={(e) => handleExampleLineChange(index, e.target.value)} placeholder="e.g., 'I told you so.'" className="flex-1 bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                      {exampleLines.length > 1 && (
                        <button type="button" onClick={() => handleRemoveExampleLine(index)} className="p-2 rounded-xl text-error hover:bg-error/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Conflict Style</label>
                  <textarea 
                    value={conflictStyle} 
                    onChange={(e) => setConflictStyle(e.target.value)} 
                    placeholder="e.g., Avoids confrontation, passive-aggressive, aggressive"
                    rows={2}
                    className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Conversational Role</label>
                  <textarea 
                    value={conversationalRole} 
                    onChange={(e) => setConversationalRole(e.target.value)} 
                    placeholder="e.g., The listener, the instigator, the mediator"
                    rows={2}
                    className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Physical Tells</label>
                  <textarea 
                    value={physicalTells} 
                    onChange={(e) => setPhysicalTells(e.target.value)} 
                    placeholder="e.g., Fidgets with rings, avoids eye contact, taps foot"
                    rows={2}
                    className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Internal Monologue</label>
                  <textarea 
                    value={internalMonologue} 
                    onChange={(e) => setInternalMonologue(e.target.value)} 
                    placeholder="e.g., Stream of consciousness, cynical, overly analytical"
                    rows={2}
                    className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none" 
                  />
                </div>
              </div>

              {/* Social Dynamics Section */}
              <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">Social Dynamics</h3>
                      <p className="text-[10px] text-on-surface-variant">Define relationships and tension levels for social consistency audits.</p>
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

                <div className="space-y-3">
                  {relationships.map((rel, idx) => (
                    <div key={idx} className="p-4 bg-surface-container-highest/30 border border-outline-variant/20 rounded-2xl space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Target</label>
                          <select 
                            value={rel.targetId}
                            onChange={(e) => handleRelationshipChange(idx, 'targetId', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                          >
                            <option value="">Select Character...</option>
                            {voiceProfiles.filter(p => p.id !== initialData?.id).map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Type</label>
                          <input 
                            type="text"
                            value={rel.type}
                            onChange={(e) => handleRelationshipChange(idx, 'type', e.target.value)}
                            placeholder="e.g., Rival, Mentor, Sibling"
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                          />
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
                      </div>
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant ml-1">Context / History</label>
                          <input 
                            type="text"
                            value={rel.context}
                            onChange={(e) => handleRelationshipChange(idx, 'context', e.target.value)}
                            placeholder="Brief history of this dynamic..."
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
                  ))}
                  {relationships.length === 0 && (
                    <p className="text-[10px] text-on-surface-variant/40 italic text-center py-4">No relationships defined yet.</p>
                  )}
                </div>
              </div>
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
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
