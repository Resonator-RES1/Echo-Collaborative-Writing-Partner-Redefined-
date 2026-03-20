import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { 
    REVIEW_PROMPTS,
    ECHO_REVIEW_PROMPT_BASE,
    ECHO_SYSTEM_PROMPT,
    AUTHOR_VOICE_CHECK_PROMPT,
    COMPARE_CHANGES_PROMPT,
    SUGGEST_PHRASING_PROMPT,
    CHARACTER_PROFILE_GENERATOR_PROMPT,
    FOCUS_AREA_PROMPTS,
    REVIEW_FOCUS_AREA_PROMPTS,
    REACTION_FOCUS_AREA_PROMPTS,
    ECHO_REACTION_PROMPT_BASE,
} from '../constants';
import { 
    RefineMode, 
    FocusArea, 
    CharacterProfile, 
    ReviewPerspective, 
    ComparisonResponse,
    Gender,
    ComplianceReport,
    VoiceCheckResponse,
    LoreEntry,
    VoiceProfile
} from '../types';

export interface GenerationConfig {
    model: 'gemini-3.1-flash-lite-preview' | 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview';
    temperature: number;
}

const getSystemPrompt = (mode: RefineMode, reviewPerspective: ReviewPerspective) => {
    switch (mode) {
        case 'review':
            const specificPrompt = REVIEW_PROMPTS[reviewPerspective] || REVIEW_PROMPTS.reader; 
            return `${specificPrompt}\n\n---\n\n${ECHO_REVIEW_PROMPT_BASE}`;
        case 'reaction':
            return ECHO_REACTION_PROMPT_BASE;
        case 'collaborative':
        default:
            return ECHO_SYSTEM_PROMPT;
    }
};

async function callAiApi(payload: any) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please check your environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const { model, prompt, systemInstruction, temperature, responseSchema } = payload;
    const modelName = model || "gemini-3.1-flash-lite-preview";

    // Flash models should use LOW thinking level for speed
    const isFlash = modelName.includes('flash');
    const thinkingLevel = isFlash ? ThinkingLevel.LOW : ThinkingLevel.HIGH;

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
}

export interface RefineDraftOptions {
  draft: string;
  mode: RefineMode;
  generationConfig: GenerationConfig;
  focusAreas: FocusArea[];
  characterProfiles: CharacterProfile[];
  loreEntries?: LoreEntry[];
  voiceProfiles?: VoiceProfile[];
  reviewPerspective?: ReviewPerspective;
  chapterNumber?: number;
}

export interface RefineDraftResult {
  text: string;
  report: string | ComplianceReport;
}

