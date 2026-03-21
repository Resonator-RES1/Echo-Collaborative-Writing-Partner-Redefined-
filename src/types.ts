export type RefineMode = 'collaborative' | 'review' | 'reaction';

export type FocusArea = 'tone' | 'rhythm' | 'emotion' | 'plot' | 'sensory' | 'thematic' | 'dialogue' | 'continuity' | 'voiceIntegrity';

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
  lastModified: string;
  isActive?: boolean;
  isMasterVoice?: boolean;
}

export interface ParagraphAnalysis {
  id: string;
  fidelityScore: number; // 0-100
  rationale: string;
  voiceRecoverySuggestion: string;
  hoverDetails: {
    sentenceLength: string;
    toneShift: string;
    vocabularyChanges: string[];
  };
}

export interface SceneAnalysis {
  id: string;
  location: string;
  timeframe: string;
  loreConsistencyScore: number; // 0-100
  conflictDetectionRationale: string;
  loreReinforcementSuggestion: string;
  tensionScore: number; // 0-100
  pacingScore: number; // 0-100
}

export interface Recommendation {
  type: 'voice' | 'lore' | 'atmosphere';
  title: string;
  description: string;
  actionable: string;
  suggestedFix?: string;
}

export interface AuditItem {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ComplianceReport {
  metrics: {
    loreConsistency: number;
    voiceAuthenticity: number;
    mythicResonance: number;
    structuralCompliance: number;
  };
  audit: AuditItem[];
  thematicNote?: string;
  
  // v2 Features
  narrativeSummary?: string;
  trendIndicator?: 'improving' | 'drifting' | 'stable';
  paragraphHeatmap?: ParagraphAnalysis[];
  sceneTimeline?: SceneAnalysis[];
  tensionGraph?: { scene: number; tension: number; pacing: number }[];
  recommendations?: Recommendation[];
}

export interface RefinedVersion {
  id: string;
  title: string;
  text: string;
  report?: ComplianceReport | string;
  comparison?: ComparisonResponse;
  timestamp: string;
  mode?: RefineMode;
}

export interface ComparisonResponse {
  changes: {
    location: string;
    original: string;
    polished: string;
    type: 'voice' | 'lore' | 'structural' | 'vocabulary';
    rationale: string;
    voiceLock?: boolean;
  }[];
  summary: string;
  metrics: {
    wordCountChange: number;
    readabilityShift: string;
    toneShift: string;
    voiceFidelity: number;
    loreConsistency: number;
  };
  compliance?: ComplianceReport;
}

export interface VoiceCheckResponse {
  consistencyScore: number;
  analysis: string;
  strengths: string[];
  concerns: string[];
  verdict: string;
}

export type Screen = 'workspace' | 'lore' | 'voices' | 'analysis';
