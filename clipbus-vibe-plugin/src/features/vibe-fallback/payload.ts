import type { PluginDetectorArtifact, PluginDetectorInput } from "@clipbus/plugin-sdk/runtime";

export const ATTACHMENT_TYPE = "plugin.vibe.fallback";
const MAX_TEXT = 280;

export interface VibePayload {
  kind: "vibe_fallback";
  version: 1;
  text: string;       // 截断的文本样本（粒子字形采样用）
  charCount: number;  // 原始字符数（动画强度/seed 用）
}

export function decodeVibePayload(payloadJson: string | null | undefined): VibePayload | null {
  try {
    const p = JSON.parse(payloadJson || "{}");
    if (p.kind !== "vibe_fallback" || typeof p.text !== "string") return null;
    return p as VibePayload;
  } catch { return null; }
}

export function createVibePayload(input: PluginDetectorInput): VibePayload | null {
  if (input?.content?.kind !== "text") return null;
  const raw = (input.content as { kind: "text"; text: string }).text;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;       // 空文本不挂
  return { kind: "vibe_fallback", version: 1, text: trimmed.slice(0, MAX_TEXT), charCount: trimmed.length };
}

export function buildVibeArtifact(input: PluginDetectorInput): PluginDetectorArtifact | null {
  const payload = createVibePayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
  };
}
