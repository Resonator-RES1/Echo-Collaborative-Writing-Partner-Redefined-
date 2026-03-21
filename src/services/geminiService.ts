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
    LORE_EXTRACTION_PROMPT,
    VOICE_EXTRACTION_PROMPT,
    LORE_CHECK_PROMPT,
    VOICE_FIDELITY_PROMPT,
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
    VoiceProfile,
    FeedbackDepth,
    RefinedVersion
} from '../types';

export interface GenerationConfig {
    model: 'gemini-3.1-flash-lite-preview' | 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview';
    temperature: number;
}

const getSystemPrompt = (mode: RefineMode, reviewPerspective: ReviewPerspective) => {
    let basePrompt = ECHO_SYSTEM_PROMPT;
    
    switch (mode) {
        case 'review':
            const specificPerspective = REVIEW_PROMPTS[reviewPerspective] || REVIEW_PROMPTS.reader; 
            return `${basePrompt}\n\n---\n\n## ACTIVE MODE: REVIEW MODE\n${specificPerspective}\n\n${ECHO_REVIEW_PROMPT_BASE}`;
        case 'reaction':
            return `${basePrompt}\n\n---\n\n## ACTIVE MODE: REACTION MODE\n${ECHO_REACTION_PROMPT_BASE}`;
        case 'collaborative':
        default:
            return `${basePrompt}\n\n---\n\n## ACTIVE MODE: REFINE MODE\nProduce a polished version of the text that is fully integrated with Lore + Voice + Focus Areas. Clean, immersive, and publication-ready.`;
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
  feedbackDepth?: FeedbackDepth;
  chapterNumber?: number;
  previousEchoes?: RefinedVersion[];
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
      feedbackDepth = 'balanced',
      chapterNumber,
      previousEchoes = [],
    } = options;

    const systemInstruction = getSystemPrompt(mode, reviewPerspective);
    
    let preamble = '';

    preamble += `*** INTENSITY MODE: ${feedbackDepth.toUpperCase()} ***\n`;
    if (feedbackDepth === 'casual') {
        preamble += 'Apply light polish and minimal intervention. Preserve the draft as much as possible while fixing glaring issues.\n\n';
    } else if (feedbackDepth === 'in-depth') {
        preamble += 'Apply deep, high-effort refinement with structural improvements. Do not be afraid to rephrase significantly if it improves the narrative.\n\n';
    } else {
        preamble += 'Apply moderate refinement. This is the default balanced mode.\n\n';
    }

    if (loreEntries.length > 0) {
        preamble += '*** LORE CONTEXT ***\nUse the following lore entries for consistency and world-building:\n' +
            loreEntries.map(l => `- [${l.category}] ${l.title}: ${l.content}`).join('\n') + '\n\n';
    }

    const masterVoice = voiceProfiles.find(v => v.isMasterVoice);
    if (masterVoice) {
        preamble += `*** MASTER VOICE (GLOBAL NARRATIVE STYLE) ***\nEnsure all non-dialogue prose adheres to this overarching narrative style:\n- ${masterVoice.name} (${masterVoice.archetype}): ${masterVoice.soulPattern}\n\n`;
    }

    if (characterProfiles.length > 0) {
        preamble += '*** ACTIVE CHARACTER VOICES ***\nAdhere to the following character voice profiles for dialogue and character-specific actions:\n' +
            characterProfiles.filter(p => p.name.trim() && p.voice.trim()).map(p => {
                const genderInfo = p.gender && p.gender !== 'unspecified' ? ` (${p.gender})` : '';
                return `- ${p.name}${genderInfo}: ${p.voice}`;
            }).join('\n') + '\n\n';
    }

    if (voiceProfiles.length > 0 && mode === 'review') {
        preamble += '*** VOICE LIBRARY REFERENCE ***\nReference these established voice patterns for consistency:\n' +
            voiceProfiles.map(v => `- ${v.name} (${v.archetype}): ${v.soulPattern}`).join('\n') + '\n\n';
    }

    if (previousEchoes.length > 0) {
        preamble += '*** SLIDING WINDOW CONTEXT (PREVIOUS ECHOES) ***\nUse the following recent story context to maintain narrative continuity, pacing, and plot flow. Do NOT rewrite this context, just use it to inform the current draft:\n' +
            previousEchoes.slice(0, 2).map((e, i) => `[Previous Context ${i + 1}]:\n${e.text.substring(0, 500)}...`).join('\n\n') + '\n\n';
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
1. "refinedText": The detailed review and critique in clean Markdown, following the requested structure (Overall Impression, Strengths, Weaknesses, Actionable Advice). Do NOT wrap this text in markdown code blocks. Return ONLY the content itself.
2. "complianceReport": A structured object containing the following fields:
   - metrics: { "loreConsistency": number (0-100), "voiceAuthenticity": number (0-100), "mythicResonance": number (0-100), "structuralCompliance": number (0-100) }
   - audit: { "lore": ["array of strings: specific observations on lore alignment"], "voice": ["array of strings: specific observations on voice fidelity"], "structure": ["array of strings: specific observations on narrative weight and pacing"], "thematic": ["array of strings: specific observations on thematic resonance"] }
   - thematicNote: "string" (A one-sentence summary of the core theme or emotional beat)
`;
    } else if (mode === 'reaction') {
        outputInstruction = `
\n*** OUTPUT INSTRUCTIONS ***
You must return a JSON object containing two fields:
1. "refinedText": Your casual reaction and feedback in clean Markdown, following the requested structure (Initial Reaction, Standout Moments, Confusing/Slow Parts, Expectations). Do NOT wrap this text in markdown code blocks. Return ONLY the content itself.
2. "complianceReport": A structured object containing the following fields:
   - metrics: { "loreConsistency": number (0-100), "voiceAuthenticity": number (0-100), "mythicResonance": number (0-100), "structuralCompliance": number (0-100) }
   - audit: { "lore": ["array of strings: specific observations on lore alignment"], "voice": ["array of strings: specific observations on voice fidelity"], "structure": ["array of strings: specific observations on narrative weight and pacing"], "thematic": ["array of strings: specific observations on thematic resonance"] }
   - thematicNote: "string" (A one-sentence summary of your biggest takeaway)
`;
    } else {
        outputInstruction = `
\n*** OUTPUT INSTRUCTIONS ***
You must return a JSON object containing two fields:
1. "refinedText": The polished text in clean Markdown. Do NOT wrap this text in markdown code blocks (e.g., do not start with \`\`\`markdown). Return ONLY the content itself.
2. "complianceReport": A structured object containing the following fields:
   - metrics: { "loreConsistency": number (0-100), "voiceAuthenticity": number (0-100), "mythicResonance": number (0-100), "structuralCompliance": number (0-100) }
   - audit: { "lore": ["array of strings: specific observations on lore alignment"], "voice": ["array of strings: specific observations on voice fidelity"], "structure": ["array of strings: specific observations on narrative weight and pacing"], "thematic": ["array of strings: specific observations on thematic resonance"] }
   - thematicNote: "string" (A one-sentence summary of the refined narrative intent)
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
                        metrics: {
                            type: Type.OBJECT,
                            properties: {
                                loreConsistency: { type: Type.NUMBER },
                                voiceAuthenticity: { type: Type.NUMBER },
                                mythicResonance: { type: Type.NUMBER },
                                structuralCompliance: { type: Type.NUMBER }
                            },
                            required: ["loreConsistency", "voiceAuthenticity", "mythicResonance", "structuralCompliance"]
                        },
                        audit: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    message: { type: Type.STRING },
                                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                                },
                                required: ["type", "message", "severity"]
                            }
                        },
                        thematicNote: { type: Type.STRING },
                        narrativeSummary: { type: Type.STRING },
                        trendIndicator: { type: Type.STRING },
                        paragraphHeatmap: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    fidelityScore: { type: Type.NUMBER },
                                    rationale: { type: Type.STRING },
                                    voiceRecoverySuggestion: { type: Type.STRING },
                                    hoverDetails: {
                                        type: Type.OBJECT,
                                        properties: {
                                            sentenceLength: { type: Type.STRING },
                                            toneShift: { type: Type.STRING },
                                            vocabularyChanges: { type: Type.ARRAY, items: { type: Type.STRING } }
                                        },
                                        required: ["sentenceLength", "toneShift", "vocabularyChanges"]
                                    }
                                },
                                required: ["id", "fidelityScore", "rationale", "voiceRecoverySuggestion", "hoverDetails"]
                            }
                        },
                        sceneTimeline: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    timeframe: { type: Type.STRING },
                                    loreConsistencyScore: { type: Type.NUMBER },
                                    conflictDetectionRationale: { type: Type.STRING },
                                    loreReinforcementSuggestion: { type: Type.STRING },
                                    tensionScore: { type: Type.NUMBER },
                                    pacingScore: { type: Type.NUMBER }
                                },
                                required: ["id", "location", "timeframe", "loreConsistencyScore", "conflictDetectionRationale", "loreReinforcementSuggestion", "tensionScore", "pacingScore"]
                            }
                        },
                        tensionGraph: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    scene: { type: Type.NUMBER },
                                    tension: { type: Type.NUMBER },
                                    pacing: { type: Type.NUMBER }
                                },
                                required: ["scene", "tension", "pacing"]
                            }
                        },
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    actionable: { type: Type.STRING },
                                    suggestedFix: { type: Type.STRING }
                                },
                                required: ["type", "title", "description", "actionable"]
                            }
                        }
                    },
                    required: ["metrics", "audit"]
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
                metrics: {
                    loreConsistency: 0,
                    voiceAuthenticity: 0,
                    mythicResonance: 0,
                    structuralCompliance: 0
                },
                audit: [
                    { type: 'voice', message: "No report generated", severity: 'low' },
                    { type: 'lore', message: "No report generated", severity: 'low' },
                    { type: 'structure', message: "No report generated", severity: 'low' }
                ],
                thematicNote: 'No report generated'
            }
        };
    } catch (error: any) {
        console.error("Error refining draft:", error);
        return { 
            text: `Error: ${error.message}`, 
            report: {
                metrics: {
                    loreConsistency: 0,
                    voiceAuthenticity: 0,
                    mythicResonance: 0,
                    structuralCompliance: 0
                },
                audit: [
                    { type: 'voice', message: "Error: " + error.message, severity: 'high' },
                    { type: 'lore', message: "Error: " + error.message, severity: 'high' },
                    { type: 'structure', message: "Error: " + error.message, severity: 'high' }
                ],
                thematicNote: 'Error during refinement'
            }
        };
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

export const checkLoreConflicts = async (draft: string, loreEntries: LoreEntry[]): Promise<string[]> => {
  if (!draft.trim() || loreEntries.length === 0) return [];

  const prompt = `
    Analyze the following text snippet for any contradictions with the established Lore.
    
    Lore Entries:
    ${loreEntries.map(l => `- [${l.category}] ${l.title}: ${l.content}`).join('\n')}
    
    Text Snippet:
    "${draft.substring(Math.max(0, draft.length - 2000))}" // Analyze the last 2000 characters
    
    Return ONLY a JSON object with a single field "conflicts" containing an array of strings.
    Each string should briefly describe a specific contradiction found. If no contradictions are found, return an empty array.
  `;

    try {
        const result = await callAiApi({
            model: 'gemini-3.1-flash-lite-preview',
            prompt,
            systemInstruction: LORE_CHECK_PROMPT,
            responseSchema: {
        type: Type.OBJECT,
        properties: {
          conflicts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['conflicts']
      }
    });

    const data = JSON.parse(result.text || '{}');
    return data.conflicts || [];
  } catch (error) {
    console.error("Error checking lore conflicts:", error);
    return [];
  }
};

export const getVoiceFidelity = async (draft: string, voiceProfiles: VoiceProfile[]): Promise<number> => {
  if (!draft.trim() || voiceProfiles.length === 0) return 100;

  const masterVoice = voiceProfiles.find(v => v.isMasterVoice);
  if (!masterVoice) return 100;

  const prompt = `
    Analyze the following text snippet and determine how closely it aligns with the Master Voice Profile.
    
    Master Voice Profile:
    - Name: ${masterVoice.name}
    - Archetype: ${masterVoice.archetype}
    - Soul Pattern: ${masterVoice.soulPattern}
    - Speech Patterns: ${masterVoice.speechPatterns}
    
    Text Snippet:
    "${draft.substring(Math.max(0, draft.length - 1000))}" // Analyze the last 1000 characters
    
    Return ONLY a JSON object with a single field "fidelityScore" containing an integer from 0 to 100.
    100 means perfect alignment, 0 means complete deviation.
  `;

    try {
        const result = await callAiApi({
            model: 'gemini-3.1-flash-lite-preview',
            prompt,
            systemInstruction: VOICE_FIDELITY_PROMPT,
            responseSchema: {
        type: Type.OBJECT,
        properties: {
          fidelityScore: { type: Type.INTEGER }
        },
        required: ['fidelityScore']
      }
    });

    const data = JSON.parse(result.text || '{}');
    return data.fidelityScore ?? 100;
  } catch (error) {
    console.error("Error calculating voice fidelity:", error);
    return 100;
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
                  rationale: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ['location', 'original', 'polished', 'rationale', 'type']
              }
            },
            summary: { type: Type.STRING },
            keyHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            metrics: {
              type: Type.OBJECT,
              properties: {
                wordCountChange: { type: Type.NUMBER },
                readabilityShift: { type: Type.STRING },
                toneShift: { type: Type.STRING },
                loreAlignment: { type: Type.STRING },
                voiceLock: { type: Type.STRING }
              },
              required: ['wordCountChange', 'readabilityShift', 'toneShift', 'loreAlignment', 'voiceLock']
            },
            compliance: {
              type: Type.OBJECT,
              properties: {
                metrics: {
                  type: Type.OBJECT,
                  properties: {
                    loreConsistency: { type: Type.NUMBER },
                    voiceAuthenticity: { type: Type.NUMBER },
                    mythicResonance: { type: Type.NUMBER },
                    structuralCompliance: { type: Type.NUMBER }
                  },
                  required: ["loreConsistency", "voiceAuthenticity", "mythicResonance", "structuralCompliance"]
                },
                audit: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      message: { type: Type.STRING },
                      severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                    },
                    required: ["type", "message", "severity"]
                  }
                },
                thematicNote: { type: Type.STRING },
                narrativeSummary: { type: Type.STRING },
                trendIndicator: { type: Type.STRING },
                paragraphHeatmap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      fidelityScore: { type: Type.NUMBER },
                      rationale: { type: Type.STRING },
                      voiceRecoverySuggestion: { type: Type.STRING },
                      hoverDetails: {
                        type: Type.OBJECT,
                        properties: {
                          sentenceLength: { type: Type.STRING },
                          toneShift: { type: Type.STRING },
                          vocabularyChanges: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["sentenceLength", "toneShift", "vocabularyChanges"]
                      }
                    },
                    required: ["id", "fidelityScore", "rationale", "voiceRecoverySuggestion", "hoverDetails"]
                  }
                },
                sceneTimeline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      location: { type: Type.STRING },
                      timeframe: { type: Type.STRING },
                      loreConsistencyScore: { type: Type.NUMBER },
                      conflictDetectionRationale: { type: Type.STRING },
                      loreReinforcementSuggestion: { type: Type.STRING },
                      tensionScore: { type: Type.NUMBER },
                      pacingScore: { type: Type.NUMBER }
                    },
                    required: ["id", "location", "timeframe", "loreConsistencyScore", "conflictDetectionRationale", "loreReinforcementSuggestion", "tensionScore", "pacingScore"]
                  }
                },
                tensionGraph: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      scene: { type: Type.NUMBER },
                      tension: { type: Type.NUMBER },
                      pacing: { type: Type.NUMBER }
                    },
                    required: ["scene", "tension", "pacing"]
                  }
                },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      actionable: { type: Type.STRING },
                      suggestedFix: { type: Type.STRING }
                    },
                    required: ["type", "title", "description", "actionable"]
                  }
                }
              },
              required: ["metrics", "audit"]
            }
          },
          required: ['changes', 'summary', 'metrics', 'compliance']
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

export const generateCharacterProfile = async (data: CharacterCreatorData): Promise<Omit<VoiceProfile, 'id' | 'lastModified' | 'isActive'>> => {
    try {
        const result = await callAiApi({
            model: 'gemini-3.1-pro-preview', 
            prompt: JSON.stringify(data),
            systemInstruction: CHARACTER_PROFILE_GENERATOR_PROMPT,
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    gender: { type: Type.STRING },
                    archetype: { type: Type.STRING },
                    soulPattern: { type: Type.STRING },
                    cognitivePatterns: { type: Type.STRING },
                    speechPatterns: { type: Type.STRING },
                    emotionalExpression: { type: Type.STRING },
                    behavioralAnchors: { type: Type.STRING },
                    conversationalRole: { type: Type.STRING },
                    signatureTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
                    idioms: { type: Type.ARRAY, items: { type: Type.STRING } },
                    exampleLines: { type: Type.ARRAY, items: { type: Type.STRING } },
                    physicalTells: { type: Type.STRING },
                    internalMonologueStyle: { type: Type.STRING },
                    conflictStyle: { type: Type.STRING },
                },
                required: ['name', 'gender', 'archetype', 'soulPattern', 'cognitivePatterns', 'speechPatterns', 'emotionalExpression', 'behavioralAnchors', 'conversationalRole', 'signatureTraits', 'idioms', 'exampleLines', 'physicalTells', 'internalMonologueStyle', 'conflictStyle'],
            }
        });
        return JSON.parse(result.text || "{}") as Omit<VoiceProfile, 'id' | 'lastModified' | 'isActive'>;
    } catch (error: any) {
        console.error("Error generating character profile:", error);
        throw new Error(`Failed to generate character profile: ${error.message}`);
    }
};

export const generateLoreEntriesFromText = async (text: string): Promise<Omit<LoreEntry, 'id' | 'lastModified'>[]> => {
    try {
        const result = await callAiApi({
            model: 'gemini-3.1-flash-lite-preview',
            prompt: text,
            systemInstruction: LORE_EXTRACTION_PROMPT,
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        category: { type: Type.STRING },
                        content: { type: Type.STRING },
                    },
                    required: ['title', 'category', 'content'],
                }
            }
        });
        return JSON.parse(result.text || "[]");
    } catch (error: any) {
        console.error("Error extracting lore entries:", error);
        throw new Error(`Failed to extract lore entries: ${error.message}`);
    }
};

export const generateVoiceProfilesFromText = async (text: string): Promise<Omit<VoiceProfile, 'id' | 'lastModified' | 'isActive'>[]> => {
    try {
        const result = await callAiApi({
            model: 'gemini-3.1-flash-lite-preview',
            prompt: text,
            systemInstruction: VOICE_EXTRACTION_PROMPT,
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        archetype: { type: Type.STRING },
                        patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
                        idioms: { type: Type.ARRAY, items: { type: Type.STRING } },
                        soulPattern: { type: Type.STRING },
                    },
                    required: ['name', 'archetype', 'patterns', 'idioms', 'soulPattern'],
                }
            }
        });
        return JSON.parse(result.text || "[]");
    } catch (error: any) {
        console.error("Error extracting voice profiles:", error);
        throw new Error(`Failed to extract voice profiles: ${error.message}`);
    }
};
