import MiniSearch from 'minisearch';
import { Voy } from 'voy-search';
import { LoreEntry, VoiceProfile, Scene } from '../types';
import { GoogleGenAI } from "@google/genai";

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
    voyInstance: any;
}

let isVoyEnabled = true;

export const createScanner = (entries: LoreEntry[], voices: VoiceProfile[]): ScannerInstances => {
    const miniSearch = new MiniSearch({
        fields: ['title', 'name', 'aliases', 'content'],
        storeFields: ['id', 'type'],
        searchOptions: {
            boost: { title: 2, name: 2, aliases: 1.5 },
            fuzzy: 0.2,
            prefix: true
        }
    });

    const documents = [
        ...entries.map(e => ({
            id: e.id,
            title: e.title,
            aliases: e.aliases?.join(' ') || '',
            content: e.content,
            type: 'lore'
        })),
        ...voices.map(v => ({
            id: v.id,
            name: v.name,
            aliases: v.aliases?.join(' ') || '',
            content: v.soulPattern + ' ' + v.cognitivePatterns,
            type: 'voice'
        }))
    ];
    
    miniSearch.addAll(documents);
    
    let voyInstance: any = null;
    const entriesWithEmbeddings = entries.filter(e => e.embedding && e.embedding.length > 0);
    if (isVoyEnabled && entriesWithEmbeddings.length > 0) {
        try {
            voyInstance = new Voy({
                embeddings: entriesWithEmbeddings.map(e => ({
                    id: e.id,
                    title: e.title,
                    url: '', // Required by Voy types
                    embeddings: e.embedding!
                }))
            });
        } catch (error) {
            console.error("Failed to initialize Voy:", error);
            isVoyEnabled = false;
            voyInstance = null;
        }
    }

    return { miniSearch, voyInstance };
};

// Helper to get embeddings from Gemini
export const getEmbedding = async (text: string): Promise<number[]> => {
    if (!process.env.GEMINI_API_KEY) return new Array(768).fill(0);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const result = await ai.models.embedContent({
            model: 'gemini-embedding-2-preview',
            contents: [text]
        });
        return result.embeddings[0].values;
    } catch (error) {
        console.error("Embedding error:", error);
        return new Array(768).fill(0);
    }
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
    
    // Fallback to fuzzy MiniSearch for conceptual hits if Voy isn't used
    const conceptualHits = miniSearch.search(text, {
        fuzzy: 0.4,
        prefix: false,
        boost: { content: 2 }
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

    // 2. Timeline Guard
    issues.push(...detectTimelineIssues(text, currentScene, loreEntries));

    // 3. Social dynamics
    issues.push(...checkSocialConsistency(text, activeVoices, loreEntries));

    // 4. Pronoun/Gender checks
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

export const performConceptualScan = async (
    text: string, 
    loreEntries: LoreEntry[],
    voyInstance: any,
    miniSearch: MiniSearch
): Promise<ContinuityIssue[]> => {
    const issues: ContinuityIssue[] = [];
    if (!text.trim() || !voyInstance || !process.env.GEMINI_API_KEY || !miniSearch) return issues;

    try {
        const queryVector = await getEmbedding(text);
        const searchResult = voyInstance.search(new Float32Array(queryVector), 3);
        const hits = searchResult.neighbors || [];
        
        const hardMatches = miniSearch.search(text);

        hits.forEach((hit: any) => {
            const entry = loreEntries.find(e => e.id === hit.id);
            // Only flag if it's not already a hard match and not active
            if (entry && !entry.isActive && !hardMatches.find(hm => hm.id === entry.id)) {
                issues.push({
                    id: `conceptual-deep-${entry.id}`,
                    type: 'conceptual',
                    severity: 'low',
                    message: `Deep Thematic Connection: "${entry.title}" strongly resonates with this scene's concepts.`,
                    linkedEntryId: entry.id
                });
            }
        });
    } catch (error) {
        console.error("Voy search error:", error);
    }

    return issues;
};
