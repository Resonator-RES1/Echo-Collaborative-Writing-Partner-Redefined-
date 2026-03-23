import { GoogleGenAI, Type } from "@google/genai";
import { LoreEntry, VoiceProfile } from '../../types';

export const extractLoreFromText = async (text: string): Promise<Partial<LoreEntry>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
        You are an expert world-builder. Extract a lore entry from the following text.
        Identify the main subject (a place, item, event, faction, or concept) and summarize its details.
        
        TEXT:
        "${text}"
        
        Return a JSON object with:
        - title: The name of the subject
        - category: One of "World Mechanics", "Geography & Ecology", "Societal Strata", "Historical Context", "Current State"
        - content: A concise summary of the lore
        - aliases: An array of alternative names or titles mentioned
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        category: { type: Type.STRING },
                        content: { type: Type.STRING },
                        aliases: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "category", "content"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Lore extraction error:", error);
        throw error;
    }
};

export const extractVoiceFromText = async (text: string): Promise<Partial<VoiceProfile>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
        You are an expert character analyst. Extract a character voice profile from the following text.
        Identify the character and analyze their speaking style, behavior, and archetype.
        
        TEXT:
        "${text}"
        
        Return a JSON object with:
        - name: The character's name
        - archetype: Their role or archetype (e.g., "The Reluctant Hero", "Cynical Mentor")
        - speechPatterns: How they talk (e.g., "Short, clipped sentences. Uses nautical metaphors.")
        - soulPattern: Their core motivation or worldview
        - aliases: An array of alternative names or nicknames
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        archetype: { type: Type.STRING },
                        speechPatterns: { type: Type.STRING },
                        soulPattern: { type: Type.STRING },
                        aliases: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["name", "archetype", "speechPatterns", "soulPattern"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Voice extraction error:", error);
        throw error;
    }
};