export const refineDraft = async (options: RefineDraftOptions): Promise<RefineDraftResult> => {
  try {
    const {
      draft,
      mode,
      generationConfig,
      focusAreas,
      characterProfiles,
      loreEntries = [],
      voiceProfiles = [],
      reviewPerspective = 'reader',
      chapterNumber,
    } = options;

    const systemInstruction = getSystemPrompt(mode, reviewPerspective);
    
    let preamble = '';

    if (loreEntries.length > 0) {
        preamble += '*** LORE CONTEXT ***\nUse the following lore entries for consistency and world-building:\n' +
            loreEntries.map(l => `- [${l.category}] ${l.title}: ${l.content}`).join('\n') + '\n\n';
    }

    if (characterProfiles.length > 0) {
        preamble += '*** ACTIVE CHARACTER VOICES ***\nAdhere to the following character voice profiles:\n' +
            characterProfiles.filter(p => p.name.trim() && p.voice.trim()).map(p => {
                const genderInfo = p.gender && p.gender !== 'unspecified' ? ` (${p.gender})` : '';
                return `- ${p.name}${genderInfo}: ${p.voice}`;
            }).join('\n') + '\n\n';
    }

    if (voiceProfiles.length > 0 && mode === 'review') {
        preamble += '*** VOICE LIBRARY REFERENCE ***\nReference these established voice patterns for consistency:\n' +
            voiceProfiles.map(v => `- ${v.name} (${v.archetype}): ${v.soulPattern}`).join('\n') + '\n\n';
    }

    if (chapterNumber && mode !== 'review' && mode !== 'reaction') {
        preamble += `\n*** CHAPTER MANDATE ***\nYou MUST start the output with a Markdown H1 title: "# Chapter ${chapterNumber}: [Title]".\nIf the draft already has a title, use it (refined). If not, generate a fitting, atmospheric title based on the content.\n\n`;
    }

    if (focusAreas.length > 0) {
        const focusInstructions = focusAreas
            .map(area => mode === 'review' ? REVIEW_FOCUS_AREA_PROMPTS[area] : mode === 'reaction' ? REACTION_FOCUS_AREA_PROMPTS[area] : FOCUS_AREA_PROMPTS[area])
            .filter(Boolean)
            .join('\n\n');
        
        if (focusInstructions) {
            if (mode === 'review') {
                preamble += `\n*** SPECIFIC AREAS FOR CRITIQUE ***\nPlease pay special attention to the following aspects in your analysis:\n${focusInstructions}\n\n`;
            } else if (mode === 'reaction') {
                preamble += `\n*** SPECIFIC AREAS FOR REACTION ***\nPlease pay special attention to the following aspects in your reaction:\n${focusInstructions}\n\n`;
            } else {
                preamble += `\n*** PRIORITY DIRECTIVES ***\nSimultaneously optimize for the following focus areas:\n${focusInstructions}\n\n`;
            }
        }
    } else {
        preamble += `\n*** PRIORITY DIRECTIVES ***\nNo specific focus areas selected. Provide a general, balanced polish and keep the compliance report concise.\n\n`;
    }

    const wordCount = draft.trim().split(/\s+/).length;
    if (wordCount < 100) {
        preamble += `\n*** LENGTH DIRECTIVE ***\nThe input draft is very short (${wordCount} words). Keep the Structural Compliance Report extremely brief (just a few words per point) to ensure a rapid response time.\n\n`;
    } else if (wordCount < 300) {
        preamble += `\n*** LENGTH DIRECTIVE ***\nThe input draft is moderately sized (${wordCount} words). Keep the Structural Compliance Report concise (1 sentence per point) to ensure a fast response time.\n\n`;
    } else {
        preamble += `\n*** LENGTH DIRECTIVE ***\nThe input draft is long (${wordCount} words). Provide a comprehensive and detailed Structural Compliance Report.\n\n`;
    }

    let outputInstruction = '';
    if (mode === 'review') {
        outputInstruction = `
\n*** OUTPUT INSTRUCTIONS ***
You must return a JSON object containing two fields:
1. "refinedText": The detailed review and critique in clean Markdown, following the requested structure. Do NOT wrap this text in markdown code blocks. Return ONLY the content itself.
2. "complianceReport": A structured object containing the following fields:
   - mythicResonance: { "status": "Pass" or "Fail", "reasoning": "string" }
   - characterVoice: { "status": "Pass" or "Fail", "reasoning": "string" }
   - loreConsistency: { "status": "Pass" or "Fail", "reasoning": "string" }
   - thematicNote: "string" (One sentence summary)
`;
    } else if (mode === 'reaction') {
        outputInstruction = `
\n*** OUTPUT INSTRUCTIONS ***
You must return a JSON object containing two fields:
1. "refinedText": Your casual reaction and feedback in clean Markdown, following the requested structure. Do NOT wrap this text in markdown code blocks. Return ONLY the content itself.
2. "complianceReport": A structured object containing the following fields:
   - mythicResonance: { "status": "Pass" or "Fail", "reasoning": "string" }
   - characterVoice: { "status": "Pass" or "Fail", "reasoning": "string" }
   - loreConsistency: { "status": "Pass" or "Fail", "reasoning": "string" }
   - thematicNote: "string" (One sentence summary)
`;
    } else {
        outputInstruction = `
\n*** OUTPUT INSTRUCTIONS ***
You must return a JSON object containing two fields:
1. "refinedText": The polished text in clean Markdown. Do NOT wrap this text in markdown code blocks (e.g., do not start with \`\`\`markdown). Return ONLY the content itself.
2. "complianceReport": A structured object containing the following fields:
   - mythicResonance: { "status": "Pass" or "Fail", "reasoning": "string" }
   - characterVoice: { "status": "Pass" or "Fail", "reasoning": "string" }
   - loreConsistency: { "status": "Pass" or "Fail", "reasoning": "string" }
   - thematicNote: "string" (One sentence summary)
`;
    }
    
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
                complianceReport: { 
                    type: Type.OBJECT,
                    properties: {
                        mythicResonance: {
                            type: Type.OBJECT,
                            properties: {
                                status: { type: Type.STRING },
                                reasoning: { type: Type.STRING }
                            },
                            required: ["status", "reasoning"]
                        },
                        characterVoice: {
                            type: Type.OBJECT,
                            properties: {
                                status: { type: Type.STRING },
                                reasoning: { type: Type.STRING }
                            },
                            required: ["status", "reasoning"]
                        },
                        loreConsistency: {
                            type: Type.OBJECT,
                            properties: {
                                status: { type: Type.STRING },
                                reasoning: { type: Type.STRING }
                            },
                            required: ["status", "reasoning"]
                        },
                        thematicNote: { type: Type.STRING }
                    },
                    required: ["mythicResonance", "characterVoice", "loreConsistency", "thematicNote"]
                }
            },
            required: ["refinedText", "complianceReport"]
        }
    });

    const parsed = JSON.parse(result.text || "{}");
    const cleanText = (text: string) => {
        if (!text) return "";
        return text.replace(/^```markdown\n?/, '').replace(/```$/, '').trim();
    };

    return {
        text: cleanText(parsed.refinedText || ""),
        report: parsed.complianceReport || {
            mythicResonance: { status: 'Fail', reasoning: 'No report generated' },
            characterVoice: { status: 'Fail', reasoning: 'No report generated' },
            loreConsistency: { status: 'Fail', reasoning: 'No report generated' },
            thematicNote: 'No report generated'
        }
    };
  } catch (error: any) {
    console.error("Error refining draft:", error);
    return { text: `Error: ${error.message}`, report: "" };
  }
};

