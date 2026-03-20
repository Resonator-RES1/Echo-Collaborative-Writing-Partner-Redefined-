import React, { useState } from 'react';
import { X, Sparkles, Loader2, Brain } from 'lucide-react';
import { generateLoreEntriesFromText, generateVoiceProfilesFromText } from '../services/geminiService';
import { LoreEntry, VoiceProfile } from '../types';

interface BulkLoreExtractorModalProps {
  onClose: () => void;
  onAddEntries: (entries: LoreEntry[]) => void;
}

export function BulkLoreExtractorModal({ onClose, onAddEntries }: BulkLoreExtractorModalProps) {
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) return;
    setIsExtracting(true);
    setError(null);
    try {
      const extracted = await generateLoreEntriesFromText(text);
      const newEntries: LoreEntry[] = extracted.map(e => ({
        ...e,
        id: crypto.randomUUID(),
        lastModified: new Date().toISOString()
      })) as LoreEntry[];
      onAddEntries(newEntries);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to extract lore entries');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-2xl glass-slab rounded-[2rem] border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
          <div className="space-y-1">
            <h3 className="font-headline text-2xl font-light flex items-center gap-3">
              <Sparkles className="text-primary w-6 h-6" />
              Bulk Lore Extraction
            </h3>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">AI-Powered Context Mining</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-highest transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Paste Source Text</label>
            <p className="text-xs text-on-surface-variant/70 italic">Paste paragraphs, character descriptions, or world-building notes. Echo will parse them into structured entries.</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: The city of Aethelgard is built upon the ruins of a fallen celestial engine. Its streets are paved with obsidian, and the air hums with residual magic..."
              className="w-full h-64 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 transition-all font-body text-sm outline-none resize-none"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-body">
              {error}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-outline-variant/10 bg-surface-container-low/50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full font-label text-[10px] uppercase tracking-widest hover:bg-surface-container-highest transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExtract}
            disabled={isExtracting || !text.trim()}
            className="px-8 py-3 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mining Context...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract Lore
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface BulkVoiceExtractorModalProps {
  onClose: () => void;
  onAddProfiles: (profiles: VoiceProfile[]) => void;
}

export function BulkVoiceExtractorModal({ onClose, onAddProfiles }: BulkVoiceExtractorModalProps) {
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) return;
    setIsExtracting(true);
    setError(null);
    try {
      const extracted = await generateVoiceProfilesFromText(text);
      const newProfiles: VoiceProfile[] = extracted.map(p => ({
        ...p,
        id: crypto.randomUUID(),
        lastModified: new Date().toISOString(),
        isActive: true
      })) as VoiceProfile[];
      onAddProfiles(newProfiles);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to extract voice profiles');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-2xl glass-slab rounded-[2rem] border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
          <div className="space-y-1">
            <h3 className="font-headline text-2xl font-light flex items-center gap-3">
              <Brain className="text-primary w-6 h-6" />
              Bulk Voice Extraction
            </h3>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">AI-Powered Persona Mapping</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-highest transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Paste Character Text</label>
            <p className="text-xs text-on-surface-variant/70 italic">Paste dialogue samples, character descriptions, or personality notes. Echo will map their Soul-Patterns.</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: Captain Thorne spoke with a gravelly rasp, his words clipped as if he were counting every breath. 'The sea don't care for your titles,' he'd say, spitting over the rail. 'She only cares for the weight of your anchor.'"
              className="w-full h-64 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 transition-all font-body text-sm outline-none resize-none"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-body">
              {error}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-outline-variant/10 bg-surface-container-low/50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full font-label text-[10px] uppercase tracking-widest hover:bg-surface-container-highest transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExtract}
            disabled={isExtracting || !text.trim()}
            className="px-8 py-3 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mapping Soul-Patterns...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract Voices
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
