import { LoreEntry, VoiceProfile } from '../types';

export const scanForContext = (text: string, entries: (LoreEntry | VoiceProfile)[]) => {
    const foundIds: string[] = [];
    
    entries.forEach(entry => {
        const titleOrName = (entry as LoreEntry).title || (entry as VoiceProfile).name;
        const terms = [titleOrName, ...(entry.aliases || [])];
        
        for (const term of terms) {
            // Case-insensitive regex with word boundaries and optional possessive
            const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:'s)?\\b`, 'gi');
            if (regex.test(text)) {
                foundIds.push(entry.id);
                break;
            }
        }
    });
    
    return foundIds;
};
