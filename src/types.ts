export type FocusArea = 'tone' | 'rhythm' | 'emotion' | 'plot' | 'sensory' | 'thematic' | 'dialogue' | 'continuity' | 'voiceIntegrity';

export type Gender = 'male' | 'female' | 'non-binary' | 'unspecified';

export interface AuthorVoice {
  id: string;
  name: string;
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
  category: 'World Mechanics' | 'Geography & Ecology' | 'Societal Strata' | 'Historical Context' | 'Current State';
  content: string;
  aliases?: string[];
  lastModified: string;
  isActive?: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
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

export interface ProseMetrics {
  sensory_vividness: number;
  pacing_rhythm: number;
  dialogue_authenticity: number;
  voice_consistency: number;
}

export interface RefinementAudit {
  loreCompliance: number;
  voiceAdherence: number;
  focusAreaImprovement: number;
}

export interface RefinedVersion {
  id: string;
  text: string;
  timestamp: string;
  title?: string;
  summary?: string;
  voiceAdherence?: string;
  structuralCompliance?: string;
  conflicts?: LoreConflict[];
  metrics?: ProseMetrics;
  audit?: RefinementAudit;
}

export type Screen = 'welcome' | 'workspace' | 'lore' | 'voices';

export type RefineMode = 'collaborative' | 'review' | 'reaction';
export type ReviewPerspective = 'editor' | 'reader' | 'critic';
export type FeedbackDepth = 'casual' | 'balanced' | 'in-depth';

export interface GuideSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  features: string[];
}
