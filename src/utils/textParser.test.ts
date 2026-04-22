import { describe, expect, it } from "vitest";
import type { BiasAnnotation, BiasLens } from "../types/bias";
import { attachPositions, splitTextIntoSegments } from "./textParser";

function makeAnnotation(
  id: string,
  flaggedText: string,
  lens: BiasLens = "emotional_loading",
): BiasAnnotation {
  return {
    id,
    lens,
    startIndex: -1,
    endIndex: -1,
    flaggedText,
    explanation: "reason",
    suggestion: "rewrite",
    counterBiasArgument: "counter point",
    confidence: 0.7,
  };
}

describe("attachPositions", () => {
  it("maps sequential matches for repeated phrases", () => {
    const text = "bad wording appears. bad wording appears again.";
    const annotations = [
      makeAnnotation("a1", "bad wording"),
      makeAnnotation("a2", "bad wording"),
    ];

    const result = attachPositions(annotations, text);

    expect(result).toHaveLength(2);
    expect(result[0].startIndex).toBe(0);
    expect(result[0].endIndex).toBe(11);
    expect(result[1].startIndex).toBe(21);
    expect(result[1].endIndex).toBe(32);
  });

  it("matches case-insensitively when needed", () => {
    const text = "The narrative used Loaded Words in key places.";
    const annotations = [makeAnnotation("a1", "loaded words")];

    const result = attachPositions(annotations, text);

    expect(result).toHaveLength(1);
    expect(result[0].startIndex).toBe(19);
    expect(result[0].endIndex).toBe(31);
  });

  it("drops annotations with empty or missing phrases", () => {
    const text = "Simple sentence.";
    const annotations = [makeAnnotation("a1", ""), makeAnnotation("a2", "not found")];

    const result = attachPositions(annotations, text);

    expect(result).toHaveLength(0);
  });
});

describe("splitTextIntoSegments", () => {
  it("returns a single plain segment when no valid annotations exist", () => {
    const text = "No highlights here.";

    const result = splitTextIntoSegments(text, []);

    expect(result).toEqual([{ text: "No highlights here.", annotation: null }]);
  });

  it("splits text into plain and annotated segments in order", () => {
    const text = "A red flag appears. Another issue appears.";
    const ann1 = { ...makeAnnotation("a1", "red flag", "political_framing"), startIndex: 2, endIndex: 10 };
    const ann2 = {
      ...makeAnnotation("a2", "issue", "logical_fallacy"),
      startIndex: 28,
      endIndex: 33,
    };

    const result = splitTextIntoSegments(text, [ann2, ann1]);

    expect(result.map((segment) => segment.text)).toEqual([
      "A ",
      "red flag",
      " appears. Another ",
      "issue",
      " appears.",
    ]);
    expect(result[1].annotation?.id).toBe("a1");
    expect(result[3].annotation?.id).toBe("a2");
  });

  it("skips overlapping annotations to avoid broken nesting", () => {
    const text = "Overlapping phrase sample";
    const first = { ...makeAnnotation("a1", "Overlapping"), startIndex: 0, endIndex: 11 };
    const overlap = { ...makeAnnotation("a2", "lapping phrase"), startIndex: 4, endIndex: 17 };

    const result = splitTextIntoSegments(text, [first, overlap]);

    expect(result.map((segment) => segment.text)).toEqual(["Overlapping", " phrase sample"]);
    expect(result.filter((segment) => segment.annotation)).toHaveLength(1);
  });
});
