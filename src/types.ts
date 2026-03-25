export type FocusArea = 'tone' | 'rhythm' | 'emotion' | 'plot' | 'sensory' | 'mythic' | 'dialogue' | 'structural' | 'voiceIntegrity';

export type Gender = 'male' | 'female' | 'non-binary' | 'unspecified';

export interface AuthorVoice {
  id: string;
  name: string;
  icon?: string;
  preview?: string;
  narrativeStyle: string;
  proseStructure: string;
  pacingAndRhythm: string;
  vocabularyAndDiction: string;
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
  category: 'World Mechanics' | 'Geography & Ecology' | 'Societal Strata' | 'Historical Context' | 'Current State' | string;
  content: string;
  aliases?: string[];
  lastModified: string;
  isActive?: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
  icon?: string;
  preview?: string;
  gender: Gender | 'other';
  archetype: string;
  soulPattern: string;
  cognitivePatterns: string;
  speechPatterns: string;
  emotionalExpression: string;
  behavioralAnchors: string;
  conversationalRole: string;
  signatureTraits: string[];
  idioms: string[];
  exampleLines: string[];
  physicalTells?: string;
  internalMonologueStyle?: string;
  conflictStyle?: string;
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
  audit?: RefinementAudit;
  restraintLog?: { category: string; target: string; justification: string }[];
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
  chapterId?: string;
  title: string;
  content: string;
  order: number;
  lastModified: string;
  hasEcho?: boolean;
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
  features: string[];
  categories?: GuideCategory[];
}
