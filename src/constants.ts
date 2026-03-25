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
            proTips: [
              'Pro Tip: Think of Echo as a mirror, not a ghostwriter. It reflects your intent, it doesn\'t replace it.',
              'Pro Tip: The less you ask Echo to do, the more powerful its specific refinements become.'
            ]
          },
          {
            title: 'The Architect\'s Approach',
            description: 'We don\'t just "generate" text. We architect systems—Lore, Voice, and Engine—that work together to reveal the story you\'re already telling.',
            proTips: [
              'Pro Tip: Spend time in the Lore and Voice panels before refining; they are the "DNA" the engine uses.',
              'Pro Tip: Use the "Balanced" feedback depth for most work; "In-depth" is best for final structural passes.'
            ]
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
            },
            proTips: [
              'Pro Tip: The Watcher uses your Lore entries as its source of truth. If a name isn\'t being flagged, check your Lore.',
              'Pro Tip: You can toggle the Watcher off in Settings if you\'re intentionally playing with shifting identities.'
            ]
          },
          {
            title: 'Alias Sync',
            description: 'Tracks nicknames and titles to ensure "The Captain" and "Marcus" are recognized as the same entity.',
            proTips: [
              'Pro Tip: Add aliases in the Lore entry for a character to help the Watcher connect the dots.',
              'Pro Tip: The Watcher is case-sensitive for names to avoid flagging common words.'
            ]
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
            },
            proTips: [
              'Pro Tip: Select exactly what you want to change. Including too much surrounding text can dilute the focus.',
              'Pro Tip: Use the "Mirror Report" to see how the engine interpreted your original "Aura" before accepting.'
            ]
          }
        ]
      },
      {
        title: 'Focus Areas (The Lenses)',
        items: [
          {
            title: 'Tone & Atmosphere',
            description: 'Clarify and reinforce the existing emotional atmosphere. Adjust diction only where the intended mood is present but obscured.',
            example: {
              before: 'The room was scary and dark. I walked in slowly.',
              after: 'Shadows pooled in the corners like spilled ink. Every step felt like a trespass.'
            },
            proTips: [
              'Pro Tip: Echo analyzes your sentence length distribution to ensure the refined version doesn\'t "smooth out" intentional staccato pacing.',
              'Pro Tip: If the tone feels off, check if you have a conflicting "Author Voice" active in the sidebar.'
            ]
          },
          {
            title: 'Rhythm & Pacing',
            description: 'Refine sentence flow to better express the author’s natural cadence. Break or restructure only where rhythm disrupts clarity.',
            example: {
              before: 'He ran. He was fast. He didn\'t stop.',
              after: 'He ran—a blur of desperate motion that refused to yield.'
            },
            proTips: [
              'Pro Tip: Use this lens when a scene feels "clunky" but the words themselves are correct.',
              'Pro Tip: Echo preserves intentional fragments when Rhythm is the primary focus.'
            ]
          },
          {
            title: 'Sensory Detail',
            description: 'Amplify sensory details only where they are already present or implied. Do not add new sensory dimensions that alter the stylistic baseline.',
            example: {
              before: 'The kitchen smelled like bread.',
              after: 'The air was thick with the yeasty warmth of rising dough and the sharp tang of cooling iron.'
            },
            proTips: [
              'Pro Tip: This lens works best when paired with a Sensory Palette in Lore.',
              'Pro Tip: It focuses on "Show, Don\'t Tell" by converting abstract adjectives into concrete nouns.'
            ]
          },
          {
            title: 'Voice Integrity',
            description: 'The "Silent Watcher." This lens ensures that the engine does not drift into generic AI prose, strictly preserving your unique linguistic fingerprints.',
            example: {
              before: 'I was really happy that I finally got to see the ocean for the first time in my life.',
              after: 'The ocean, at last. A vast, salt-heavy promise finally kept.'
            },
            proTips: [
              'Pro Tip: Use this when you feel the engine is making your writing sound too "perfect" or "robotic".',
              'Pro Tip: It prioritizes your specific sentence structures over "standard" grammar rules.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'intelligence',
    title: 'Intelligence Models',
    icon: 'Brain',
    description: 'Choose the brain that powers your refinement. Different tasks require different levels of cognitive depth.',
    features: [
      'Gemini Flash: Optimized for speed and efficiency. Best for quick polishes and dialogue tweaks.',
      'Gemini Pro: Deep reasoning and complex narrative understanding. Best for structural shifts and thematic depth.',
      'Model Switching: Toggle between models instantly based on the complexity of the current selection.'
    ],
    categories: [
      {
        title: 'The Brains',
        items: [
          {
            title: 'Gemini Flash (The Sprinter)',
            description: 'Flash is built for low-latency, high-speed refinement. It excels at maintaining surface-level style and fixing rhythmic clunks.',
            example: {
              before: "He walked to the store. He bought some milk. He walked home. He felt tired.",
              after: "He walked to the store to buy milk, then returned home, exhaustion settling into his bones."
            },
            proTips: [
              'Pro Tip: Use Flash for 90% of your drafting process to keep the momentum going.',
              'Pro Tip: It is particularly effective at "cleaning up" dialogue without over-thinking the subtext.'
            ]
          },
          {
            title: 'Gemini Pro (The Architect)',
            description: 'Pro is designed for complex reasoning. It understands the "World Soul" and "Lore" at a much deeper level, making it ideal for heavy structural work.',
            example: {
              before: "The room was dark and he felt scared because he knew someone was there.",
              after: "Shadows pooled in the corners like spilled ink. He didn't need to see the intruder; the sudden, heavy silence in the room spoke loud enough."
            },
            proTips: [
              'Pro Tip: Switch to Pro when you need the engine to respect complex magic systems or intricate character motivations.',
              'Pro Tip: Pro is slower but significantly more "faithful" to long-term continuity.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'depth',
    title: 'Polish Depth',
    icon: 'Zap',
    description: 'Control the intensity of the refinement. From a light dusting to a deep structural reconstruction.',
    features: [
      'Casual: A light touch. Fixes grammar and basic flow while leaving 95% of the original text untouched.',
      'Balanced: The standard Echo experience. Surgical improvements that clarify intent without rewriting the soul.',
      'In-depth: Comprehensive refinement. Reconstructs sentences for maximum impact while strictly adhering to the Author Voice.'
    ],
    categories: [
      {
        title: 'Refinement Intensity',
        items: [
          {
            title: 'Casual Depth',
            description: 'The "Invisible Editor." It focuses on removing friction—fixing typos, clarifying awkward phrasing, and ensuring basic readability.',
            example: {
              before: 'I think that maybe we should go to the store now.',
              after: 'We should go to the store.'
            },
            proTips: [
              'Pro Tip: Use Casual when you love your prose but want a quick "sanity check" for errors.',
              'Pro Tip: This mode has the highest "Voice Fidelity" score because it changes the least.'
            ]
          },
          {
            title: 'Balanced Depth',
            description: 'The "Collaborative Partner." It looks for the "Aura" of the sentence and helps you express it more vividly without losing your voice.',
            example: {
              before: 'The sun was hot on my back.',
              after: 'The midday sun pressed against my shoulders like a physical weight.'
            },
            proTips: [
              'Pro Tip: This is the default mode for a reason. it provides the best balance of "Improvement" vs "Fidelity".',
              'Pro Tip: Use this when a sentence feels "flat" but you aren\'t sure why.'
            ]
          },
          {
            title: 'In-depth Depth',
            description: 'The "Master Class." It performs a deep structural analysis, often combining or splitting sentences to achieve the desired narrative effect.',
            example: {
              before: 'He looked at the map. It was old. He couldn\'t see the lines very well because the light was bad.',
              after: 'He squinted at the map, but the faded ink dissolved into the gloom of the dying fire.'
            },
            proTips: [
              'Pro Tip: Use In-depth for "Hero Sentences"—the opening lines of chapters or critical emotional beats.',
              'Pro Tip: Be prepared for more significant changes; always review the Mirror Report carefully in this mode.'
            ]
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
            },
            proTips: [
              'Pro Tip: Use the Sensory Palette in Lore to give Echo the specific "chemical DNA" of a location.',
              'Pro Tip: Don\'t overstuff palettes; 3-5 high-impact sensory words are more effective than a long list.'
            ]
          },
          {
            title: 'Voice Lock',
            description: 'Ensures a character\'s unique idioms and speech patterns remain consistent across the entire narrative.',
            example: {
              before: '"I am going to leave now," he said.',
              after: '"I think we\'re done here," he muttered, eyes fixed on the door, fingers twitching toward his keys.'
            },
            proTips: [
              'Pro Tip: Use "Soul Patterns" for abstract personality traits and "Speech Patterns" for literal rhythmic habits.',
              'Pro Tip: Add "Signature Idioms" to prevent the AI from using generic metaphors for unique characters.'
            ]
          }
        ]
      }
    ]
  }
];

export const ECHO_MANUAL_CONTENT = [
  {
    feature: 'The Silent Watcher (Identity Guard)',
    philosophy: 'Privacy and continuity are the bedrock of trust. By running locally, we ensure your most raw, unpolished thoughts never leave your machine until you are ready.',
    technicalConstraints: 'Operates on a regex-based local engine. Limited to pattern matching for names, pronouns, and explicit aliases. Does not "understand" subtext, only surface-level consistency.'
  },
  {
    feature: 'Surgical Refinement',
    philosophy: 'The "Scalpel" approach prevents the AI from taking over the narrative. By isolating specific sentences, we force the engine to work within the constraints of your existing prose.',
    technicalConstraints: 'Maximum selection size is 2000 characters to maintain focus. Refinement quality degrades if the selection is too small (less than 5 words) or too large (entire chapters).'
  },
  {
    feature: 'Lore Integration',
    philosophy: 'A story is only as strong as its world. Lore entries act as "hard constraints" that the AI cannot ignore, preventing hallucinations and continuity errors.',
    technicalConstraints: 'Active Lore is injected into the system prompt. Too many active entries (over 20) can lead to "prompt dilution" where the AI misses specific details.'
  },
  {
    feature: 'Voice Profiles',
    philosophy: 'Characters should sound like themselves, not like an AI. Voice profiles provide the rhythmic and lexical DNA that the engine uses to reconstruct dialogue.',
    technicalConstraints: 'The engine prioritizes the "Active" voice profile. If multiple profiles are active, the AI may blend them unless character names are clearly tagged in the draft.'
  },
  {
    feature: 'Mirror Reports',
    philosophy: 'Feedback should be objective, not judgmental. Mirror reports provide a neutral interpretation of your writing, helping you see your work through fresh eyes.',
    technicalConstraints: 'Scores are relative to the "Author Voice" DNA. A low score doesn\'t mean "bad writing," it means "low alignment" with the established style.'
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
