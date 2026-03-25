import { FocusArea, GuideSection } from "./types";

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'sanctuary',
    title: 'The Sanctuary',
    icon: 'Info',
    description: 'The foundation of Echo. A space designed to protect your creative spark from the noise of generic AI.',
    features: [
      'Voice Preservation: Built to solve the problem of AI "over-polishing" and losing the author\'s unique style.',
      'Narrative Fidelity: Every refinement is grounded in your existing intent and stylistic DNA.',
      'Restraint-First Design: Echo prioritizes clarity over cleverness, ensuring your voice remains the star.',
      'Identity vs. Engine: A clear distinction between who your characters are and how the AI processes their speech.'
    ],
    categories: [
      {
        title: 'The Philosophy',
        items: [
          {
            title: 'Why Echo?',
            description: 'Most AI tools try to "improve" writing by making it sound like a generic average. Echo does the opposite: it analyzes your unique patterns and helps you express them more clearly.',
          },
          {
            title: 'The Architect\'s Approach',
            description: 'We don\'t just "generate" text. We architect systems—Lore, Voice, and Engine—that work together to reveal the story you\'re already telling.',
          }
        ]
      }
    ]
  },
  {
    id: 'watcher',
    title: 'The Silent Watcher',
    icon: 'Fingerprint',
    description: 'The Identity Guard. A local intelligence that monitors your draft for continuity without ever sending a single word to the cloud.',
    features: [
      'Local Continuity: Runs entirely in your browser to protect pronouns, aliases, and gender consistency.',
      'Privacy First: Your raw drafts stay local; only surgical refinement requests reach the engine.',
      'Real-time Alerts: Subtle highlights when a character\'s identity drifts or a name is misspelled.',
      'Zero-Latency: Instant feedback as you type, ensuring your world remains stable.'
    ],
    categories: [
      {
        title: 'Identity Protection',
        items: [
          {
            title: 'The Silent Watcher',
            description: 'It runs locally to protect pronouns and aliases, ensuring your character\'s identity remains consistent throughout the scene.',
            example: {
              before: 'John walked in. She sat down.',
              after: 'John walked in. He sat down.'
            }
          },
          {
            title: 'Alias Sync',
            description: 'Tracks nicknames and titles to ensure "The Captain" and "Marcus" are recognized as the same entity.',
          }
        ]
      }
    ]
  },
  {
    id: 'engine',
    title: 'The Refinement Engine',
    icon: 'Sparkles',
    description: 'The Scalpel, not the Sledgehammer. Surgical refinement that polishes specific sentences without touching the rest of your draft.',
    features: [
      'Surgical Refinement: Polish specific sentences without touching the rest of the draft, keeping the soul of your prose intact.',
      'Focus Lenses: Direct the engine to prioritize specific narrative layers like Tone, Rhythm, or Sensory Details.',
      'Polish Depth: Choose between Casual (light touch), Balanced (standard), or In-depth (comprehensive) layers.',
      'Aura Analysis: Real-time feedback on the emotional and stylistic "Aura" of your refined text.'
    ],
    categories: [
      {
        title: 'Surgical Precision',
        items: [
          {
            title: 'The Scalpel',
            description: 'Surgical Refinement allows you to polish specific sentences without touching the rest of the draft. Echo focuses its entire intelligence on that specific snippet.',
            example: {
              before: 'The forest was nice.',
              after: 'The scent of damp cedar and crushed pine needles hung heavy in the mist.'
            }
          },
          {
            title: 'Tone Alignment',
            description: 'Clarify and reinforce the existing emotional atmosphere without introducing new tonal qualities.',
            example: {
              before: 'The room was scary and dark.',
              after: 'Shadows pooled in the corners like spilled ink, and the air held the metallic tang of old fear.'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'soul',
    title: 'The World Soul',
    icon: 'BookOpen',
    description: 'The Advanced Layer. Inject the DNA of your world mechanics and character psyches into every refinement.',
    features: [
      'Sensory Palettes: Define the "DNA of a location" (scents, sounds, textures) to be injected into descriptions.',
      'Soul Patterns: Lock the unique linguistic traits and signature vocabulary of your characters.',
      'World Mechanics: Ensure the AI respects the hard rules of your magic, technology, or societal strata.',
      'Core Motivation: Drive dialogue subtext by defining what a character truly wants in every scene.'
    ],
    categories: [
      {
        title: 'World Engine',
        items: [
          {
            title: 'Sensory Palettes',
            description: 'Sensory Palettes allow you to inject the "DNA of a location" into your scene through specific atmospheric keywords.',
            example: {
              before: 'The tavern was busy.',
              after: 'The tavern hummed with the low thrum of a dozen languages, thick with the smell of roasted malt and stale pipeweed.'
            }
          },
          {
            title: 'Voice Lock',
            description: 'Ensures a character\'s unique idioms and speech patterns remain consistent across the entire narrative.',
            example: {
              before: '"I am going to leave now," he said.',
              after: '"I think we\'re done here," he muttered, eyes fixed on the door, fingers twitching toward his keys.'
            }
          }
        ]
      }
    ]
  }
];

export const ECHO_SYSTEM_PROMPT = `
# 🤖 SYSTEM ROLE: ECHO — THE VOICE-PRESERVING NARRATIVE REFINER

You are Echo, an elite narrative refinement engine. Your mission is: "Reveal the author—clearly, faithfully, and without distortion."

## 🌌 CORE PHILOSOPHY
"Reveal the author—clearly, faithfully, and without distortion."

## 🛡️ GLOBAL DIRECTIVE: FIDELITY TO AUTHORIAL IDENTITY
- All refinements must reveal and clarify the author’s existing intent, not introduce new stylistic elements.
- Do not expand, embellish, or intensify beyond what is already implied.
- When ambiguity exists, resolve it in favor of the author’s established voice and patterns.
- If a change risks altering tone, style, or meaning, preserve the original.
- The goal is not improvement in isolation, but faithful articulation of what the text is already reaching toward.

## ⚙️ OPERATIONAL RULE: SILENCE AS VALID OUTPUT
- If no meaningful improvement can be made within a focus area, return no changes for that area.

---

## 🖋️ STYLISTIC DIRECTIVES
- **Preserve Stylistic Fragments**: Do not smooth out sentence fragments if they are used for stylistic effect.
- **Anglo-Saxon Over Latinate**: Do not replace simple Anglo-Saxon words with complex Latinate words (e.g., use 'use' instead of 'utilize').
- **Rhythm Fidelity**: Maintain the author's sentence rhythm, even if it is grammatically unconventional.
- **Verbatim Protection**: Respect "Sacred Phrasings"—if a phrase feels central to the author's intent, do not alter it.
- **Voice Integrity**: Every change must sound as though the author wrote it. If a revision feels externally imposed, it must be discarded.

---

## 🧠 THE REFINEMENT WORKFLOW
1. **Voice Signature Extraction**: Analyze the draft to understand vocabulary, rhythm, and tone.
2. **Intent Recognition**: Determine scene purpose and emotional baseline.
3. **Lore & Voice Alignment**: Ensure consistency with Active Lore and Character Voices.
4. **Surgical Refinement**: Apply selected focus areas using the author's DNA.
5. **Validation**: Ensure the identity remains intact and undistorted.
`;

export const FOCUS_AREA_PROMPTS: Record<FocusArea, string> = {
  tone: "### FOCUS: TONE\nClarify and reinforce the existing emotional atmosphere. Adjust diction only where the intended mood is present but obscured. Do not introduce new tonal qualities not already implied.",
  rhythm: "### FOCUS: RHYTHM\nRefine sentence flow to better express the author’s natural cadence. Break or restructure only where rhythm disrupts clarity or intent. Preserve idiosyncratic pacing if it appears deliberate.",
  emotion: "### FOCUS: EMOTION\nMake implicit emotional cues more perceptible through physical or behavioral detail already suggested in the text. Avoid introducing new emotional layers not grounded in the scene.",
  plot: "### FOCUS: PLOT\nClarify cause-and-effect and narrative progression where it is unclear. Do not simplify, compress, or redirect events unless coherence is compromised.",
  sensory: "### FOCUS: SENSORY\nAmplify sensory details only where they are already present or implied. Do not add new sensory dimensions that alter the stylistic baseline.",
  mythic: "### FOCUS: MYTHIC WEIGHT\nSurface existing thematic or symbolic elements through subtle reinforcement. Do not impose new motifs or deepen meaning beyond what the text supports.",
  dialogue: "### FOCUS: DIALOGUE\nSharpen clarity and subtext while preserving each character’s established voice. Avoid rewriting dialogue in a way that alters personality, tone, or intent.",
  structural: "### FOCUS: STRUCTURAL\nCorrect inconsistencies in time, space, or knowledge. Do not reorganize structure unless necessary for basic coherence.",
  voiceIntegrity: "### FOCUS: VOICE INTEGRITY\nEvery change must sound as though the author wrote it. If a revision feels externally imposed, it must be discarded.",
};
