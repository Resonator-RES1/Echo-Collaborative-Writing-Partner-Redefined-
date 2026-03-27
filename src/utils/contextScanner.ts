import MiniSearch from 'minisearch';
import { LoreEntry, VoiceProfile, Scene } from '../types';

export interface ContinuityIssue {
    id: string;
    type: 'lore' | 'voice' | 'general' | 'timeline' | 'social' | 'conceptual';
    message: string;
    severity: 'low' | 'medium' | 'high';
    actionable?: {
        original: string;
        replacement: string;
    };
    linkedEntryId?: string;
}

export interface ScannerInstances {
    miniSearch: MiniSearch;
}

export const createScanner = (entries: LoreEntry[], voices: VoiceProfile[]): ScannerInstances => {
    const miniSearch = new MiniSearch({
        fields: ['title', 'name', 'aliases'],
        storeFields: ['id', 'type'],
        searchOptions: {
            boost: { title: 2, name: 2, aliases: 1.5 },
            fuzzy: 0.1,
            prefix: false
        }
    });

    const documents = [
        ...entries.map(e => ({
            id: e.id,
            title: e.title,
            aliases: e.aliases?.join(' ') || '',
            type: 'lore'
        })),
        ...voices.map(v => ({
            id: v.id,
            name: v.name,
            aliases: v.aliases?.join(' ') || '',
            type: 'voice'
        }))
    ];
    
    const addDocuments = () => miniSearch.addAll(documents);
    if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(addDocuments);
    } else {
        setTimeout(addDocuments, 0);
    }
    
    return { miniSearch };
};

export const scanForContext = (text: string, miniSearch: MiniSearch) => {
    if (!text.trim() || !miniSearch) return [];
    
    const results = miniSearch.search(text);
    return results.map(r => r.id);
};

export const detectTimelineIssues = (text: string, currentScene: Scene | undefined, loreEntries: LoreEntry[]): ContinuityIssue[] => {
    const issues: ContinuityIssue[] = [];
    if (!currentScene || currentScene.storyDay === undefined) return issues;

    const timelineEntries = loreEntries.filter(e => e.category === 'Timeline' && e.storyDay !== undefined);
    
    timelineEntries.forEach(entry => {
        const titleRegex = new RegExp(`\\b${entry.title.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
        if (titleRegex.test(text)) {
            if (currentScene.storyDay! < entry.storyDay!) {
                issues.push({
                    id: `timeline-${entry.id}`,
                    type: 'timeline',
                    severity: 'high',
                    message: `Chronological Anomaly: Scene occurs on Day ${currentScene.storyDay}, but references "${entry.title}" which happens on Day ${entry.storyDay}.`
                });
            }
        }
    });

    return issues;
};

export const checkSocialConsistency = (text: string, activeVoices: VoiceProfile[], loreEntries: LoreEntry[]): ContinuityIssue[] => {
    const issues: ContinuityIssue[] = [];
    
    // Friendly keywords that might contradict tense relationships
    const friendlyKeywords = ['smiled warmly', 'laughed together', 'hugged', 'best friend', 'trusted', 'kindly'];
    
    activeVoices.forEach(voice => {
        const characterLore = loreEntries.find(e => e.title.toLowerCase() === voice.name.toLowerCase() && e.category === 'Characters');
        if (!characterLore || !characterLore.relationships) return;

        characterLore.relationships.forEach(rel => {
            if (rel.type.toLowerCase().includes('combustive') || rel.type.toLowerCase().includes('tense') || rel.tension >= 4) {
                const targetVoice = activeVoices.find(v => v.id === rel.targetId);
                if (targetVoice) {
                    const bothMentioned = 
                        new RegExp(`\\b${voice.name}\\b`, 'gi').test(text) && 
                        new RegExp(`\\b${targetVoice.name}\\b`, 'gi').test(text);
                    
                    if (bothMentioned) {
                        const foundFriendly = friendlyKeywords.find(k => text.toLowerCase().includes(k));
                        if (foundFriendly) {
                            issues.push({
                                id: `social-${voice.id}-${targetVoice.id}`,
                                type: 'social',
                                severity: 'medium',
                                message: `Social Dissonance: ${voice.name} and ${targetVoice.name} have a ${rel.type} relationship, but the text suggests warmth ("${foundFriendly}").`
                            });
                        }
                    }
                }
            }
        });
    });

    return issues;
};

export const performLocalScan = (
    text: string, 
    loreEntries: LoreEntry[], 
    activeVoices: VoiceProfile[], 
    currentScene: Scene | undefined,
    miniSearch: MiniSearch
): ContinuityIssue[] => {
    const issues: ContinuityIssue[] = [];
    if (!text.trim() || !miniSearch) return issues;

    // 1. Hard Matches (MiniSearch)
    const hardMatches = miniSearch.search(text);
    
    // 2. Conceptual Hits (Fuzzy MiniSearch)
    const conceptualHits = miniSearch.search(text, {
        fuzzy: 0.2,
        prefix: false
    }).filter(hit => !hardMatches.find(hm => hm.id === hit.id));

    conceptualHits.slice(0, 2).forEach(hit => {
        const entry = loreEntries.find(e => e.id === hit.id);
        if (entry && !entry.isActive) {
            issues.push({
                id: `conceptual-${hit.id}`,
                type: 'conceptual',
                severity: 'low',
                message: `Thematic Connection: "${entry.title}" seems relevant to this scene's mood or concepts.`,
                linkedEntryId: entry.id
            });
        }
    });

    // 3. Timeline Guard
    issues.push(...detectTimelineIssues(text, currentScene, loreEntries));

    // 4. Social dynamics
    issues.push(...checkSocialConsistency(text, activeVoices, loreEntries));

    // 5. Pronoun/Gender checks
    activeVoices.forEach(voice => {
        const nameRegex = new RegExp(`\\b${voice.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
        if (nameRegex.test(text)) {
            const checkPronoun = (pronoun: string, replacement: string, idSuffix: string) => {
                const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
                if (regex.test(text)) {
                    issues.push({ 
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
            }
            if (voice.gender === 'female') {
                checkPronoun('he', 'she', 'he');
                checkPronoun('him', 'her', 'him');
            }
        }
    });

    return issues;
};
