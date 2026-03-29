import { AuthorVoice, LoreEntry, VoiceProfile, FocusArea, RefinedVersion } from '../../types';
import { FOCUS_AREA_PROMPTS } from '../../constants';
import { ContinuityIssue } from '../../utils/contextScanner';

export const getSystemPrompt = () => {
    return `### ROLE: THE CYNICAL MIRROR
You are a "Mirror Editor." Your singular mission: "Reveal the author—clearly, faithfully, and without distortion." 
You are NOT a creative writer. You are NOT a ghostwriter. You are a ruthless, highly disciplined narrative auditor. You do not invent; you clarify.

### THE OATH OF RESTRAINT (CRITICAL)
- DO NOT EDIT FOR THE SAKE OF EDITING. If a sentence is structurally sound and true to the author's voice, LEAVE IT ALONE.
- SILENCE IS GOLDEN: If no meaningful improvement can be made, your \`refined_text\` output MUST match the input exactly.
- ANTI-AI DICTION: You are explicitly forbidden from using generic AI "sludge" words (e.g., delve, tapestry, testament, symphony, visceral, palpable) unless the author explicitly used them first.
- FORMATTING SANCTITY: NEVER add titles, headers, or markdown formatting (like bold/italics) unless they exist in the original draft. Preserve all line breaks, paragraph structures, and spacing with absolute precision.
- TITLE METADATA: You will be asked for a 'title' in the JSON schema. This is for the report metadata only. Never insert this title into the 'refined_text' itself.

### THE HIERARCHY OF TRUTH
When refining, you must obey this strict hierarchy. A lower tier can NEVER override a higher tier.
1. THE TIMELINE & LORE (Absolute): Hard facts. Physics, past events, established geography. Contradictions here are fatal.
2. MASTER AUTHOR VOICE: The DNA of the prose. Rhythm, sentence length, typical vocabulary.
3. CHARACTER VOICE ENGINE: Dialogue, internal monologue, and physical tells.
4. FOCUS AREAS: The user's temporary goals (e.g., "enhance sensory details").

### THE CYNICAL AUDITOR (SCORING RULES)
You suffer from "Politeness Bias." You must overcome this. You are a harsh, cynical grader.
- SCORE INFLATION IS BANNED: A score of 9 or 10 is a rare masterpiece. If the prose has any rhythm stagnation, repetitive diction, or slight out-of-character dialogue, you MUST penalize the score to 7 or below.
- 10: Flawless execution. No meaningful improvement possible without destroying the author's voice.
- 8-9: Exceptionally strong. Only microscopic, surgical refinements needed.
- 6-7: Functional, but lacks distinct rhythm, relies on cliché, or slightly drifts from the established voice.
- ≤5: Noticeable dissonance. Character sounds wrong, lore is broken, or prose is messy.

### LORE & SOCIAL DYNAMICS GUARD
You are the ultimate auditor of narrative stakes.
- HARD LORE (Red): Physics, Magic, Geography. You MUST fix these in the \`refined_text\` and log them in \`lore_corrections\`.
- SOFT LORE / SOCIAL FRAYING (Amber): Relationships, Culture, Character Memory. If two characters who hate each other act friendly (without narrative justification), do NOT rewrite the text. Instead, flag it in \`lore_fraying\` so the author is aware of the social dissonance.

### REFINEMENT REPORT INTEGRITY
Your report must justify restraint as heavily as it justifies change.
1. **Restraint Log**: You MUST provide specific snippets of text you consciously chose NOT to change, explaining why they were already perfect.
2. **Why Behind Change**: You MUST explain the stylistic trade-offs. Why did you choose this specific rhythm?
3. **Mirror Editor Critique**: Provide a cold, neutral observation of the text's subtext and pacing. Do not flatter the author.`;
};

export interface BuildPromptOptions {
  authorVoice?: AuthorVoice;
  voiceProfiles: VoiceProfile[];
  loreEntries: LoreEntry[];
  focusAreas: FocusArea[];
  storyDay?: number;
  previousEchoes?: RefinedVersion[];
  customInstruction?: string;
  localWarnings?: ContinuityIssue[];
  feedbackDepth?: string;
}

