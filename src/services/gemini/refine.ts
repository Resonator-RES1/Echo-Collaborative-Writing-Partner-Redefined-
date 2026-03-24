import { Type } from "@google/genai";
import { FOCUS_AREA_PROMPTS } from '../../constants';
import { FocusArea, LoreEntry, VoiceProfile, RefinedVersion, AuthorVoice, FeedbackDepth } from '../../types';
import { callAiApi, GenerationConfig } from './api';
import { getSystemPrompt } from './prompts';

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
  analysis: string;
  justification?: string;
  evidenceBasedClaims?: string;
  whyBehindChange?: string;
  loreLineage?: string;
  mirrorEditorCritique?: string;
  conflicts: { sentence: string; reason: string }[];
  metrics: {
    sensory_vividness: { score: number; note: string; qualifier: 'By Design' | 'Opportunity' };
    pacing_rhythm: { score: number; note: string; qualifier: 'By Design' | 'Opportunity' };
    dialogue_authenticity: { score: number; note: string; qualifier: 'By Design' | 'Opportunity' };
    voice_consistency: { score: number; note: string; qualifier: 'By Design' };
  };
  expressionProfile: { vibe: string; score: number; qualifier: 'By Design' | 'Opportunity'; note: string }[];
  loreCorrections: { original: string; refined: string; reason: string }[];
  audit: {
    voiceFidelityScore: number;
    voiceFidelityReasoning: string;
    loreCompliance: number;
    loreComplianceReasoning: string;
    voiceAdherence: number;
    voiceAdherenceReasoning: string;
    focusAreaAlignment: number;
    focusAreaAlignmentReasoning: string;
  };
  restraintLog: { category: string; target: string; justification: string }[];
  activeContext: {
    authorVoice?: string;
    characterVoices: string[];
    loreProfiles: string[];
    focusAreas: string[];
  };
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
        const categorizedFocus: Record<string, string[]> = {
            'Atmosphere & Style': [],
            'Narrative & Character': [],
            'Structure & Depth': []
        };
        
        focusAreas.forEach(area => {
            if (['tone', 'rhythm', 'sensory'].includes(area)) categorizedFocus['Atmosphere & Style'].push(FOCUS_AREA_PROMPTS[area]);
            else if (['emotion', 'dialogue', 'voiceIntegrity'].includes(area)) categorizedFocus['Narrative & Character'].push(FOCUS_AREA_PROMPTS[area]);
            else if (['plot', 'mythic', 'structural'].includes(area)) categorizedFocus['Structure & Depth'].push(FOCUS_AREA_PROMPTS[area]);
        });

        let focusInstructions = '';
        Object.entries(categorizedFocus).forEach(([category, prompts]) => {
            if (prompts.length > 0) {
                focusInstructions += `\n[${category}]\n${prompts.join('\n\n')}\n`;
            }
        });

        if (focusInstructions) {
            preamble += `\n*** PRIORITY DIRECTIVES ***\nSimultaneously optimize for the following focus areas, categorized by narrative layer:\n${focusInstructions}\n\n`;
        }
    } else {
        preamble += `\n*** PRIORITY DIRECTIVES ***\nNo specific focus areas selected. Provide a general, balanced polish.\n\n`;
    }

    const weighting = feedbackDepth === 'casual' ? '95% Voice / 5% Focus' : feedbackDepth === 'balanced' ? '80% Voice / 20% Focus' : '70% Voice / 30% Focus';
    preamble += `\n*** DIALING SYSTEM ***\nWeighting: ${weighting}\n\n`;

    const outputInstruction = `
\n### RESPONSE SCHEMA (JSON)
Return the following structure:
{
  "refined_text": "The polished chapter/snippet (MUST start with '# Title' on the first line)",
  "editor_summary": "Concise explanation of refinements + acknowledgment of restraint (2-3 sentences max)",
  "justification": "Detailed surgical post-op of the refinement.",
  "evidence_based_claims": "Specific, measurable changes made to the text.",
  "why_behind_change": "The trade-offs and stylistic reasoning.",
  "lore_lineage": "List of specific facts verified against the Lore.",
  "mirror_editor_critique": "Neutral, observational interpretation of what the text is doing.",
  "expression_profile_vibe": [
    { "vibe": "Atmospheric", "score": 1-10, "qualifier": "By Design | Opportunity", "note": "string" }
  ],
  "analysis": "Specific notes on Lore compliance and why certain voice choices were made.",
  "audit": {
    "voiceFidelityScore": 1-10,
    "voiceFidelityReasoning": "string",
    "loreCompliance": 1-10,
    "loreComplianceReasoning": "string",
    "voiceAdherence": 1-10,
    "voiceAdherenceReasoning": "string",
    "focusAreaAlignment": 1-10,
    "focusAreaAlignmentReasoning": "string"
  },
  "restraint_log": [
    { "category": "string", "target": "string", "justification": "string" }
  ],
  "conflicts": [
    { "sentence": "Original sentence with conflict", "reason": "Why it conflicts with lore" }
  ],
  "lore_corrections": [
    { "original": "Original term/fact", "refined": "Corrected term/fact", "reason": "Lore reference" }
  ]
}
`;
    
    preamble += outputInstruction;
    const userPrompt = preamble ? `${preamble}\n\n---\n\n${draft}` : draft;

    const result = await callAiApi({
        model: generationConfig.model,
        prompt: userPrompt,
        systemInstruction,
        temperature: generationConfig.temperature,
        feedbackDepth,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                refined_text: { type: Type.STRING },
                editor_summary: { type: Type.STRING },
                justification: { type: Type.STRING },
                evidence_based_claims: { type: Type.STRING },
                why_behind_change: { type: Type.STRING },
                lore_lineage: { type: Type.STRING },
                mirror_editor_critique: { type: Type.STRING },
                expression_profile_vibe: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            vibe: { type: Type.STRING },
                            score: { type: Type.NUMBER },
                            qualifier: { type: Type.STRING },
                            note: { type: Type.STRING }
                        },
                        required: ["vibe", "score", "qualifier", "note"]
                    }
                },
                expression_profile: {
                    type: Type.OBJECT,
                    properties: {
                        sensory_vividness: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                note: { type: Type.STRING },
                                qualifier: { type: Type.STRING }
                            },
                            required: ["score", "note", "qualifier"]
                        },
                        pacing_rhythm: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                note: { type: Type.STRING },
                                qualifier: { type: Type.STRING }
                            },
                            required: ["score", "note", "qualifier"]
                        },
                        dialogue_authenticity: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                note: { type: Type.STRING },
                                qualifier: { type: Type.STRING }
                            },
                            required: ["score", "note", "qualifier"]
                        },
                        voice_consistency: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                note: { type: Type.STRING },
                                qualifier: { type: Type.STRING }
                            },
                            required: ["score", "note", "qualifier"]
                        }
                    },
                    required: ["sensory_vividness", "pacing_rhythm", "dialogue_authenticity", "voice_consistency"]
                },
                analysis: { type: Type.STRING },
                audit: {
                    type: Type.OBJECT,
                    properties: {
                        voiceFidelityScore: { type: Type.NUMBER },
                        voiceFidelityReasoning: { type: Type.STRING },
                        loreCompliance: { type: Type.NUMBER },
                        loreComplianceReasoning: { type: Type.STRING },
                        voiceAdherence: { type: Type.NUMBER },
                        voiceAdherenceReasoning: { type: Type.STRING },
                        focusAreaAlignment: { type: Type.NUMBER },
                        focusAreaAlignmentReasoning: { type: Type.STRING }
                    },
                    required: [
                        "voiceFidelityScore", "voiceFidelityReasoning",
                        "loreCompliance", "loreComplianceReasoning", 
                        "voiceAdherence", "voiceAdherenceReasoning",
                        "focusAreaAlignment", "focusAreaAlignmentReasoning"
                    ]
                },
                restraint_log: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING },
                            target: { type: Type.STRING },
                            justification: { type: Type.STRING }
                        },
                        required: ["category", "target", "justification"]
                    }
                },
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
                lore_corrections: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            original: { type: Type.STRING },
                            refined: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        },
                        required: ["original", "refined", "reason"]
                    }
                }
            },
            required: [
                "refined_text", "editor_summary", "expression_profile", "analysis", "audit", 
                "conflicts", "lore_corrections", "justification", "evidence_based_claims",
                "why_behind_change", "lore_lineage", "mirror_editor_critique", "restraint_log",
                "expression_profile_vibe"
            ]
        }
    });

    const parsed = JSON.parse(result.text || "{}");
    const cleanText = (text: string) => {
        if (!text) return "";
        return text.replace(/^```markdown\n?/, '').replace(/```$/, '').trim();
    };

    return {
        text: cleanText(parsed.refined_text || ""),
        summary: parsed.editor_summary || "",
        analysis: parsed.analysis || "",
        justification: parsed.justification || "",
        evidenceBasedClaims: parsed.evidence_based_claims || "",
        whyBehindChange: parsed.why_behind_change || "",
        loreLineage: parsed.lore_lineage || "",
        mirrorEditorCritique: parsed.mirror_editor_critique || "",
        conflicts: parsed.conflicts || [],
        metrics: parsed.expression_profile || {
            sensory_vividness: { score: 5, note: "", qualifier: "Opportunity" },
            pacing_rhythm: { score: 5, note: "", qualifier: "Opportunity" },
            dialogue_authenticity: { score: 5, note: "", qualifier: "Opportunity" },
            voice_consistency: { score: 5, note: "", qualifier: "By Design" }
        },
        expressionProfile: parsed.expression_profile_vibe || [],
        loreCorrections: parsed.lore_corrections || [],
        audit: parsed.audit,
        restraintLog: parsed.restraint_log || [],
        activeContext: {
            authorVoice: activeAuthorVoice?.name,
            characterVoices: activeVoices.map(v => v.name),
            loreProfiles: activeLore.map(l => l.title),
            focusAreas: focusAreas
        }
    };
  } catch (error: any) {
      console.error("Error refining draft:", error);
      return { 
          text: `Error: ${error.message}`,
          summary: "",
          analysis: "",
          conflicts: [],
          metrics: {
              sensory_vividness: { score: 0, note: "Error", qualifier: "Opportunity" },
              pacing_rhythm: { score: 0, note: "Error", qualifier: "Opportunity" },
              dialogue_authenticity: { score: 0, note: "Error", qualifier: "Opportunity" },
              voice_consistency: { score: 0, note: "Error", qualifier: "By Design" }
          },
          expressionProfile: [],
          loreCorrections: [],
          audit: {
              voiceFidelityScore: 0,
              voiceFidelityReasoning: "Error",
              loreCompliance: 0,
              loreComplianceReasoning: "Error",
              voiceAdherence: 0,
              voiceAdherenceReasoning: "Error",
              focusAreaAlignment: 0,
              focusAreaAlignmentReasoning: "Error"
          },
          restraintLog: [],
          activeContext: {
              characterVoices: [],
              loreProfiles: [],
              focusAreas: []
          }
      };
  }
};
