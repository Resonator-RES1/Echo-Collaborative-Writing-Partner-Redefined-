import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, Replace, Check } from 'lucide-react';
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
  const [peekMatch, setPeekMatch] = useState<SearchMatch | null>(null);

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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4 bg-background/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative flex gap-4 w-full max-w-2xl">
        <div className="bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl w-full max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-outline-variant/10 bg-surface-container-lowest">
            <div className="flex items-center gap-3 w-full">
              <Search className="w-5 h-5 text-primary opacity-70" />
              <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-lg text-on-surface focus:outline-none font-headline placeholder:text-on-surface-variant/40"
                  placeholder="Search lore, voices, or scenes... (Cmd+K to close)"
                  autoFocus
              />
            </div>
          </div>

          {query.length >= 2 && (
            <div className="p-3 border-b border-outline-variant/10 bg-surface-container-lowest flex gap-3 items-center">
                <input 
                    type="text" 
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    className="flex-1 bg-surface border border-outline-variant/20 rounded-lg px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="Replace with..."
                />
                <button 
                    onClick={handleReplace}
                    disabled={selectedMatches.size === 0}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label text-[10px] uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
                >
                    <Replace className="w-3 h-3" />
                    Replace ({selectedMatches.size})
                </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-surface custom-scrollbar">
              {matches.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 cursor-pointer hover:bg-surface-container-lowest rounded-lg transition-colors" onClick={handleSelectAll}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedMatches.size === matches.length ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant/50'}`}>
                          {selectedMatches.size === matches.length && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Select All</span>
                  </div>
              )}
              
              {matches.map(match => (
                  <div 
                      key={match.id} 
                      onClick={() => setPeekMatch(match)}
                      className={`p-3 rounded-xl cursor-pointer transition-all flex gap-3 ${peekMatch?.id === match.id ? 'bg-primary/10 border-primary/30' : 'hover:bg-surface-container-lowest border-transparent'} border`}
                  >
                      <div className="pt-0.5" onClick={(e) => { e.stopPropagation(); handleToggleMatch(match.id); }}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedMatches.has(match.id) ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant/50'}`}>
                              {selectedMatches.has(match.id) && <Check className="w-3 h-3" />}
                          </div>
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                              <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                                  {match.type}
                              </span>
                              <span className="text-sm font-medium text-on-surface truncate">{match.title}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant font-body leading-relaxed break-words line-clamp-2">
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
                      <p className="font-label text-xs uppercase tracking-widest">Type to search...</p>
                  </div>
              )}
          </div>
        </div>

        {/* Peek View Card */}
        {peekMatch && (peekMatch.type === 'lore' || peekMatch.type === 'voiceProfile') && (
          <div className="hidden md:flex flex-col w-80 bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-left-4 duration-200">
            <div className="p-4 border-b border-outline-variant/10 bg-surface-container-lowest sticky top-0">
              <h3 className="font-headline text-sm font-bold text-on-surface uppercase tracking-widest opacity-50">Peek View</h3>
            </div>
            <div className="p-5 space-y-4">
              {peekMatch.type === 'lore' && (
                <>
                  <div>
                    <h4 className="text-lg font-bold text-on-surface mb-1">{peekMatch.item.title}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">Lore Entry</span>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Content</h5>
                    <p className="text-sm text-on-surface/80 leading-relaxed whitespace-pre-wrap">{peekMatch.item.content}</p>
                  </div>
                  {peekMatch.item.sensoryPalette && (
                    <div className="space-y-1">
                      <h5 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Sensory Palette</h5>
                      <p className="text-sm text-on-surface/80 leading-relaxed whitespace-pre-wrap">{peekMatch.item.sensoryPalette}</p>
                    </div>
                  )}
                </>
              )}
              {peekMatch.type === 'voiceProfile' && (
                <>
                  <div>
                    <h4 className="text-lg font-bold text-on-surface mb-1">{peekMatch.item.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest">Voice Profile</span>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Archetype</h5>
                    <p className="text-sm text-on-surface/80 leading-relaxed">{peekMatch.item.archetype}</p>
                  </div>
                  {peekMatch.item.signatureTraits && peekMatch.item.signatureTraits.length > 0 && (
                    <div className="space-y-1">
                      <h5 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Signature Traits</h5>
                      <div className="flex flex-wrap gap-1">
                        {peekMatch.item.signatureTraits.map((trait: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-surface-container-highest rounded-md text-xs text-on-surface-variant">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
