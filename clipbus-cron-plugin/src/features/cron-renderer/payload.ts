// payload.ts — UI-safe single source of truth for the Cron preview attachment.
// NO `import … from "node:*"` here: this file is imported by app.vue (browser) too.

import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

const ATTACHMENT_TYPE = "plugin.cron.schedule";

export interface CronField {
  name: string;
  raw: string;
  description: string;
}

export interface CronPayload {
  kind: "cron_preview";
  version: 1;
  expression: string;
  fields: CronField[];
  summary: string;
}

// Field definitions for validation
const FIELD_DEFS = [
  { name: "Minute",  min: 0,  max: 59,  names: undefined as string[] | undefined },
  { name: "Hour",    min: 0,  max: 23,  names: undefined as string[] | undefined },
  { name: "Day",     min: 1,  max: 31,  names: undefined as string[] | undefined },
  { name: "Month",   min: 1,  max: 12,  names: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"] },
  { name: "Weekday", min: 0,  max: 7,   names: ["SUN","MON","TUE","WED","THU","FRI","SAT"] },
];

const WEEKDAY_NAMES_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const WEEKDAY_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

function validateSingleValue(token: string, min: number, max: number, names?: string[]): boolean {
  if (names && names.includes(token.toUpperCase())) return true;
  if (!/^\d+$/.test(token)) return false;
  const n = parseInt(token, 10);
  return n >= min && n <= max;
}

function validateToken(token: string, min: number, max: number, names?: string[]): boolean {
  if (token === "*") return true;

  // Step: */n  or  value/n  or  range/n
  const slashIdx = token.indexOf("/");
  if (slashIdx >= 0) {
    const base    = token.slice(0, slashIdx);
    const stepStr = token.slice(slashIdx + 1);
    if (!/^\d+$/.test(stepStr)) return false;
    const step = parseInt(stepStr, 10);
    if (step < 1) return false;
    if (base === "*") return true;
    return validateToken(base, min, max, names);
  }

  // List: a,b,c
  if (token.includes(",")) {
    return token.split(",").every((t) => validateToken(t, min, max, names));
  }

  // Range: a-b  (dash must not be at position 0 to avoid confusing negative numbers)
  const dashIdx = token.indexOf("-");
  if (dashIdx > 0) {
    const a = token.slice(0, dashIdx);
    const b = token.slice(dashIdx + 1);
    return validateSingleValue(a, min, max, names) && validateSingleValue(b, min, max, names);
  }

  return validateSingleValue(token, min, max, names);
}

// Guard: at least one field must contain a cron special character (* / , -)
function hasSpecialChars(token: string): boolean {
  return /[*/,-]/.test(token);
}

function resolveWeekday(token: string): number | null {
  const upper = token.toUpperCase();
  if (upper in WEEKDAY_MAP) return WEEKDAY_MAP[upper]!;
  if (/^\d+$/.test(token)) {
    const n = parseInt(token, 10);
    if (n >= 0 && n <= 7) return n % 7;
  }
  return null;
}

const MONTH_NAMES_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_MAP_EN: Record<string, string> = {
  JAN:"Jan", FEB:"Feb", MAR:"Mar", APR:"Apr", MAY:"May", JUN:"Jun",
  JUL:"Jul", AUG:"Aug", SEP:"Sep", OCT:"Oct", NOV:"Nov", DEC:"Dec",
};

function describeValue(token: string, fieldIdx: number): string {
  const upper = token.toUpperCase();
  if (fieldIdx === 4) {
    const wn = resolveWeekday(token);
    if (wn !== null) return WEEKDAY_NAMES_EN[wn] ?? token;
  }
  if (fieldIdx === 3) {
    if (upper in MONTH_MAP_EN) return MONTH_MAP_EN[upper]!;
    if (/^\d+$/.test(token)) {
      const n = parseInt(token, 10);
      if (n >= 1 && n <= 12) return MONTH_NAMES_EN[n - 1]!;
    }
  }
  const UNIT_NAMES = ["minute", "hour", "day", "month", "weekday"];
  return `${UNIT_NAMES[fieldIdx] ?? ""} ${token}`;
}

function describeToken(token: string, fieldIdx: number, unitName: string): string {
  if (token === "*") return `every ${unitName}`;

  // Step
  const slashIdx = token.indexOf("/");
  if (slashIdx >= 0) {
    const base = token.slice(0, slashIdx);
    const step = token.slice(slashIdx + 1);
    if (base === "*") return `every ${step} ${unitName}s`;
    return `every ${step} ${unitName}s from ${describeValue(base, fieldIdx)}`;
  }

  // List
  if (token.includes(",")) {
    return token.split(",").map((t) => describeValue(t, fieldIdx)).join(", ");
  }

  // Range
  const dashIdx = token.indexOf("-");
  if (dashIdx > 0) {
    const a = token.slice(0, dashIdx);
    const b = token.slice(dashIdx + 1);
    if (fieldIdx === 4) {
      const aNum = resolveWeekday(a);
      const bNum = resolveWeekday(b);
      if (aNum !== null && bNum !== null) {
        return `${WEEKDAY_NAMES_EN[aNum] ?? a} through ${WEEKDAY_NAMES_EN[bNum] ?? b}`;
      }
    }
    return `${describeValue(a, fieldIdx)} through ${describeValue(b, fieldIdx)}`;
  }

  return describeValue(token, fieldIdx);
}

function buildSummary(fields: CronField[]): string {
  const [minField, hourField, dayField, monthField, weekdayField] = fields as [
    CronField, CronField, CronField, CronField, CronField,
  ];
  const parts: string[] = [];

  if (monthField.raw !== "*")   parts.push(monthField.description);
  if (weekdayField.raw !== "*") parts.push(weekdayField.description);
  if (dayField.raw !== "*")     parts.push(`on the ${dayField.description} of the month`);

  if (hourField.raw === "*" && minField.raw === "*") {
    parts.push("every minute");
  } else if (hourField.raw === "*") {
    parts.push(minField.description);
  } else if (minField.raw === "0" || minField.raw === "00") {
    parts.push(`${hourField.description} on the hour`);
  } else {
    parts.push(`${hourField.description} ${minField.description}`);
  }

  return parts.join(", ");
}

export function createCronPayload(input: unknown): CronPayload | null {
  const content = (input as { content?: { kind?: string; text?: string } } | null)?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const raw    = content.text.trim();
  const tokens = raw.split(/\s+/);
  if (tokens.length !== 5) return null;

  // Guard: at least one field must carry a cron special character
  if (!tokens.some(hasSpecialChars)) return null;

  // Validate each token against its field's domain
  for (let i = 0; i < 5; i++) {
    const def = FIELD_DEFS[i]!;
    if (!validateToken(tokens[i]!, def.min, def.max, def.names)) return null;
  }

  const UNIT_NAMES = ["minute", "hour", "day", "month", "weekday"];
  const fields: CronField[] = tokens.map((token, i) => ({
    name:        FIELD_DEFS[i]!.name,
    raw:         token,
    description: describeToken(token, i, UNIT_NAMES[i]!),
  }));

  return {
    kind:       "cron_preview",
    version:    1,
    expression: raw,
    fields,
    summary:    buildSummary(fields),
  };
}

export function decodeCronPayload(payloadJson: string | null | undefined): CronPayload | null {
  try {
    const parsed = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (parsed.kind !== "cron_preview") return null;
    return parsed as CronPayload;
  } catch {
    return null;
  }
}

export function buildCronArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createCronPayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey:  "primary",
    payloadJson:    JSON.stringify(payload),
    searchProjection: {
      scope:      "cron",
      searchText: `${payload.expression} ${payload.summary}`,
      label:      "Cron",
    },
  };
}
