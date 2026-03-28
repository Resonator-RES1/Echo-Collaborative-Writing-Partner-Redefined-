import { Type } from "@google/genai";
import { FOCUS_AREA_PROMPTS } from '../../constants';
import { FocusArea, LoreEntry, VoiceProfile, RefinedVersion, AuthorVoice, FeedbackDepth, VoiceAudit } from '../../types';
import { ContinuityIssue } from '../../utils/contextScanner';
import { callAiApi, GenerationConfig } from './api';
import { getSystemPrompt } from './prompts';

export interface RefineDraftOptions {
  draft: string;
  fullContextDraft?: string;
  selection?: { start: number; end: number; text: string };
  generationConfig: GenerationConfig;
  focusAreas: FocusArea[];
  loreEntries?: LoreEntry[];
  voiceProfiles?: VoiceProfile[];
  authorVoices?: AuthorVoice[];
  customInstruction?: string;
  chapterNumber?: number;
  storyDay?: number;
  previousEchoes?: RefinedVersion[];
  feedbackDepth?: FeedbackDepth;
  localWarnings?: ContinuityIssue[];
  isSurgical?: boolean;
}

export interface RefineDraftResult {
  text: string;
  title: string;
  summary: string;
  analysis?: string;
  justification?: string;
  evidenceBasedClaims?: string;
  whyBehindChange?: string;
  loreLineage?: string;
  mirrorEditorCritique?: string;
  conflicts?: { sentence: string; reason: string }[];
  metrics?: {
    sensory_vividness: { score: number; note: string; qualifier: 'By Design' | 'Opportunity' };
    pacing_rhythm: { score: number; note: string; qualifier: 'By Design' | 'Opportunity' };
    dialogue_authenticity: { score: number; note: string; qualifier: 'By Design' | 'Opportunity' };
    voice_consistency: { score: number; note: string; qualifier: 'By Design' };
  };
  expressionProfile?: { vibe: string; score: number; qualifier: 'By Design' | 'Opportunity'; note: string }[];
  loreCorrections: { original: string; refined: string; reason: string; snippet: string }[];
  loreFraying?: { snippet: string; conflict: string; suggestion: string }[];
  voiceAudits?: VoiceAudit[];
  audit?: {
    voiceFidelityScore: number;
    voiceFidelityReasoning: string;
    loreCompliance: number;
    loreComplianceReasoning: string;
    voiceAdherence: number;
    voiceAdherenceReasoning: string;
    focusAreaAlignment: number;
    focusAreaAlignmentReasoning: string;
  };
  restraintLog?: { category: string; target: string; justification: string; snippet: string }[];
  activeContext: {
    authorVoice?: string;
    characterVoices: string[];
    loreProfiles: string[];
    focusAreas: string[];
  };
  isSurgical: boolean;
}

