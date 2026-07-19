export function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

export function urlDecode(text: string): string | null {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
}

const HTML_ENCODE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const HTML_DECODE_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

export function htmlEncode(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ENCODE_MAP[char] ?? char);
}

export function htmlDecode(text: string): string {
  return text.replace(
    /&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z]+));/g,
    (match, decimal, hex, named) => {
      if (named) return HTML_DECODE_MAP[`&${named};`] ?? match;
      const codePoint = parseInt(decimal ?? hex, decimal ? 10 : 16);
      return Number.isInteger(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    },
  );
}

export function base64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function base64Decode(text: string): string | null {
  try {
    const binary = atob(text);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function unicodeEncode(text: string): string {
  const result: string[] = [];
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint > 0xffff) {
      const high = 0xd800 + ((codePoint - 0x10000) >> 10);
      const low = 0xdc00 + ((codePoint - 0x10000) & 0x3ff);
      result.push(`\\u${high.toString(16).toUpperCase().padStart(4, "0")}`);
      result.push(`\\u${low.toString(16).toUpperCase().padStart(4, "0")}`);
    } else {
      result.push(`\\u${codePoint.toString(16).toUpperCase().padStart(4, "0")}`);
    }
  }
  return result.join("");
}

export function unicodeDecode(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

export function jsonEncode(text: string): string {
  return JSON.stringify(text).slice(1, -1);
}

export function jsonDecode(text: string): string | null {
  try {
    const decoded: unknown = JSON.parse(`"${text}"`);
    return typeof decoded === "string" ? decoded : null;
  } catch {
    return null;
  }
}