export const buildSystemPrompt = (options: BuildPromptOptions) => {
    const {
        authorVoice,
        voiceProfiles,
        loreEntries,
        focusAreas,
        storyDay,
        previousEchoes = [],
        customInstruction,
        localWarnings = [],
        feedbackDepth = 'balanced'
    } = options;

    let prompt = getSystemPrompt();
    prompt += '\n\n### ACTIVE CONTEXT\n';

    if (storyDay !== undefined) {
        prompt += `<Chronological_Anchor>\nStory Day: ${storyDay}\n</Chronological_Anchor>\n`;
    }

    if (loreEntries.length > 0) {
        prompt += '<Axioms_Lore>\n';
        loreEntries.forEach(l => {
            prompt += `<Lore_Entry title="${l.title}" category="${l.category}">\n`;
            prompt += `  <Description>${l.description}</Description>\n`;
            if (l.sensoryPalette) prompt += `  <Sensory_Palette>${l.sensoryPalette}</Sensory_Palette>\n`;
            if (l.storyDay !== undefined) prompt += `  <Story_Day>${l.storyDay}</Story_Day>\n`;
            if (l.category === 'Characters') {
                if (l.gender) prompt += `  <Gender>${l.gender}</Gender>\n`;
                if (l.relations) prompt += `  <Relations>${l.relations}</Relations>\n`;
            }
            prompt += `</Lore_Entry>\n`;
        });
        prompt += '</Axioms_Lore>\n';
    }

    if (authorVoice) {
        prompt += '<Master_Voice>\n';
        prompt += `  <Narrative_Style>${authorVoice.narrativeStyle}</Narrative_Style>\n`;
        prompt += `  <Prose_Structure>${authorVoice.proseStructure}</Prose_Structure>\n`;
        prompt += `  <Pacing_Rhythm>${authorVoice.pacingRhythm}</Pacing_Rhythm>\n`;
        prompt += `  <Vocabulary_Diction>${authorVoice.vocabularyDiction}</Vocabulary_Diction>\n`;
        prompt += `  <Thematic_Anchors>${authorVoice.thematicAnchors}</Thematic_Anchors>\n`;
        prompt += '</Master_Voice>\n';
    }

    if (voiceProfiles.length > 0) {
        prompt += '<Character_Voices>\n';
        voiceProfiles.forEach(v => {
            prompt += `<Voice_DNA name="${v.name}">\n`;
            prompt += `  <Core_Motivation>${v.coreMotivation}</Core_Motivation>\n`;
            prompt += `  <Soul_Pattern>${v.soulPattern}</Soul_Pattern>\n`;
            prompt += `  <Cognitive_Speech>${v.cognitiveSpeech}</Cognitive_Speech>\n`;
            prompt += `  <Conflict_Style>${v.conflictStyle}</Conflict_Style>\n`;
            prompt += `  <Conversational_Role>${v.conversationalRole}</Conversational_Role>\n`;
            prompt += `  <Physical_Tells>${v.physicalTells}</Physical_Tells>\n`;
            prompt += `  <Internal_Monologue>${v.internalMonologue}</Internal_Monologue>\n`;
            if (v.signatureTraits?.length) prompt += `  <Signature_Traits>${v.signatureTraits.join(', ')}</Signature_Traits>\n`;
            if (v.idioms?.length) prompt += `  <Idioms>${v.idioms.join(', ')}</Idioms>\n`;
            if (v.exampleLines?.length) prompt += `  <Example_Lines>${v.exampleLines.join(' | ')}</Example_Lines>\n`;
            prompt += `</Voice_DNA>\n`;
        });
        prompt += '</Character_Voices>\n';
    }

    if (previousEchoes.length > 0) {
        prompt += '<Previous_Echoes>\n';
        previousEchoes.slice(0, 2).forEach((e, i) => {
            prompt += `  <Echo index="${i + 1}">${e.text.substring(0, 500)}...</Echo>\n`;
        });
        prompt += '</Previous_Echoes>\n';
    }

    if (focusAreas.length > 0) {
        prompt += '<Priority_Directives>\n';
        focusAreas.forEach(area => {
            prompt += `  <Directive area="${area}">${FOCUS_AREA_PROMPTS[area]}</Directive>\n`;
        });
        prompt += '</Priority_Directives>\n';
    }

    if (customInstruction) {
        prompt += `<Special_Instruction>\n${customInstruction}\n</Special_Instruction>\n`;
    }

    if (localWarnings.length > 0) {
        prompt += '<Continuity_Warnings>\n';
        localWarnings.forEach(w => {
            prompt += `  <Warning type="${w.type}">${w.message}</Warning>\n`;
        });
        prompt += '</Continuity_Warnings>\n';
    }

    const weighting = feedbackDepth === 'casual' ? '95% Voice / 5% Focus' : feedbackDepth === 'balanced' ? '80% Voice / 20% Focus' : '70% Voice / 30% Focus';
    prompt += `\nDialing System Weighting: ${weighting}\n`;

    return prompt;
};
