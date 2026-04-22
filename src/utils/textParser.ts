import type { BiasAnnotation } from "../types/bias";

export interface TextSegment {
  text: string;
  annotation: BiasAnnotation | null;
}

export function attachPositions(
  annotations: BiasAnnotation[],
  text: string,
): BiasAnnotation[] {
  let searchFrom = 0;

  return annotations
    .map((annotation) => {
      const phrase = annotation.flaggedText.trim();
      if (!phrase) {
        return null;
      }

      let startIndex = text.indexOf(phrase, searchFrom);

      if (startIndex === -1) {
        startIndex = text.toLowerCase().indexOf(phrase.toLowerCase(), searchFrom);
      }

      if (startIndex === -1) {
        startIndex = text.toLowerCase().indexOf(phrase.toLowerCase());
      }

      if (startIndex === -1) {
        return null;
      }

      const endIndex = startIndex + phrase.length;
      searchFrom = endIndex;

      return {
        ...annotation,
        startIndex,
        endIndex,
      };
    })
    .filter((item): item is BiasAnnotation => Boolean(item));
}

export function splitTextIntoSegments(
  text: string,
  annotations: BiasAnnotation[],
): TextSegment[] {
  if (!text) {
    return [];
  }

  const validAnnotations = annotations
    .filter(
      (ann) =>
        Number.isFinite(ann.startIndex) &&
        Number.isFinite(ann.endIndex) &&
        ann.startIndex >= 0 &&
        ann.endIndex > ann.startIndex &&
        ann.endIndex <= text.length,
    )
    .sort((a, b) => a.startIndex - b.startIndex);

  if (validAnnotations.length === 0) {
    return [{ text, annotation: null }];
  }

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const annotation of validAnnotations) {
    if (annotation.startIndex < cursor) {
      continue;
    }

    if (cursor < annotation.startIndex) {
      segments.push({ text: text.slice(cursor, annotation.startIndex), annotation: null });
    }

    segments.push({
      text: text.slice(annotation.startIndex, annotation.endIndex),
      annotation,
    });

    cursor = annotation.endIndex;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), annotation: null });
  }

  return segments;
}
