// UI-safe: no node:* imports.
// Imported by both the runtime and the browser UI (app.vue).

import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

export const ATTACHMENT_TYPE = "plugin.inspector.image-info" as const;

export interface ImageInfoPayload {
  kind: "image_info";
  version: 1;
  format: string;
  width: number;
  height: number;
  orientation: "Landscape" | "Portrait" | "Square";
  aspectRatioReduced: string;
  aspectRatioDecimal: string;
  megapixels: number;
  fileSizeHuman: string;
  fileSizeBytes: number;
  commonLabel?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${parseFloat((bytes / (1024 * 1024)).toFixed(2))} MB`;
  }
  if (bytes >= 1024) {
    return `${parseFloat((bytes / 1024).toFixed(2))} KB`;
  }
  return `${bytes} B`;
}

const COMMON_RESOLUTIONS: Array<{ w: number; h: number; label: string }> = [
  { w: 3840, h: 2160, label: "4K UHD" },
  { w: 2560, h: 1440, label: "QHD 1440p" },
  { w: 1920, h: 1080, label: "Full HD 1080p" },
  { w: 1280, h: 720, label: "HD 720p" },
];

function getCommonLabel(width: number, height: number): string | undefined {
  for (const r of COMMON_RESOLUTIONS) {
    if (
      (r.w === width && r.h === height) ||
      (r.h === width && r.w === height)
    ) {
      return r.label;
    }
  }
  return undefined;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function createImageInfoPayload(input: unknown): ImageInfoPayload | null {
  const content = (
    input as {
      content?: {
        kind?: string;
        width?: number;
        height?: number;
        format?: string;
        bytes?: number;
      };
    } | null
  )?.content;

  if (content?.kind !== "image") return null;
  if (
    typeof content.width !== "number" ||
    typeof content.height !== "number" ||
    typeof content.bytes !== "number"
  )
    return null;
  if (content.width <= 0 || content.height <= 0) return null;

  const { width, height, bytes } = content;
  const format =
    typeof content.format === "string" ? content.format.toUpperCase() : "UNKNOWN";

  const orientation: ImageInfoPayload["orientation"] =
    width > height ? "Landscape" : height > width ? "Portrait" : "Square";

  const d = gcd(width, height);
  const aspectRatioReduced = `${width / d}:${height / d}`;
  const aspectRatioDecimal = `${(width / height).toFixed(2)}:1`;

  const megapixels = parseFloat(((width * height) / 1_000_000).toFixed(2));

  const fileSizeHuman = formatFileSize(bytes);

  const commonLabel = getCommonLabel(width, height);

  const payload: ImageInfoPayload = {
    kind: "image_info",
    version: 1,
    format,
    width,
    height,
    orientation,
    aspectRatioReduced,
    aspectRatioDecimal,
    megapixels,
    fileSizeHuman,
    fileSizeBytes: bytes,
    ...(commonLabel !== undefined ? { commonLabel } : {}),
  };

  return payload;
}

export function decodeImageInfoPayload(
  payloadJson: string | null | undefined
): ImageInfoPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "image_info") return null;
    return p as ImageInfoPayload;
  } catch {
    return null;
  }
}

export function buildImageInfoArtifact(
  input: unknown
): PluginDetectorArtifact | null {
  const payload = createImageInfoPayload(input);
  if (!payload) return null;

  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "inspector",
      searchText: `${payload.format} ${payload.width}x${payload.height} ${payload.megapixels}MP`,
      label: "Image Details",
    },
  };
}
