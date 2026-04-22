import { ALL_LENSES } from "../types/bias";
import type { BiasLens } from "../types/bias";

export function buildPrompt(text: string, activeLenses: BiasLens[]): string {
  const lensesToAudit = activeLenses.length > 0 ? activeLenses : [...ALL_LENSES];

  return `
You are a writing bias auditor. Analyze the following text for bias across these lenses: ${lensesToAudit.join(", ")}.

For each biased phrase found, return a JSON object. Respond ONLY with valid JSON and no markdown.

Return this exact shape:
{
  "annotations": [
    {
      "id": "unique string",
      "lens": "one of: political_framing | gender_language | emotional_loading | logical_fallacy",
      "flaggedText": "exact phrase from the text",
      "explanation": "why this is biased",
      "suggestion": "a more neutral rephrasing",
      "counterBiasArgument": "what a fair opponent might argue",
      "fallacyType": "short fallacy name only when lens is logical_fallacy, else null",
      "claimText": "the underlying claim this phrase supports/challenges",
      "confidence": 0.0 to 1.0
    }
  ],
  "overallScores": {
    "political_framing": 0.0 to 1.0,
    "gender_language": 0.0 to 1.0,
    "emotional_loading": 0.0 to 1.0,
    "logical_fallacy": 0.0 to 1.0
  },
  "summary": "2-3 sentence overview of the writing's bias profile"
}

TEXT TO ANALYZE:
"""
${text}
"""
`;
}
