import { useMemo, useState } from "react";
import { ALL_LENSES } from "../types/bias";
import type { AnalysisResult, AnalysisStatus, BiasAnnotation, BiasLens } from "../types/bias";
import { buildPrompt } from "../utils/promptBuilder";
import { attachPositions } from "../utils/textParser";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

function extractJsonCandidate(raw: string): string {
  const withoutFences = raw.replace(/```json|```/gi, "").trim();
  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return withoutFences.slice(firstBrace, lastBrace + 1);
  }

  return withoutFences;
}

function extractBalancedJsonObject(raw: string): string | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        return raw.slice(start, i + 1);
      }
    }
  }

  return null;
}

function sanitizeJsonCandidate(raw: string): string {
  return raw
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
}

function parseModelJson(raw: string): any {
  const baseCandidate = extractJsonCandidate(raw);
  const attempts = [
    baseCandidate,
    sanitizeJsonCandidate(baseCandidate),
  ];

  const balancedCandidate = extractBalancedJsonObject(baseCandidate);
  if (balancedCandidate) {
    attempts.push(balancedCandidate, sanitizeJsonCandidate(balancedCandidate));
  }

  let lastError: Error | null = null;

  for (const candidate of attempts) {
    if (!candidate) {
      continue;
    }

    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("JSON parse failed");
    }
  }

  throw new Error(
    `Could not parse model response as JSON. ${lastError?.message || "Unknown parse error."}`,
  );
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function normalizeAnnotation(annotation: Partial<BiasAnnotation>, index: number): BiasAnnotation {
  const lens = ALL_LENSES.includes(annotation.lens as BiasLens)
    ? (annotation.lens as BiasLens)
    : "emotional_loading";

  return {
    id: annotation.id?.toString().trim() || `ann-${index + 1}`,
    lens,
    startIndex: annotation.startIndex ?? -1,
    endIndex: annotation.endIndex ?? -1,
    flaggedText: annotation.flaggedText?.toString() || "",
    explanation: annotation.explanation?.toString() || "No explanation provided.",
    suggestion: annotation.suggestion?.toString() || "No neutral suggestion provided.",
    counterBiasArgument:
      annotation.counterBiasArgument?.toString().trim() ||
      "A fair opponent might argue the same point can be interpreted differently with additional context.",
    fallacyType: annotation.fallacyType?.toString().trim() || undefined,
    claimText: annotation.claimText?.toString().trim() || undefined,
    confidence: clampScore(Number(annotation.confidence ?? 0)),
  };
}

function normalizeResult(parsed: any): AnalysisResult {
  const annotations = Array.isArray(parsed?.annotations) ? parsed.annotations : [];
  const normalizedAnnotations = annotations.map((ann, index) => normalizeAnnotation(ann, index));

  const scores = ALL_LENSES.reduce((acc, lens) => {
    acc[lens] = clampScore(Number(parsed?.overallScores?.[lens] ?? 0));
    return acc;
  }, {} as Record<BiasLens, number>);

  return {
    annotations: normalizedAnnotations,
    overallScores: scores,
    summary: parsed?.summary?.toString().trim() || "No summary was returned by the model.",
  };
}

export function useBiasAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeLenses, setActiveLenses] = useState<BiasLens[]>([...ALL_LENSES]);

  const canAnalyze = useMemo(() => activeLenses.length > 0, [activeLenses.length]);

  async function analyze(text: string) {
    if (!text.trim()) {
      setStatus("error");
      setErrorMessage("Please enter some text before analyzing.");
      return;
    }

    if (!canAnalyze) {
      setStatus("error");
      setErrorMessage("Select at least one bias lens to run the audit.");
      return;
    }

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
    const model =
      (import.meta.env.VITE_OPENROUTER_MODEL as string | undefined) ||
      "openai/gpt-4o-mini";

    if (!apiKey) {
      setStatus("error");
      setErrorMessage("Missing VITE_OPENROUTER_API_KEY in your environment.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Bias Auditor",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1200,
          temperature: 0,
          messages: [{ role: "user", content: buildPrompt(text, activeLenses) }],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      const messageContent = data?.choices?.[0]?.message?.content;
      const rawContent =
        typeof messageContent === "string"
          ? messageContent
          : Array.isArray(messageContent)
            ? messageContent
                .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
                .join("\n")
            : "";

      if (!rawContent || typeof rawContent !== "string") {
        throw new Error("No text content was returned by the model.");
      }

      const parsed = parseModelJson(rawContent);
      const normalized = normalizeResult(parsed);
      const enriched = attachPositions(normalized.annotations, text);

      setResult({ ...normalized, annotations: enriched });
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected error while analyzing text.",
      );
    }
  }

  return {
    status,
    errorMessage,
    result,
    activeLenses,
    setActiveLenses,
    canAnalyze,
    analyze,
  };
}
