// payload.ts — UI-safe pure lorem ipsum logic for the lorem-tool draft action.
// NO node:* imports — this file is imported by both app.vue (browser) and action.ts (runtime).

export type LoremUnit = "paragraphs" | "sentences" | "words";

export interface LoremDraft {
  unit: LoremUnit;
  count: number;
  startWithLorem: boolean;
  result: string;
}

export const INITIAL_DRAFT: LoremDraft = {
  unit: "paragraphs",
  count: 3,
  startWithLorem: true,
  result: "",
};

// Classic latin word pool for lorem ipsum generation.
const WORD_POOL = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "reprehenderit", "voluptate", "velit",
  "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat",
  "cupidatat", "non", "proident", "culpa", "qui", "officia", "deserunt", "mollit",
  "anim", "id", "est", "laborum",
];

// Canonical opening words for the "start with Lorem ipsum" prefix (no punctuation).
const LOREM_PREFIX_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
];

// Full canonical opening sentence with comma after "amet".
const LOREM_CANONICAL_SENTENCE = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

/** Clamp a count value to the allowed range 1–50. */
export function clampCount(n: number): number {
  return Math.max(1, Math.min(50, n));
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomWord(): string {
  return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateSentence(wordCount: number): string {
  const words = Array.from({ length: wordCount }, () => randomWord());
  return capitalize(words.join(" ")) + ".";
}

/**
 * Generate lorem ipsum text of the given unit and count.
 * When startWithLorem is true the output begins with the canonical phrase.
 * count is clamped to 1–50 inside this function.
 *
 * Words mode: N words joined by spaces, first word capitalized, trailing period.
 * Sentences mode: N sentences (6–14 words each), joined with spaces.
 * Paragraphs mode: N paragraphs (3–6 sentences each), joined with "\n\n".
 */
export function generateLorem(
  unit: LoremUnit,
  count: number,
  startWithLorem: boolean,
): string {
  const n = clampCount(count);

  if (unit === "words") {
    let words: string[];
    if (startWithLorem) {
      const prefix = LOREM_PREFIX_WORDS.slice(0, n);
      const extra =
        n > LOREM_PREFIX_WORDS.length
          ? Array.from({ length: n - LOREM_PREFIX_WORDS.length }, () => randomWord())
          : [];
      words = [...prefix, ...extra];
    } else {
      words = Array.from({ length: n }, () => randomWord());
    }
    return capitalize(words.join(" ")) + ".";
  }

  if (unit === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < n; i++) {
      if (i === 0 && startWithLorem) {
        sentences.push(LOREM_CANONICAL_SENTENCE);
      } else {
        sentences.push(generateSentence(randomInt(6, 14)));
      }
    }
    return sentences.join(" ");
  }

  // paragraphs
  const paragraphs: string[] = [];
  for (let p = 0; p < n; p++) {
    const sentCount = randomInt(3, 6);
    const sentences: string[] = [];
    for (let s = 0; s < sentCount; s++) {
      if (p === 0 && s === 0 && startWithLorem) {
        sentences.push(LOREM_CANONICAL_SENTENCE);
      } else {
        sentences.push(generateSentence(randomInt(6, 14)));
      }
    }
    paragraphs.push(sentences.join(" "));
  }
  return paragraphs.join("\n\n");
}
