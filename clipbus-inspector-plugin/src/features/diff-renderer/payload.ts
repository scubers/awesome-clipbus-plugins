// payload.ts — UI-safe single source of truth for the unified diff preview attachment.
// NO `import … from "node:*"` here: this file is imported by app.vue (browser) too.

import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

const ATTACHMENT_TYPE = "plugin.diff.unified";

export type DiffLineType = "add" | "del" | "ctx" | "hunk" | "meta";

export interface DiffLine {
  type: DiffLineType;
  text: string;
}

export interface DiffPayload {
  kind: "diff_preview";
  version: 1;
  lines: DiffLine[];
  additions: number;
  deletions: number;
  files: number;
}

const MAX_LINES = 400;

function classifyLine(line: string): DiffLineType {
  if (line.startsWith("@@")) return "hunk";
  if (
    line.startsWith("--- ") ||
    line.startsWith("+++ ") ||
    line.startsWith("diff --git") ||
    line.startsWith("index ")
  )
    return "meta";
  if (line.startsWith("+") && !line.startsWith("+++")) return "add";
  if (line.startsWith("-") && !line.startsWith("---")) return "del";
  return "ctx";
}

function isDiffText(text: string): boolean {
  const hasHunkHeader = /@@[^@]*@@/.test(text);
  const hasFileHeaders = text.includes("--- ") && text.includes("+++ ");
  const hasGitDiff = text.includes("diff --git");

  if (!hasHunkHeader && !hasFileHeaders && !hasGitDiff) return false;

  // Require at least 2 actual change lines (not the +++ / --- file header lines).
  const lines = text.split("\n");
  let changeLines = 0;
  for (const line of lines) {
    if (
      (line.startsWith("+") && !line.startsWith("+++")) ||
      (line.startsWith("-") && !line.startsWith("---"))
    ) {
      changeLines++;
    }
  }
  return changeLines >= 2;
}

export function createDiffPayload(input: unknown): DiffPayload | null {
  const content = (input as { content?: { kind?: string; text?: string } } | null)?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const text = content.text;
  if (!isDiffText(text)) return null;

  const allLines = text.split("\n");
  const truncated = allLines.slice(0, MAX_LINES);

  let additions = 0;
  let deletions = 0;
  let files = 0;
  const lines: DiffLine[] = [];

  for (const raw of truncated) {
    const type = classifyLine(raw);
    lines.push({ type, text: raw });
    if (type === "add") additions++;
    if (type === "del") deletions++;
    // Count each file by its +++ marker (appears once per file in any unified diff format).
    if (raw.startsWith("+++ ")) files++;
  }

  return {
    kind: "diff_preview",
    version: 1,
    lines,
    additions,
    deletions,
    files,
  };
}

export function decodeDiffPayload(payloadJson: string | null | undefined): DiffPayload | null {
  try {
    const parsed = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (parsed.kind !== "diff_preview") return null;
    return parsed as DiffPayload;
  } catch {
    return null;
  }
}

export function buildDiffArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createDiffPayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "diff",
      searchText: `+${payload.additions} -${payload.deletions} ${payload.files} file${payload.files !== 1 ? "s" : ""}`,
      label: "Diff",
    },
  };
}
