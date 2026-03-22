import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { 
    ECHO_SYSTEM_PROMPT,
    FOCUS_AREA_PROMPTS,
} from '../constants';
import { 
    FocusArea, 
    LoreEntry,
    VoiceProfile,
    RefinedVersion,
    AuthorVoice,
    FeedbackDepth
} from '../types';

export interface GenerationConfig {
    model: 'gemini-3.1-flash-lite-preview' | 'gemini-3.1-pro-preview' | 'gemini-3-flash-preview';
    temperature: number;
}

const getSystemPrompt = () => {
    return `${ECHO_SYSTEM_PROMPT}

---

## 🛡️ SAFETY VALVE: LORE CONFLICT DETECTION
If a sentence in the chapter directly contradicts an Active Lore entry and you cannot reconcile it without a major rewrite, you MUST identify it.
Return these in the "conflicts" array in the JSON response.

## 📊 PROSE ANALYTICS (VIBE RADAR)
Provide a score from 1-10 for the following metrics. Rate these metrics based strictly on the provided chapter text relative to the Author Voice profile. A '10' means perfect alignment; a '1' means the prose is generic or flat.
1. **Sensory Vividness**: Depth of texture, smell, sound, and physical grounding.
2. **Pacing Rhythm**: Sentence variety, flow, and structural complexity.
3. **Dialogue Authenticity**: Naturalness, subtext, and character-specific cadence.
4. **Voice Consistency**: Adherence to the Master Author Voice.

## ⚖️ REFINEMENT AUDIT
Provide a percentage (0-100) for the following:
1. **Lore Compliance**: How well the text respects active lore.
2. **Voice Adherence**: How well the text matches the active author/character voices.
3. **Focus Area Improvement**: The degree of improvement in the selected focus areas.

## ACTIVE MODE: REFINE MODE
Produce a polished version of the text that is fully integrated with Lore + Voice + Focus Areas. Clean, immersive, and publication-ready.`;
};

