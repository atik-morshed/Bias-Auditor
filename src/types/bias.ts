export const ALL_LENSES = [
  "political_framing",
  "gender_language",
  "emotional_loading",
  "logical_fallacy",
] as const;

export type BiasLens = (typeof ALL_LENSES)[number];

export interface BiasAnnotation {
  id: string;
  lens: BiasLens;
  startIndex: number;
  endIndex: number;
  flaggedText: string;
  explanation: string;
  suggestion: string;
  counterBiasArgument: string;
  fallacyType?: string;
  claimText?: string;
  confidence: number;
}

export interface AnalysisResult {
  annotations: BiasAnnotation[];
  overallScores: Record<BiasLens, number>;
  summary: string;
}

export type AnalysisStatus = "idle" | "loading" | "done" | "error";
