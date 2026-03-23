import { LoreEntry, VoiceProfile } from '../types';

export interface ContinuityIssue {
    id: string;
    type: 'lore' | 'voice' | 'general';
    message: string;
    severity: 'low' | 'medium' | 'high';
    actionable?: {
        original: string;
        replacement: string;
    };
}

// Cache for compiled regexes to improve performance
const regexCache = new Map<string, RegExp>();

const getRegex = (term: string): RegExp => {
    if (regexCache.has(term)) {
        return regexCache.get(term)!;
    }
    // Case-insensitive regex with word boundaries and optional possessive
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:'s)?\\b`, 'gi');
    regexCache.set(term, regex);
    return regex;
};

export const scanForContext = (text: string, entries: (LoreEntry | VoiceProfile)[]) => {
    const foundIds: string[] = [];
    
    entries.forEach(entry => {
        const titleOrName = (entry as LoreEntry).title || (entry as VoiceProfile).name;
        const terms = [titleOrName, ...(entry.aliases || [])];
        
        for (const term of terms) {
            if (!term.trim()) continue;
            const regex = getRegex(term);
            if (regex.test(text)) {
                foundIds.push(entry.id);
                break;
            }
        }
    });
    
    return foundIds;
};

export const detectPotentialInconsistencies = (text: string, activeLore: LoreEntry[], activeVoices: VoiceProfile[]): ContinuityIssue[] => {
    const warnings: ContinuityIssue[] = [];
    const lowerText = text.toLowerCase();

    // 1. Check for gender pronoun mismatches if gender is defined in voice profiles
    activeVoices.forEach(voice => {
        const name = voice.name.toLowerCase();
        
        // Check if the main name or any alias is mentioned
        const terms = [name, ...(voice.aliases || []).map(a => a.toLowerCase())];
        const isMentioned = terms.some(term => term.trim() && lowerText.includes(term));

        if (isMentioned) {
            // Very basic heuristic: if name is present, check for common pronoun mismatches
            if (voice.gender === 'male') {
                if (lowerText.includes(' she ')) {
                    warnings.push({ id: `pronoun-she-${voice.id}`, type: 'voice', severity: 'low', message: `Possible pronoun mismatch for ${voice.name} (Profile: Male, but found 'she').`, actionable: { original: 'she', replacement: 'he' } });
                }
                if (lowerText.includes(' her ')) {
                    warnings.push({ id: `pronoun-her-${voice.id}`, type: 'voice', severity: 'low', message: `Possible pronoun mismatch for ${voice.name} (Profile: Male, but found 'her').`, actionable: { original: 'her', replacement: 'his' } });
                }
            }
            if (voice.gender === 'female') {
                if (lowerText.includes(' he ')) {
                    warnings.push({ id: `pronoun-he-${voice.id}`, type: 'voice', severity: 'low', message: `Possible pronoun mismatch for ${voice.name} (Profile: Female, but found 'he').`, actionable: { original: 'he', replacement: 'she' } });
                }
                if (lowerText.includes(' him ')) {
                    warnings.push({ id: `pronoun-him-${voice.id}`, type: 'voice', severity: 'low', message: `Possible pronoun mismatch for ${voice.name} (Profile: Female, but found 'him').`, actionable: { original: 'him', replacement: 'her' } });
                }
                if (lowerText.includes(' his ')) {
                    warnings.push({ id: `pronoun-his-${voice.id}`, type: 'voice', severity: 'low', message: `Possible pronoun mismatch for ${voice.name} (Profile: Female, but found 'his').`, actionable: { original: 'his', replacement: 'hers' } });
                }
            }

            // Check if an alias is used instead of the main name
            if (voice.aliases && voice.aliases.length > 0 && !lowerText.includes(name)) {
                const usedAlias = voice.aliases.find(a => lowerText.includes(a.toLowerCase()));
                if (usedAlias) {
                    warnings.push({
                        id: `alias-${voice.id}-${usedAlias}`,
                        type: 'voice',
                        severity: 'low',
                        message: `Using alias "${usedAlias}" for ${voice.name}.`,
                        actionable: { original: usedAlias, replacement: voice.name }
                    });
                }
            }
        }
    });

    // 2. Lore checks (e.g., checking if an alias is used without the main title)
    activeLore.forEach(lore => {
        const title = lore.title.toLowerCase();
        const terms = [title, ...(lore.aliases || []).map(a => a.toLowerCase())];
        const isMentioned = terms.some(term => term.trim() && lowerText.includes(term));

        if (isMentioned && lore.aliases && lore.aliases.length > 0 && !lowerText.includes(title)) {
            const usedAlias = lore.aliases.find(a => lowerText.includes(a.toLowerCase()));
            if (usedAlias) {
                warnings.push({
                    id: `alias-${lore.id}-${usedAlias}`,
                    type: 'lore',
                    severity: 'low',
                    message: `Using alias "${usedAlias}" for ${lore.title}.`,
                    actionable: { original: usedAlias, replacement: lore.title }
                });
            }
        }
    });

    return warnings;
};
