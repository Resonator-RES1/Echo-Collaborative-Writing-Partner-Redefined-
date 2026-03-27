import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { getSetting } from "../dbService";

export interface GenerationConfig {
    model: 'gemini-3.1-flash-lite-preview' | 'gemini-3.1-pro-preview' | 'gemini-3-flash-preview';
    temperature?: number; // Should now always default to 1.0
    thinkingConfig?: {
        thinkingLevel: 'low' | 'default' | 'high';
    };
}

export interface AiPayload {
    model?: string;
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    thinkingConfig?: {
        thinkingLevel: 'low' | 'default' | 'high';
    };
    responseSchema?: any;
    feedbackDepth?: 'casual' | 'balanced' | 'in-depth';
}

export async function callAiApi(payload: AiPayload, retryCount = 0): Promise<any> {
    const dbApiKey = await getSetting('api_key');
    const apiKey = dbApiKey
        || import.meta.env.VITE_GEMINI_API_KEY 
        || import.meta.env.VITE_API_KEY
        || (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : undefined)
        || (typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined);
        
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please check your environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const { model, prompt, systemInstruction, temperature, thinkingConfig, responseSchema, feedbackDepth } = payload;
    const modelName = model || "gemini-3.1-flash-lite-preview";

    // Intelligence Model & Polish Depth Optimization
    // Tie thinking level to the user's requested polish depth
    let thinkingLevel = ThinkingLevel.LOW; // Default to fast
    
    if (thinkingConfig?.thinkingLevel) {
        thinkingLevel = thinkingConfig.thinkingLevel === 'high' ? ThinkingLevel.HIGH : 
                        thinkingConfig.thinkingLevel === 'low' ? ThinkingLevel.LOW : 
                        ThinkingLevel.LOW; // Fallback to LOW
    } else if (feedbackDepth === 'in-depth') {
        thinkingLevel = ThinkingLevel.HIGH; // Deepest reasoning for complex epics
    } else if (feedbackDepth === 'balanced') {
        // Balanced: Pro gets HIGH, Flash gets LOW
        thinkingLevel = modelName.includes('pro') ? ThinkingLevel.HIGH : ThinkingLevel.LOW;
    } else {
        // Casual: always LOW for speed
        thinkingLevel = ThinkingLevel.LOW;
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction,
                temperature: temperature ?? 1.0, // Forced to 1.0 for Gemini 3.1 reasoning stability
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                thinkingConfig: { thinkingLevel }
            }
        });

        return response;
    } catch (error: any) {
        const isRateLimit = error?.message?.includes('429') || error?.status === 429 || JSON.stringify(error).includes('429');
        
        if (isRateLimit && retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 2000 + Math.random() * 1000;
            console.warn(`Rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${retryCount + 1}/3)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callAiApi(payload, retryCount + 1);
        }
        
        throw error;
    }
}
