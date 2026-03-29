export type FocusArea = 'tone' | 'rhythm' | 'emotion' | 'plot' | 'sensory' | 'mythic' | 'dialogue' | 'structural' | 'voiceIntegrity';

export type Gender = 'male' | 'female' | 'non-binary' | 'unspecified';

export interface Relationship {
  targetId: string;
  type: string;
  tension: 1 | 2 | 3 | 4 | 5;
  context: string;
}

export interface AuthorVoice {
  id: string;
  name: string;
  icon?: string;
  voicePreview?: string;
  narrativeStyle: string;
  proseStructure: string;
  pacingRhythm: string;
  vocabularyDiction: string;
  thematicAnchors: string;
  lastModified: string;
  isActive?: boolean;
}

export interface MasterVoice {
  id: string;
  name: string;
  narrativeStyle: string;
  tone: string;
  vocabularyLevel: string;
  pacingPreference: string;
  description: string;
  signaturePhrases: string[];
  lastModified: string;
  isActive: boolean;
}

export interface LoreEntry {
  id: string;
  title: string;
  category: 'Characters' | 'Locations' | 'Items' | 'World Mechanics' | 'Geography & Ecology' | 'Societal Strata' | 'Historical Context' | 'Current State' | 'Timeline' | 'Other';
  description: string;
  aliases?: string[];
  gender?: string;
  sensoryPalette?: string;
  relations?: string;
  relationships?: Relationship[];
  lastModified: string;
  isActive?: boolean;
  storyDay?: number;
  linkedEntityIds?: string[];
  embedding?: number[];
}

export interface VoiceProfile {
  id: string;
  name: string;
  icon?: string;
  preview?: string;
  gender: Gender | 'other';
  archetype: string;
  coreMotivation: string;
  soulPattern: string;
  cognitiveSpeech: string;
  signatureTraits: string[];
  idioms: string[];
  exampleLines: string[];
  conflictStyle: string;
  conversationalRole: string;
  physicalTells: string;
  internalMonologue: string;
  relationships: Relationship[];
  aliases?: string[];
  lastModified: string;
  isActive?: boolean;
}

export interface LoreConflict {
  sentence: string;
  reason: string;
}

export interface ProseMetric {
  score: number;
  note: string;
  qualifier: 'By Design' | 'Opportunity';
}

export interface ProseMetrics {
  sensory_vividness: ProseMetric;
  pacing_rhythm: ProseMetric;
  dialogue_authenticity: ProseMetric;
  voice_consistency: Omit<ProseMetric, 'qualifier'> & { qualifier: 'By Design' };
}

export interface RefinementAudit {
  voiceFidelityScore: number;
  voiceFidelityReasoning: string;
  loreCompliance: number;
  loreComplianceReasoning: string;
  voiceAdherence: number;
  voiceAdherenceReasoning: string;
  focusAreaAlignment: number;
  focusAreaAlignmentReasoning: string;
}

export interface LoreCorrection {
  original: string;
  refined: string;
  reason: string;
  snippet?: string;
}

export interface LoreFraying {
  snippet: string;
  conflict: string;
  suggestion: string;
}

export interface VoiceAudit {
  characterName: string;
  resonanceScore: number; // 0-100
  dissonanceReason?: string; // e.g., "Anya sounds too formal here."
}

export interface RefinedVersion {
  id: string;
  text: string;
  timestamp: string;
  title?: string;
  summary?: string;
  analysis?: string;
  justification?: string;
  evidenceBasedClaims?: string;
  whyBehindChange?: string;
  loreLineage?: string;
  mirrorEditorCritique?: string;
  conflicts?: LoreConflict[];
  metrics?: ProseMetrics;
  loreCorrections?: LoreCorrection[];
  loreFraying?: LoreFraying[];
  voiceAudits?: VoiceAudit[];
  audit?: RefinementAudit;
  restraintLog?: { category: string; target: string; justification: string; snippet?: string }[];
  expressionProfile?: { vibe: string; score: number; qualifier: 'By Design' | 'Opportunity'; note: string }[];
  activeContext?: {
    authorVoice?: string;
    characterVoices: string[];
    loreProfiles: string[];
    focusAreas: string[];
  };
  sceneId?: string;
  isAccepted?: boolean;
  isSurgical?: boolean;
  isPinned?: boolean;
  milestoneLabel?: string;
  wordCountDelta?: { added: number; removed: number };
  originalSelection?: string;
  refinedSelection?: string;
  usedProfiles?: {
    authorVoice?: string;
    characterVoices?: string[];
    loreEntries?: string[];
    focusAreas?: FocusArea[];
  };
}

export interface WritingGoal {
  targetWords: number;
  deadline?: string;
  dailyTarget?: number;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
}

export interface Scene {
  id: string;
  projectId?: string;
  chapterId?: string;
  title: string;
  content: string;
  order: number;
  lastModified: string;
  hasEcho?: boolean;
  storyDay?: number;
  storyTime?: string;
}

export type Screen = 'welcome' | 'workspace' | 'lore' | 'voices' | 'manuscript' | 'settings';

export type WorkspaceTab = 'draft' | 'context' | 'refine' | 'archive' | 'report';

export type RefineMode = 'collaborative' | 'review' | 'reaction';
export type ReviewPerspective = 'editor' | 'reader' | 'critic';
export type FeedbackDepth = 'casual' | 'balanced' | 'in-depth';

export interface GuideExample {
  before: string;
  after: string;
}

export interface GuideItem {
  title: string;
  description: string;
  example?: GuideExample;
  proTips?: string[];
}

export interface GuideCategory {
  title: string;
  items: GuideItem[];
}

export interface GuideSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  features?: string[];
  categories: GuideCategory[];
  hideFromQuickGuide?: boolean;
}
