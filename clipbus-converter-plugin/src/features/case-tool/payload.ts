/** Split arbitrary text into lowercase words for naming-style conversions. */
export function splitWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function toUppercase(text: string): string {
  return text.toUpperCase();
}

export function toLowercase(text: string): string {
  return text.toLowerCase();
}

export function toCamel(text: string): string {
  return splitWords(text)
    .map((word, index) => (index === 0 ? word : capitalize(word)))
    .join("");
}

export function toPascal(text: string): string {
  return splitWords(text).map(capitalize).join("");
}

export function toSnake(text: string): string {
  return splitWords(text).join("_");
}

export function toConstant(text: string): string {
  return toSnake(text).toUpperCase();
}

export function toKebab(text: string): string {
  return splitWords(text).join("-");
}

export function toTitle(text: string): string {
  return splitWords(text).map(capitalize).join(" ");
}

export function toSentence(text: string): string {
  const words = splitWords(text);
  if (words.length === 0) return "";
  return [capitalize(words[0]), ...words.slice(1)].join(" ");
}

export function toDot(text: string): string {
  return splitWords(text).join(".");
}
