import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export interface GenerationConfig {
    model: 'gemini-3.1-flash-lite-preview' | 'gemini-3.1-pro-preview' | 'gemini-3-flash-preview';
    temperature: number;
}

export async function callAiApi(payload: any, retryCount = 0): Promise<any> {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please check your environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const { model, prompt, systemInstruction, temperature, responseSchema, feedbackDepth } = payload;
    const modelName = model || "gemini-3.1-flash-lite-preview";

    // Intelligence Model & Polish Depth Optimization
    // Tie thinking level to the user's requested polish depth
    let thinkingLevel = ThinkingLevel.LOW; // Default to fast
    
    if (feedbackDepth === 'in-depth') {
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
                temperature: temperature ?? 0.7,
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
