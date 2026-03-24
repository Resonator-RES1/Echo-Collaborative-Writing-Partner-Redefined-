import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, Replace, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { Scene, LoreEntry, VoiceProfile, AuthorVoice } from '../types';

import { useLore } from '../contexts/LoreContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  onUpdateScene: (scene: Scene) => void;
  showToast: (message: string) => void;
}

type MatchType = 'scene' | 'lore' | 'voiceProfile' | 'authorVoice';

interface SearchMatch {
  id: string;
  type: MatchType;
  title: string;
  text: string;
  index: number;
  item: any;
}

export function GlobalSearchModal({
  isOpen, onClose, scenes, onUpdateScene, showToast
}: GlobalSearchModalProps) {
  const { 
    loreEntries, 
    voiceProfiles, 
    authorVoices,
    addLoreEntry,
    addVoiceProfile,
    addAuthorVoice
  } = useLore();

  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());

  const onUpdateLore = useCallback(async (lore: LoreEntry) => {
    await addLoreEntry(lore);
  }, [addLoreEntry]);

  const onUpdateVoiceProfile = useCallback(async (voice: VoiceProfile) => {
    await addVoiceProfile(voice);
  }, [addVoiceProfile]);

  const onUpdateAuthorVoice = useCallback(async (voice: AuthorVoice) => {
    await addAuthorVoice(voice);
  }, [addAuthorVoice]);

  const matches = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const results: SearchMatch[] = [];
    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    // Search Scenes
    scenes.forEach(scene => {
      let match;
      while ((match = searchRegex.exec(scene.content)) !== null) {
        results.push({
          id: `scene-${scene.id}-${match.index}`,
          type: 'scene',
          title: `Scene: ${scene.title}`,
          text: getSnippet(scene.content, match.index, query.length),
          index: match.index,
          item: scene
        });
      }
    });

    // Search Lore
    loreEntries.forEach(lore => {
      let match;
      while ((match = searchRegex.exec(lore.content)) !== null) {
        results.push({
          id: `lore-${lore.id}-${match.index}`,
          type: 'lore',
          title: `Lore: ${lore.title}`,
          text: getSnippet(lore.content, match.index, query.length),
          index: match.index,
          item: lore
        });
      }
    });

    // Search Voice Profiles
    voiceProfiles.forEach(vp => {
        const fullText = `${vp.soulPattern} ${vp.speechPatterns} ${vp.behavioralAnchors}`;
        let match;
        while ((match = searchRegex.exec(fullText)) !== null) {
          results.push({
            id: `vp-${vp.id}-${match.index}`,
            type: 'voiceProfile',
            title: `Voice: ${vp.name}`,
            text: getSnippet(fullText, match.index, query.length),
            index: match.index,
            item: vp
          });
        }
    });

    return results;
  }, [query, scenes, loreEntries, voiceProfiles, authorVoices]);

  const getSnippet = (text: string, index: number, length: number) => {
      const start = Math.max(0, index - 30);
      const end = Math.min(text.length, index + length + 30);
      return (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
  };

  const handleToggleMatch = (id: string) => {
      const newSet = new Set(selectedMatches);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedMatches(newSet);
  };

  const handleSelectAll = () => {
      if (selectedMatches.size === matches.length) {
          setSelectedMatches(new Set());
      } else {
          setSelectedMatches(new Set(matches.map(m => m.id)));
      }
  };

  const handleReplace = () => {
      if (selectedMatches.size === 0) return;

      const matchesToReplace = matches.filter(m => selectedMatches.has(m.id));
      
      // Group by item
      const grouped = matchesToReplace.reduce((acc, match) => {
          const key = `${match.type}-${match.item.id}`;
          if (!acc[key]) acc[key] = { type: match.type, item: match.item, replacements: [] };
          acc[key].replacements.push(match);
          return acc;
      }, {} as Record<string, { type: MatchType, item: any, replacements: SearchMatch[] }>);

      let replaceCount = 0;

      Object.values(grouped).forEach(group => {
          const { type, item, replacements } = group;
          // Sort replacements descending by index to avoid offset issues
          replacements.sort((a, b) => b.index - a.index);

          if (type === 'scene') {
              let newContent = item.content;
              replacements.forEach(r => {
                  newContent = newContent.substring(0, r.index) + replaceText + newContent.substring(r.index + query.length);
                  replaceCount++;
              });
              onUpdateScene({ ...item, content: newContent, lastModified: new Date().toISOString() });
          } else if (type === 'lore') {
              let newContent = item.content;
              replacements.forEach(r => {
                  newContent = newContent.substring(0, r.index) + replaceText + newContent.substring(r.index + query.length);
                  replaceCount++;
              });
              onUpdateLore({ ...item, content: newContent, lastModified: new Date().toISOString() });
          }
      });

      showToast(`Replaced ${replaceCount} occurrences.`);
      setSelectedMatches(new Set());
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-outline-variant/10 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-headline text-lg lg:text-xl text-on-surface">Global Search & Replace</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 lg:p-6 border-b border-outline-variant/10 bg-surface-container-lowest space-y-4">
            <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Search</label>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        placeholder="Find text..."
                    />
                </div>
                <div className="flex-1 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Replace</label>
                    <input 
                        type="text" 
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        placeholder="Replace with..."
                    />
                </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                    {matches.length} matches found
                </span>
                <button 
                    onClick={handleReplace}
                    disabled={selectedMatches.size === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label text-xs uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <Replace className="w-4 h-4" />
                    Replace Selected ({selectedMatches.size})
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2 bg-surface">
            {matches.length > 0 && (
                <div className="flex items-center gap-2 mb-4 px-2 cursor-pointer" onClick={handleSelectAll}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedMatches.size === matches.length ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant/50'}`}>
                        {selectedMatches.size === matches.length && <Check className="w-3 h-3" />}
                    </div>
                    <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Select All</span>
                </div>
            )}
            
            {matches.map(match => (
                <div 
                    key={match.id} 
                    onClick={() => handleToggleMatch(match.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex gap-3 ${selectedMatches.has(match.id) ? 'bg-primary/5 border-primary/30' : 'bg-surface-container-lowest border-outline-variant/10 hover:border-outline-variant/30'}`}
                >
                    <div className="pt-0.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedMatches.has(match.id) ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant/50'}`}>
                            {selectedMatches.has(match.id) && <Check className="w-3 h-3" />}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                {match.type}
                            </span>
                            <span className="text-sm font-medium text-on-surface truncate">{match.title}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant font-body leading-relaxed break-words">
                            {match.text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part, i) => 
                                part.toLowerCase() === query.toLowerCase() ? 
                                    <span key={i} className="bg-primary/20 text-primary font-bold px-0.5 rounded">{part}</span> : part
                            )}
                        </p>
                    </div>
                </div>
            ))}

            {query.length >= 2 && matches.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="font-label text-xs uppercase tracking-widest">No matches found</p>
                </div>
            )}
            
            {query.length < 2 && (
                <div className="text-center py-12 text-on-surface-variant">
                    <p className="font-label text-xs uppercase tracking-widest">Type at least 2 characters to search</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