async function callAiApi(payload: any, retryCount = 0): Promise<any> {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please check your environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const { model, prompt, systemInstruction, temperature, responseSchema } = payload;
    const modelName = model || "gemini-3.1-flash-lite-preview";

    // Flash models should use LOW thinking level for speed
    const isFlash = modelName.includes('flash');
    const thinkingLevel = isFlash ? ThinkingLevel.LOW : ThinkingLevel.HIGH;

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

export interface RefineDraftOptions {
  draft: string;
  generationConfig: GenerationConfig;
  focusAreas: FocusArea[];
  loreEntries?: LoreEntry[];
  voiceProfiles?: VoiceProfile[];
  authorVoices?: AuthorVoice[];
  chapterNumber?: number;
  previousEchoes?: RefinedVersion[];
  feedbackDepth?: FeedbackDepth;
}

export interface RefineDraftResult {
  text: string;
  summary: string;
  voiceAdherence: string;
  structuralCompliance: string;
  conflicts: { sentence: string; reason: string }[];
  metrics: { sensory_vividness: number; pacing_rhythm: number; dialogue_authenticity: number; voice_consistency: number };
  audit: { loreCompliance: number; voiceAdherence: number; focusAreaImprovement: number };
}

export const refineDraft = async (options: RefineDraftOptions): Promise<RefineDraftResult> => {
  try {
    const {
      draft,
      generationConfig,
      focusAreas,
      loreEntries = [],
      voiceProfiles = [],
      authorVoices = [],
      chapterNumber,
      previousEchoes = [],
      feedbackDepth = 'balanced'
    } = options;

    const systemInstruction = getSystemPrompt();
    
    let preamble = '';

    const activeLore = loreEntries.filter(e => e.isActive);
    if (activeLore.length > 0) {
        preamble += '*** ACTIVE LORE (PRIMARY TRUTH) ***\nUse the following lore entries for consistency and world-building. These are the primary truth:\n' +
            activeLore.map(l => `- [${l.category}] ${l.title}: ${l.content}`).join('\n') + '\n\n';
    }

    const activeAuthorVoice = authorVoices.find(v => v.isActive);
    if (activeAuthorVoice) {
        preamble += `*** MASTER AUTHOR VOICE (PRIMARY NARRATIVE STYLE) ***\n`;
        preamble += `CRITICAL: All non-dialogue prose and narration MUST strictly adhere to this style. This is the "Master Voice" for the story's narrative identity.\n`;
        preamble += `- Style: ${activeAuthorVoice.narrativeStyle}\n`;
        preamble += `- Structure: ${activeAuthorVoice.proseStructure}\n`;
        preamble += `- Pacing: ${activeAuthorVoice.pacingAndRhythm}\n`;
        preamble += `- Vocabulary: ${activeAuthorVoice.vocabularyAndDiction}\n`;
        preamble += `- Themes: ${activeAuthorVoice.thematicAnchors}\n\n`;
    }

    const activeVoices = voiceProfiles.filter(v => v.isActive);
    if (activeVoices.length > 0) {
        preamble += '*** CHARACTER VOICE REFERENCE (DIALOGUE & BEHAVIOR) ***\n';
        preamble += `CRITICAL: Use these patterns ONLY for character dialogue and specific character-driven actions. If a character is NOT found in the specific text snippet being refined, ignore their voice profile to save reasoning power.\n`;
        preamble += activeVoices.map(v => `- ${v.name} (${v.archetype}): ${v.soulPattern}. Speech: ${v.speechPatterns}. Emotional Expression: ${v.emotionalExpression}`).join('\n') + '\n\n';
    }

    if (previousEchoes.length > 0) {
        preamble += '*** SLIDING WINDOW CONTEXT (PREVIOUS ECHOES) ***\nUse the following recent story context to maintain narrative continuity, pacing, and plot flow. Do NOT rewrite this context, just use it to inform the current draft:\n' +
            previousEchoes.slice(0, 2).map((e, i) => `[Previous Context ${i + 1}]:\n${e.text.substring(0, 500)}...`).join('\n\n') + '\n\n';
    }

    if (focusAreas.length > 0) {
        const focusInstructions = focusAreas
            .map(area => FOCUS_AREA_PROMPTS[area])
            .filter(Boolean)
            .join('\n\n');
        
        if (focusInstructions) {
            preamble += `\n*** PRIORITY DIRECTIVES ***\nSimultaneously optimize for the following focus areas:\n${focusInstructions}\n\n`;
        }
    } else {
        preamble += `\n*** PRIORITY DIRECTIVES ***\nNo specific focus areas selected. Provide a general, balanced polish.\n\n`;
    }

    const outputInstruction = `
\n*** OUTPUT INSTRUCTIONS ***
You must return a JSON object containing the following fields:
1. "refinedText": The polished text in clean Markdown.
2. "summary": A brief summary of the changes made.
3. "voiceAdherence": An analysis of how well the text adheres to the requested author and character voices.
4. "structuralCompliance": An analysis of how well the text complies with the structural requirements and focus areas.
5. "conflicts": An array of objects with "sentence" and "reason" for any lore contradictions.
6. "metrics": An object with "sensory_vividness", "pacing_rhythm", "dialogue_authenticity", and "voice_consistency" scores (1-10).
7. "audit": An object with "loreCompliance", "voiceAdherence", and "focusAreaImprovement" percentages (0-100).
`;
    
    preamble += outputInstruction;
    const userPrompt = preamble ? `${preamble}\n\n---\n\n${draft}` : draft;

    const result = await callAiApi({
        model: generationConfig.model,
        prompt: userPrompt,
        systemInstruction,
        temperature: generationConfig.temperature,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                refinedText: { type: Type.STRING },
                summary: { type: Type.STRING },
                voiceAdherence: { type: Type.STRING },
                structuralCompliance: { type: Type.STRING },
                conflicts: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sentence: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        },
                        required: ["sentence", "reason"]
                    }
                },
                metrics: {
                    type: Type.OBJECT,
                    properties: {
                        sensory_vividness: { type: Type.NUMBER },
                        pacing_rhythm: { type: Type.NUMBER },
                        dialogue_authenticity: { type: Type.NUMBER },
                        voice_consistency: { type: Type.NUMBER }
                    },
                    required: ["sensory_vividness", "pacing_rhythm", "dialogue_authenticity", "voice_consistency"]
                },
                audit: {
                    type: Type.OBJECT,
                    properties: {
                        loreCompliance: { type: Type.NUMBER },
                        voiceAdherence: { type: Type.NUMBER },
                        focusAreaImprovement: { type: Type.NUMBER }
                    },
                    required: ["loreCompliance", "voiceAdherence", "focusAreaImprovement"]
                }
            },
            required: ["refinedText", "summary", "voiceAdherence", "structuralCompliance", "conflicts", "metrics", "audit"]
        }
    });

    const parsed = JSON.parse(result.text || "{}");
    const cleanText = (text: string) => {
        if (!text) return "";
        return text.replace(/^```markdown\n?/, '').replace(/```$/, '').trim();
    };

    return {
        text: cleanText(parsed.refinedText || ""),
        summary: parsed.summary || "",
        voiceAdherence: parsed.voiceAdherence || "",
        structuralCompliance: parsed.structuralCompliance || "",
        conflicts: parsed.conflicts || [],
        metrics: parsed.metrics || { sensory_vividness: 5, pacing_rhythm: 5, dialogue_authenticity: 5, voice_consistency: 5 },
        audit: parsed.audit || { loreCompliance: 50, voiceAdherence: 50, focusAreaImprovement: 50 }
    };
  } catch (error: any) {
      console.error("Error refining draft:", error);
      return { 
          text: `Error: ${error.message}`,
          summary: "",
          voiceAdherence: "",
          structuralCompliance: "",
          conflicts: [],
          metrics: { sensory_vividness: 0, pacing_rhythm: 0, dialogue_authenticity: 0, voice_consistency: 0 },
          audit: { loreCompliance: 0, voiceAdherence: 0, focusAreaImprovement: 0 }
      };
  }
};
