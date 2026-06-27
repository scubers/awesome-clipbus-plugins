// payload.ts — UI-safe single source of truth for the radix preview attachment.
// NO `import … from "node:*"` here: this file is imported by app.vue (browser) too.
// BigInt is used for arbitrary-precision integer parsing and conversion.

import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

const ATTACHMENT_TYPE = "plugin.radix.number";

export type InputBase = "dec" | "hex" | "bin" | "oct";

export interface RadixPayload {
  kind: "radix_preview";
  version: 1;
  inputBase: InputBase;
  decimal: string;
  hex: string;
  octal: string;
  binary: string;
  bits: number;
  asciiChar: string | null;
  isNegative: boolean;
}

// Only accept whole-integer literals; decimal floats and bare letters are rejected.
const DEC_RE = /^-?\d+$/;
const HEX_RE = /^0x[0-9a-fA-F]+$/;
const BIN_RE = /^0b[01]+$/;
const OCT_RE = /^0o[0-7]+$/;

function parseInput(raw: string): { value: bigint; inputBase: InputBase } | null {
  try {
    if (DEC_RE.test(raw)) return { value: BigInt(raw), inputBase: "dec" };
    if (HEX_RE.test(raw)) return { value: BigInt(raw), inputBase: "hex" };
    if (BIN_RE.test(raw)) return { value: BigInt(raw), inputBase: "bin" };
    if (OCT_RE.test(raw)) return { value: BigInt(raw), inputBase: "oct" };
  } catch {
    return null;
  }
  return null;
}

export function createRadixPayload(input: unknown): RadixPayload | null {
  const content = (input as { content?: { kind?: string; text?: string } } | null)?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const raw = content.text.trim();
  if (!raw) return null;

  const parsed = parseInput(raw);
  if (!parsed) return null;

  const { value, inputBase } = parsed;
  const isNegative = value < 0n;
  const abs = isNegative ? -value : value;

  // JSON cannot serialise BigInt, so all numeric representations are stored as strings.
  const decimal = value.toString(10);
  const hex = "0x" + abs.toString(16);
  const octal = "0o" + abs.toString(8);
  const binary = "0b" + abs.toString(2);
  // Bit count: number of binary digits in the absolute value (zero counts as 1 bit).
  const bits = abs === 0n ? 1 : abs.toString(2).length;

  // ASCII char for printable range 32–126 only.
  let asciiChar: string | null = null;
  if (!isNegative && value >= 32n && value <= 126n) {
    asciiChar = String.fromCharCode(Number(value));
  }

  return {
    kind: "radix_preview",
    version: 1,
    inputBase,
    decimal,
    hex,
    octal,
    binary,
    bits,
    asciiChar,
    isNegative,
  };
}

export function decodeRadixPayload(payloadJson: string | null | undefined): RadixPayload | null {
  try {
    const parsed = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (parsed.kind !== "radix_preview") return null;
    return parsed as RadixPayload;
  } catch {
    return null;
  }
}

export function buildRadixArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createRadixPayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "radix",
      searchText: `${payload.decimal} ${payload.hex} ${payload.binary}`.slice(0, 200),
      label: "进制转换",
    },
  };
}