export const getAuthorVoiceCheck = async (originalDraft: string, polishedText: string): Promise<VoiceCheckResponse | string> => {
  try {
    const result = await callAiApi({
      model: 'gemini-3-flash-preview',
      prompt: `Original Draft:\n\n${originalDraft}\n\n---\n\nPolished Text:\n\n${polishedText}`,
      systemInstruction: AUTHOR_VOICE_CHECK_PROMPT,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          consistencyScore: { type: Type.NUMBER },
          analysis: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
          verdict: { type: Type.STRING }
        },
        required: ['consistencyScore', 'analysis', 'strengths', 'concerns', 'verdict']
      }
    });
    return JSON.parse(result.text || "{}") as VoiceCheckResponse;
  } catch (error: any) {
    console.error("Error checking author voice:", error);
    return `Error: ${error.message}`;
  }
};

export const getComparison = async (originalDraft: string, polishedText: string): Promise<ComparisonResponse | string> => {
    try {
      const result = await callAiApi({
        model: 'gemini-3-flash-preview',
        prompt: `Original Draft:\n\n${originalDraft}\n\n---\n\nPolished Text:\n\n${polishedText}`,
        systemInstruction: COMPARE_CHANGES_PROMPT,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            changes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  location: { type: Type.STRING },
                  original: { type: Type.STRING },
                  polished: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ['location', 'original', 'polished', 'reasoning']
              }
            },
            summary: { type: Type.STRING },
            metrics: {
              type: Type.OBJECT,
              properties: {
                wordCountChange: { type: Type.NUMBER },
                readabilityShift: { type: Type.STRING },
                toneShift: { type: Type.STRING }
              },
              required: ['wordCountChange', 'readabilityShift', 'toneShift']
            }
          },
          required: ['changes', 'summary', 'metrics']
        }
      });
      return JSON.parse(result.text || "{}") as ComparisonResponse;
    } catch (error: any) {
      console.error("Error comparing changes:", error);
      return `Error: ${error.message}`;
    }
  };

export const getPhrasingSuggestions = async (text: string, instruction: string): Promise<string[]> => {
    try {
        const result = await callAiApi({
            model: 'gemini-3-flash-preview',
            prompt: `Instruction: "${instruction}"\n\nText to improve:\n\n"${text}"`,
            systemInstruction: SUGGEST_PHRASING_PROMPT,
            temperature: 0.8,
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                    },
                },
                required: ['suggestions'],
            }
        });
        const parsed = JSON.parse(result.text || "{}");
        return parsed.suggestions || [];
    } catch (error: any) {
        console.error("Error getting phrasing suggestions:", error);
        return [`Error: ${error.message}`];
    }
};

export interface CharacterCreatorData {
    name: string;
    gender: Gender;
    coreConcept: string;
    backstoryNotes: string;
    motivationNotes: string;
    relationshipNotes: string;
    voiceNotes: string;
}

export const generateCharacterProfile = async (data: CharacterCreatorData): Promise<Omit<CharacterProfile, 'id'>> => {
    try {
        const result = await callAiApi({
            model: 'gemini-3.1-pro-preview', 
            prompt: JSON.stringify(data),
            systemInstruction: CHARACTER_PROFILE_GENERATOR_PROMPT,
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    voice: { type: Type.STRING },
                    gender: { type: Type.STRING },
                    backstory: { type: Type.STRING },
                    motivations: { type: Type.STRING },
                    relationships: { type: Type.STRING },
                },
                required: ['name', 'voice', 'gender', 'backstory', 'motivations', 'relationships'],
            }
        });
        return JSON.parse(result.text || "{}") as Omit<CharacterProfile, 'id'>;
    } catch (error: any) {
        console.error("Error generating character profile:", error);
        throw new Error(`Failed to generate character profile: ${error.message}`);
    }
};
