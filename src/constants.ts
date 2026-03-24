import { FocusArea, GuideSection } from "./types";

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'about',
    title: 'About Echo',
    icon: 'Info',
    description: 'Echo is a specialized AI writing partner designed to reveal the author—clearly, faithfully, and without distortion.',
    features: [
      'Voice Preservation: Built to solve the problem of AI "over-polishing" and losing the author\'s unique style.',
      'Narrative Fidelity: Every refinement is grounded in your existing intent and stylistic DNA.',
      'Restraint-First Design: Echo prioritizes clarity over cleverness, ensuring your voice remains the star.',
      'For Serious Writers: Designed for those who want a partner in refinement, not a replacement for their creativity.'
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
            title: 'Who is it for?',
            description: 'Novelists, screenwriters, and creative storytellers who have a strong voice but want help with consistency, flow, and narrative precision.',
          }
        ]
      }
    ]
  },
  {
    id: 'workspace',
    title: 'Refinement Engine',
    icon: 'Sparkles',
    description: 'The core of Echo. Transform raw drafts into polished prose while preserving your unique stylistic identity.',
    features: [
      'Refine Mode: Intelligent polishing that respects your voice signature and narrative intent.',
      'Surgical Refine: Select specific text to refine only that part, keeping the rest of your draft untouched.',
      'Snippet View: Side-by-side comparison of original vs refined text for surgical refinements.',
      'Focus Lenses: Direct Echo to prioritize specific narrative layers like Tone, Emotion, Sensory Details, or Rhythm.',
      'Polish Depth: Choose between Casual (light touch), Balanced (standard), or In-depth (comprehensive) refinement layers.'
    ],
    categories: [
      {
        title: 'Surgical vs Global',
        items: [
          {
            title: 'Global Refinement',
            description: 'Refines the entire visible draft. Best for overall flow and consistency checks.',
          },
          {
            title: 'Surgical Refinement',
            description: 'Select a sentence or paragraph. Echo focuses its entire intelligence on that specific snippet, providing a side-by-side comparison.',
            example: {
              before: 'Select a messy sentence in your editor.',
              after: 'Click "Refine Selection Only" to see the focused result.'
            }
          }
        ]
      },
      {
        title: 'Focus Areas: Atmosphere & Style',
        items: [
          {
            title: 'Tone',
            description: 'Clarify and reinforce the existing emotional atmosphere without introducing new tonal qualities.',
            example: {
              before: 'The room was scary and dark.',
              after: 'Shadows pooled in the corners like spilled ink, and the air held the metallic tang of old fear.'
            }
          },
          {
            title: 'Rhythm',
            description: 'Refine sentence flow to better express your natural cadence and pacing.',
            example: {
              before: 'He ran. He saw the door. He opened it.',
              after: 'He ran—lungs burning, feet pounding—until the door appeared, a jagged slab of light in the dark. He threw it open.'
            }
          },
          {
            title: 'Sensory',
            description: 'Amplify sensory details only where they are already present or implied in your draft.',
            example: {
              before: 'The forest was nice and smelled like trees.',
              after: 'The scent of damp cedar and crushed pine needles hung heavy in the cool, mist-laden air.'
            }
          }
        ]
      },
      {
        title: 'Focus Areas: Narrative & Character',
        items: [
          {
            title: 'Emotion',
            description: 'Make implicit emotional cues more perceptible through physical or behavioral detail already suggested.',
            example: {
              before: 'She felt very sad about the news.',
              after: 'The words hit like a physical weight, hollow and cold, leaving a dull ache where her heart used to be.'
            }
          },
          {
            title: 'Dialogue',
            description: 'Sharpen clarity and subtext while preserving each character’s established voice and intent.',
            example: {
              before: '"I am going to leave now," he said.',
              after: '"I think we\'re done here," he muttered, eyes fixed on the door, fingers twitching toward his keys.'
            }
          },
          {
            title: 'Voice Integrity',
            description: 'Ensure every change sounds as though you wrote it, discarding anything that feels externally imposed.',
            example: {
              before: 'I walked down the street feeling weird.',
              after: 'I drifted down the pavement, a ghost in my own skin, feeling the world blur at the edges.'
            }
          }
        ]
      },
      {
        title: 'Focus Areas: Structure & Depth',
        items: [
          {
            title: 'Plot',
            description: 'Clarify cause-and-effect and narrative progression where coherence is compromised.',
            example: {
              before: 'Then he went to the store because he needed milk, but he forgot his wallet.',
              after: 'The need for milk was a dull pulse in his mind, but at the checkout, the realization hit: his pockets were empty, his wallet left on the kitchen counter.'
            }
          },
          {
            title: 'Mythic Weight',
            description: 'Surface existing thematic or symbolic elements through subtle reinforcement.',
            example: {
              before: 'The old sword was heavy and looked important.',
              after: 'The blade hummed with the weight of forgotten kings, its steel etched with the history of a thousand broken oaths.'
            }
          },
          {
            title: 'Structural',
            description: 'Correct inconsistencies in time, space, or knowledge while preserving basic coherence.',
            example: {
              before: 'He was at the castle, then he was at the village.',
              after: 'The sun had dipped below the horizon by the time the castle spires faded, replaced by the flickering torches of the village below.'
            }
          }
        ]
      },
      {
        title: 'Intelligence Models',
        items: [
          {
            title: 'Flash Lite',
            description: 'Optimized for speed. Best for quick grammar checks and light stylistic tweaks.',
            example: {
              before: 'He go to the store.',
              after: 'He went to the store.'
            }
          },
          {
            title: 'Flash',
            description: 'The balanced choice. Handles complex prose refinement with high efficiency.',
            example: {
              before: 'The storm was very loud and scary.',
              after: 'The storm roared with a primal fury, shaking the very foundations of the house.'
            }
          },
          {
            title: 'Pro',
            description: 'Maximum reasoning. Best for deep narrative analysis and complex character voices.',
            example: {
              before: 'Character A said something mean to Character B.',
              after: 'A\'s words were a calculated strike, a verbal blade aimed precisely at B\'s oldest insecurity.'
            }
          }
        ]
      },
      {
        title: 'Polish Depth',
        items: [
          {
            title: 'Casual',
            description: 'A light touch. Fixes errors but leaves the original phrasing mostly intact.',
            example: {
              before: 'The sun was hot and I was tired.',
              after: 'The sun was scorching, and I felt exhausted.'
            }
          },
          {
            title: 'Balanced',
            description: 'The standard Echo experience. Enhances flow and imagery while protecting your unique voice.',
            example: {
              before: 'The sun was hot and I was tired.',
              after: 'The sun beat down without mercy, draining the last of my strength.'
            }
          },
          {
            title: 'In-depth',
            description: 'Deep exploration. Echo looks for the hidden potential in your prose, expanding sensory and emotional resonance without replacing your intent.',
            example: {
              before: 'The sun was hot and I was tired.',
              after: 'The sun was a physical weight, a white-hot hammer striking the anvil of the earth, until every step felt like a battle against gravity itself.'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'lore',
    title: 'Lore Codex',
    icon: 'BookOpen',
    description: 'The narrative source of truth. Store world mechanics, geography, and history to ensure absolute consistency.',
    features: [
      'Contextual Awareness: Echo automatically scans your draft and suggests relevant lore entries for the scene.',
      'Categorized Knowledge: Organize your world-building by Mechanics, Geography, Society, and custom categories.',
      'Active Context: Manually toggle entries to force Echo to respect specific world rules during refinement.',
      'Consistency Guard: Prevent contradictions in world-building by keeping your source of truth always accessible.'
    ]
  },
  {
    id: 'voices',
    title: 'Voice & Identity',
    icon: 'Mic2',
    description: 'Define and lock the unique speech patterns and internal monologues of your characters.',
    features: [
      'Character Voice Lock: Ensure dialogue remains consistent across chapters, scenes, and emotional states.',
      'Author Voice: Set a primary narrative style (e.g., Minimalist, Lyrical, Cinematic) for your entire project.',
      'Soul Patterns: Define the core linguistic traits and signature vocabulary that make a character unique.',
      'Gender-Matched Profiles: Visual cues to help you quickly identify and manage your cast of characters.'
    ]
  },
  {
    id: 'analysis',
    title: 'Narrative Analysis',
    icon: 'BarChart3',
    description: 'Deep insights into your writing style and refinement quality.',
    features: [
      'Voice Consistency Score: Real-time feedback on how well Echo preserved your unique authorial identity.',
      'Drift Detection: Identify exactly where the AI might be over-polishing or losing your natural voice.',
      'Refinement Metrics: Track improvements in clarity, flow, and emotional resonance across versions.',
      'Conflict Resolution: Identify and fix contradictions between your draft and established lore or voices.'
    ]
  },
  {
    id: 'settings',
    title: 'System & Quota',
    icon: 'Settings',
    description: 'Manage your Echo environment and API connectivity.',
    features: [
      'Pro Key Integration: Connect your own Gemini API key for unlimited, high-priority refinement sessions.',
      'Global Reset: Securely clear all project data (Lore, Voices, History) to start a fresh narrative journey.',
      'Project Portability: Export and import your entire Echo project state as a single portable file.',
      'Theme Customization: Adjust the workspace aesthetic to suit your creative environment.'
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
