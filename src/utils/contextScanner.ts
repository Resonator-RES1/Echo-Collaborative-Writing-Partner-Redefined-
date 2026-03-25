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
        const isMentioned = terms.some(term => {
            if (!term.trim()) return false;
            const regex = getRegex(term);
            return regex.test(text);
        });

        if (isMentioned) {
            // Use regex with word boundaries for more robust pronoun detection
            const checkPronoun = (pronoun: string, replacement: string, idSuffix: string) => {
                const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
                if (regex.test(text)) {
                    warnings.push({ 
                        id: `pronoun-${idSuffix}-${voice.id}`, 
                        type: 'voice', 
                        severity: 'medium', 
                        message: `Possible pronoun mismatch for ${voice.name} (Profile: ${voice.gender}, but found '${pronoun}').`, 
                        actionable: { original: pronoun, replacement: replacement } 
                    });
                }
            };

            if (voice.gender === 'male') {
                checkPronoun('she', 'he', 'she');
                checkPronoun('her', 'his', 'her');
                checkPronoun('hers', 'his', 'hers');
            }
            if (voice.gender === 'female') {
                checkPronoun('he', 'she', 'he');
                checkPronoun('him', 'her', 'him');
                checkPronoun('his', 'her', 'his');
            }

            // Check for alias usage (Info alert)
            if (voice.aliases && voice.aliases.length > 0) {
                voice.aliases.forEach(alias => {
                    if (!alias.trim()) return;
                    const regex = getRegex(alias);
                    if (regex.test(text)) {
                        warnings.push({
                            id: `alias-${voice.id}-${alias}`,
                            type: 'voice',
                            severity: 'low',
                            message: `Using alias "${alias}" for ${voice.name}.`,
                            actionable: { original: alias, replacement: voice.name }
                        });
                    }
                });
            }
        }
    });

    // 2. Lore checks (e.g., checking if an alias is used)
    activeLore.forEach(lore => {
        const title = lore.title.toLowerCase();
        const terms = [title, ...(lore.aliases || []).map(a => a.toLowerCase())];
        const isMentioned = terms.some(term => {
            if (!term.trim()) return false;
            const regex = getRegex(term);
            return regex.test(text);
        });

        if (isMentioned && lore.aliases && lore.aliases.length > 0) {
            lore.aliases.forEach(alias => {
                if (!alias.trim()) return;
                const regex = getRegex(alias);
                if (regex.test(text)) {
                    warnings.push({
                        id: `alias-${lore.id}-${alias}`,
                        type: 'lore',
                        severity: 'low',
                        message: `Using alias "${alias}" for ${lore.title}.`,
                        actionable: { original: alias, replacement: lore.title }
                    });
                }
            });
        }
    });

    return warnings;
};