export const refineDraft = async (options: RefineDraftOptions): Promise<RefineDraftResult> => {
  try {
    const {
      draft,
      fullContextDraft,
      selection,
      generationConfig,
      focusAreas,
      loreEntries = [],
      voiceProfiles = [],
      authorVoices = [],
      chapterNumber,
      storyDay,
      previousEchoes = [],
      feedbackDepth = 'balanced',
      localWarnings = []
    } = options;

    // --- PAYLOAD AUDITOR ---
    const auditorActiveLore = loreEntries.filter(e => e.isActive);
    const auditorActiveVoices = voiceProfiles.filter(v => v.isActive);

    const loreContextSize = auditorActiveLore.reduce((acc, l) => acc + l.content.length + (l.sensoryPalette?.length || 0), 0);
    const voiceContextSize = auditorActiveVoices.reduce((acc, v) => acc + (v.soulPattern.length) + (v.speechPatterns.length) + (v.cognitivePatterns.length), 0);
    const totalContextSize = loreContextSize + voiceContextSize;

    if (totalContextSize > 15000) {
        throw new Error(`Cognitive Overload: Active Context exceeds safe limit (${Math.round(totalContextSize/1000)}k / 15k chars). Deactivate non-essential Lore to protect Refinement Fidelity.`);
    }
    // --- END PAYLOAD AUDITOR ---

    const systemInstruction = getSystemPrompt();
    
    let preamble = '';

    const activeLore = loreEntries.filter(e => e.isActive);
    if (activeLore.length > 0) {
        const systemicRules = activeLore.filter(l => 
          ['World Mechanics', 'Geography & Ecology', 'Societal Strata'].includes(l.category)
        );
        const timelineEntries = activeLore.filter(l => l.category === 'Timeline');
        const worldContext = activeLore.filter(l => 
          !['World Mechanics', 'Geography & Ecology', 'Societal Strata', 'Timeline'].includes(l.category)
        );

        if (storyDay !== undefined) {
            preamble += `*** CHRONOLOGICAL ANCHOR ***\n`;
            preamble += `Current Story Day: ${storyDay}.\n`;
            
            const pastEvents = timelineEntries.filter(e => e.storyDay !== undefined && e.storyDay < storyDay);
            if (pastEvents.length > 0) {
                preamble += `Active Timeline Context: [${pastEvents.map(e => e.title).join(', ')}]\n`;
                preamble += `Past Events Details:\n`;
                preamble += pastEvents.sort((a, b) => (a.storyDay || 0) - (b.storyDay || 0))
                    .map(e => `- [Day ${e.storyDay}] ${e.title}: ${e.content}`).join('\n') + '\n';
            }
            preamble += `CHRONOLOGICAL GUARD: If the draft contradicts the established timeline (e.g., a dead character appearing or a wound being forgotten), flag this as Lore Fraying (Amber).\n\n`;
        }

        preamble += '*** ACTIVE LORE (PRIMARY TRUTH) ***\n';
        
        if (systemicRules.length > 0) {
            preamble += '--- SYSTEMIC RULES (HARD CONSTRAINTS) ---\n';
            preamble += systemicRules.map(l => `- [${l.category}] ${l.title}: ${l.content} ${l.sensoryPalette ? `(Sensory: ${l.sensoryPalette})` : ''}`).join('\n') + '\n';
        }
        
        if (worldContext.length > 0) {
            preamble += '--- WORLD CONTEXT (NARRATIVE GUIDES) ---\n';
            preamble += worldContext.map(l => {
                let entryText = `- [${l.category}] ${l.title} ${l.aliases?.length ? `(Aliases: ${l.aliases.join(', ')})` : ''}: ${l.content}`;
                
                if (l.sensoryPalette) {
                    entryText += `\n  * Sensory Palette: ${l.sensoryPalette}`;
                }
                
                // Resolve relationships for characters
                if (l.category === 'Characters' && l.relationships && l.relationships.length > 0) {
                    const rels = l.relationships.map(r => {
                        const target = loreEntries.find(le => le.id === r.targetId);
                        return target ? `  * Relationship with ${target.title}: ${r.type} (Tension: ${r.tension}/5) - ${r.context}` : null;
                    }).filter(Boolean);
                    
                    if (rels.length > 0) {
                        entryText += '\n' + rels.join('\n');
                    }
                }
                
                return entryText;
            }).join('\n') + '\n';
        }
        preamble += '\n';
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
        preamble += '*** CHARACTER VOICE ENGINE (STYLISTIC LOGIC) ***\n';
        preamble += `Character Identity (Name/Gender) is already established in the draft. Use the provided Engine Profiles strictly for stylistic, rhythmic, and systemic logic refinement.\n`;
        preamble += `CRITICAL: If a character is NOT found in the specific text snippet being refined, ignore their voice profile.\n`;
        preamble += activeVoices.map(v => {
            const engine = [
                `- ${v.name} (Gender: ${v.gender}, Archetype: ${v.archetype}) ${v.aliases?.length ? `[Aliases: ${v.aliases.join(', ')}]` : ''}:`,
                `  Core Motivation: ${v.coreMotivation || 'Unknown'}`,
                `  Soul Pattern: ${v.soulPattern}`,
                `  Cognitive Patterns (How they think): ${v.cognitivePatterns || 'N/A'}`,
                `  Internal Monologue: ${v.internalMonologueStyle || 'N/A'}`,
                `  Speech Patterns: ${v.speechPatterns}`,
                `  Conversational Role: ${v.conversationalRole || 'N/A'}`,
                `  Emotional Expression: ${v.emotionalExpression || 'N/A'}`,
                `  Conflict Style: ${v.conflictStyle || 'N/A'}`,
                `  Physical Tells & Behaviors: ${v.physicalTells ? v.physicalTells + ' | ' : ''}${v.behavioralAnchors || ''}`,
                `  Signature Traits: ${v.signatureTraits?.length ? v.signatureTraits.join(', ') : 'N/A'}`,
                `  Idioms: ${v.idioms?.length ? v.idioms.join(', ') : 'N/A'}`,
                `  Example Lines: ${v.exampleLines?.length ? v.exampleLines.join(' | ') : 'N/A'}`
            ].filter(line => !line.endsWith('N/A') && !line.trim().endsWith(': |')).join('\n');
            return engine;
        }).join('\n\n') + '\n\n';
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

    if (options.customInstruction) {
        preamble += `*** SPECIAL INSTRUCTION (USER OVERRIDE) ***\n${options.customInstruction}\n\n`;
    }

    if (localWarnings.length > 0) {
        preamble += `*** LOCAL CONTINUITY WARNINGS (SCANNER ALERTS) ***\n`;
        preamble += `The local scanner has identified the following potential issues in the current draft. You MUST address these in your refinement or justify why they are being ignored in your summary.\n`;
        preamble += localWarnings.map(w => `- [${w.type.toUpperCase()}] ${w.message}`).join('\n') + '\n\n';
    }

    const weighting = feedbackDepth === 'casual' ? '95% Voice / 5% Focus' : feedbackDepth === 'balanced' ? '80% Voice / 20% Focus' : '70% Voice / 30% Focus';
    preamble += `\n*** DIALING SYSTEM ***\nWeighting: ${weighting}\n\n`;

    const isSurgical = options.isSurgical || !!(fullContextDraft && selection);
    
    const outputInstruction = isSurgical ? `
\n### RESPONSE SCHEMA (JSON) - SURGICAL MODE (LITE)
Return the following structure:
{
  "refined_text": "The polished version of the text. Return ONLY the refined snippet, PRESERVING all original paragraph breaks, spacing, and structural formatting.",
  "editor_summary": "Concise explanation of refinements (1 sentence max)",
  "justification": "Brief stylistic reasoning.",
  "lore_corrections": [
    { "original": "Original term/fact", "refined": "Corrected term/fact", "reason": "Lore reference", "snippet": "VERBATIM fixed snippet" }
  ]
}
` : `
\n### RESPONSE SCHEMA (JSON)
Return the following structure:
{
  "refined_text": "The polished version of the text. If surgical, return ONLY the refined snippet, PRESERVING all original paragraph breaks, spacing, and structural formatting.",
  "editor_summary": "Concise explanation of refinements + acknowledgment of restraint (2-3 sentences max)",
  "justification": "Detailed surgical post-op of the refinement.",
  "evidence_based_claims": "Specific, measurable changes made to the text.",
  "why_behind_change": "The trade-offs and stylistic reasoning.",
  "lore_lineage": "List of specific facts verified against the Lore.",
  "mirror_editor_critique": "Neutral, observational interpretation of what the text is doing.",
  "expression_profile_vibe": [
    { "vibe": "Atmospheric", "score": 1-10, "qualifier": "By Design | Opportunity", "note": "string" }
  ],
  "expression_profile": {
    "sensory_vividness": { "score": 1-10, "note": "string", "qualifier": "By Design | Opportunity" },
    "pacing_rhythm": { "score": 1-10, "note": "string", "qualifier": "By Design | Opportunity" },
    "dialogue_authenticity": { "score": 1-10, "note": "string", "qualifier": "By Design | Opportunity" },
    "voice_consistency": { "score": 1-10, "note": "string", "qualifier": "By Design | Opportunity" }
  },
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
    { "category": "string", "target": "string", "justification": "string", "snippet": "The EXACT snippet of text from the refined_text that was preserved/protected from change." }
  ],
  "conflicts": [
    { "sentence": "Original sentence with conflict", "reason": "Why it conflicts with lore" }
  ],
  "lore_corrections": [
    { "original": "Original term/fact", "refined": "Corrected term/fact", "reason": "Lore reference", "snippet": "The EXACT snippet of text as it appears in the refined_text after correction. CRITICAL: The snippet field in the lore_corrections array MUST be the EXACT verbatim string as it appears in your refined_text output (the fixed version). If the snippet does not match your refined text exactly (including spaces and punctuation), the UI will fail to highlight the correction." }
  ],
  "lore_fraying": [
    { "snippet": "The EXACT verbatim snippet from refined_text that contains a soft lore conflict.", "conflict": "Description of the soft constraint violation (Culture, Character Memory, Social Norms).", "suggestion": "How the author might resolve this if they choose." }
  ],
  "voice_audits": [
    { "characterName": "string", "resonanceScore": 0-100, "dissonanceReason": "string" }
  ]
}
*** LORE CONSTRAINTS DEFINITIONS ***
- lore_corrections (Red): Hard Constraints (Physics, Magic Laws, Geography). You MUST fix these in the refined_text.
- lore_fraying (Amber): Soft Constraints (Culture, Character Memory, Social Norms). You should NOT change the refined_text but MUST flag the "Fraying" for the author to review.

*** VOICE RESONANCE RADAR ***
For every character identified in the scene whose Voice Profile is active, you MUST calculate a Resonance Score (0-100).
- High Score (80-100): Dialogue perfectly matches their established idiom and syntax.
- Low Score (<60): Flag 'Voice Dissonance'—identify specific lines where the character sounds 'out of character' and provide the reason in the dissonanceReason field.
`;
    
    preamble += outputInstruction;
    
    let userPrompt = '';
    if (fullContextDraft && selection) {
        preamble += `\n*** SURGICAL REFINEMENT MODE ***\n`;
        preamble += `You are performing a targeted refinement. The user has selected a specific portion of the text to be refined.\n`;
        preamble += `CRITICAL INSTRUCTION: You MUST ONLY refine the text provided in the <TARGET_SELECTION> block. The <FULL_DRAFT_CONTEXT> block is provided STRICTLY for context (so you understand the surrounding narrative, pacing, and flow). DO NOT rewrite or include the unselected text in your \`refined_text\` output. DO NOT add a title or header if it was not in the selection. PRESERVE all original paragraph breaks, indentation, and structural spacing from the original selection.\n\n`;
        
        userPrompt = `${preamble}\n\n---\n\n<FULL_DRAFT_CONTEXT>\n${fullContextDraft}\n</FULL_DRAFT_CONTEXT>\n\n<TARGET_SELECTION>\n${selection.text}\n</TARGET_SELECTION>`;
    } else {
        preamble += `\n*** FULL CHAPTER REFINEMENT MODE ***\n`;
        preamble += `Refine the entire draft provided below. FORMATTING ENFORCEMENT: Never arbitrarily add titles or headers unless they exist in the original draft. Match the author's exact spacing and Markdown structure.\n\n`;
        userPrompt = preamble ? `${preamble}\n\n---\n\n${draft}` : draft;
    }

    const result = await callAiApi({
        model: generationConfig.model,
        prompt: userPrompt,
        systemInstruction,
        temperature: generationConfig.temperature,
        thinkingConfig: generationConfig.thinkingConfig, // Pass the new parameter
        feedbackDepth,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                refined_text: { type: Type.STRING },
                title: { type: Type.STRING },
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
                            justification: { type: Type.STRING },
                            snippet: { type: Type.STRING }
                        },
                        required: ["category", "target", "justification", "snippet"]
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
                            reason: { type: Type.STRING },
                            snippet: { type: Type.STRING }
                        },
                        required: ["original", "refined", "reason", "snippet"]
                    }
                },
                lore_fraying: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            snippet: { type: Type.STRING },
                            conflict: { type: Type.STRING },
                            suggestion: { type: Type.STRING }
                        },
                        required: ["snippet", "conflict", "suggestion"]
                    }
                },
                voice_audits: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            characterName: { type: Type.STRING },
                            resonanceScore: { type: Type.NUMBER },
                            dissonanceReason: { type: Type.STRING }
                        },
                        required: ["characterName", "resonanceScore"]
                    }
                }
            },
            required: isSurgical 
                ? ["refined_text", "title", "editor_summary", "justification"] 
                : [
                    "refined_text", "title", "editor_summary", "expression_profile", "analysis", "audit", 
                    "conflicts", "lore_corrections", "lore_fraying", "justification", "evidence_based_claims",
                    "why_behind_change", "lore_lineage", "mirror_editor_critique", "restraint_log",
                    "expression_profile_vibe", "voice_audits"
                ]
        }
    });

    const rawText = result.text || "{}";
    const cleanedJsonString = rawText.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanedJsonString);
    const cleanText = (text: string) => {
        if (!text) return "";
        return text.replace(/^```markdown\n?/, '').replace(/```$/, '').trim();
    };

    return {
        text: cleanText(parsed.refined_text || ""),
        title: parsed.title || "",
        summary: parsed.editor_summary || parsed.summary || "",
        analysis: parsed.analysis || "",
        justification: parsed.justification || "",
        evidenceBasedClaims: parsed.evidence_based_claims || "",
        whyBehindChange: parsed.why_behind_change || "",
        loreLineage: parsed.lore_lineage || "",
        mirrorEditorCritique: parsed.mirror_editor_critique || "",
        conflicts: parsed.conflicts || [],
        metrics: parsed.expression_profile || (isSurgical ? undefined : {
            sensory_vividness: { score: 5, note: "", qualifier: "Opportunity" },
            pacing_rhythm: { score: 5, note: "", qualifier: "Opportunity" },
            dialogue_authenticity: { score: 5, note: "", qualifier: "Opportunity" },
            voice_consistency: { score: 5, note: "", qualifier: "By Design" }
        }),
        expressionProfile: parsed.expression_profile_vibe || [],
        loreCorrections: parsed.lore_corrections || [],
        loreFraying: parsed.lore_fraying || [],
        voiceAudits: parsed.voice_audits || [],
        audit: parsed.audit,
        restraintLog: parsed.restraint_log || [],
        activeContext: {
            authorVoice: activeAuthorVoice?.name,
            characterVoices: activeVoices.map(v => v.name),
            loreProfiles: activeLore.map(l => l.title),
            focusAreas: focusAreas
        },
        isSurgical
    };
  } catch (error: any) {
      console.error("Error refining draft:", error);
      return { 
          text: `Error: ${error.message}`,
          title: "",
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
          loreFraying: [],
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
          },
          isSurgical: options.isSurgical || !!(options.fullContextDraft && options.selection)
      };
  }
};
