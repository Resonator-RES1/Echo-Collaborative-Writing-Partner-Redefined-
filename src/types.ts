export type RefineMode = 'collaborative' | 'review' | 'reaction';

export type FocusArea = 'tone' | 'rhythm' | 'emotion' | 'plot' | 'sensory' | 'thematic' | 'dialogue' | 'continuity';

export type ReviewPerspective = 'reader' | 'editor' | 'publisher';

export type FeedbackDepth = 'casual' | 'balanced' | 'in-depth';

export type Gender = 'male' | 'female' | 'non-binary' | 'unspecified';

export interface CharacterProfile {
  id: string;
  name: string;
  voice: string;
  gender: Gender;
  backstory: string;
  motivations: string;
  relationships: string;
  isActive?: boolean;
}

export interface LoreEntry {
  id: string;
  title: string;
  category: 'World Mechanics' | 'Geography & Ecology' | 'Societal Strata' | 'Historical Context' | 'Current State';
  content: string;
  lastModified: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  archetype: string;
  patterns: string[];
  idioms: string[];
  soulPattern?: string;
  lastModified: string;
  isActive?: boolean;
}

export interface ComplianceReport {
  mythicResonance: { status: 'Pass' | 'Fail'; reasoning: string };
  characterVoice: { status: 'Pass' | 'Fail'; reasoning: string };
  loreConsistency: { status: 'Pass' | 'Fail'; reasoning: string };
  thematicNote: string;
}

export interface RefinedVersion {
  id: string;
  text: string;
  report?: ComplianceReport | string;
  timestamp: string;
  mode?: RefineMode;
}

export interface ComparisonResponse {
  changes: {
    location: string;
    original: string;
    polished: string;
    reasoning: string;
  }[];
  summary: string;
  metrics: {
    wordCountChange: number;
    readabilityShift: string;
    toneShift: string;
  };
}

export interface VoiceCheckResponse {
  consistencyScore: number;
  analysis: string;
  strengths: string[];
  concerns: string[];
  verdict: string;
}

export type Screen = 'workspace' | 'lore' | 'voices' | 'analysis';
