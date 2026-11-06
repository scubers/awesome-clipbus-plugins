const YAML_KEYWORD_RE = /^(true|false|yes|no|on|off|null|~)$/i;
const YAML_NUM_RE =
  /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$|^0x[0-9a-fA-F]+$/i;
// Characters that are unsafe as the very first character of a plain scalar
const YAML_BAD_FIRST_CHARS = '!&*?|>%@`"\'#,[]{}';

function isYamlPlainSafe(s: string): boolean {
  if (s.length === 0) return false;
  if (s !== s.trim()) return false;
  if (YAML_KEYWORD_RE.test(s)) return false;
  if (YAML_NUM_RE.test(s)) return false;
  if (s.includes(": ")) return false;
  if (s.includes(" #")) return false;
  if (s.includes("\t") || s.includes("\n") || s.includes("\r")) return false;
  if (YAML_BAD_FIRST_CHARS.includes(s[0])) return false;
  if (s.startsWith("- ") || s.startsWith("? ")) return false;
  return true;
}

/** Emit a YAML scalar string — plain when safe, double-quoted otherwise. */
function yamlStr(s: string): string {
  return isYamlPlainSafe(s) ? s : JSON.stringify(s);
}

function isScalar(v: unknown): v is null | boolean | number | string {
  return (
    v === null ||
    typeof v === "boolean" ||
    typeof v === "number" ||
    typeof v === "string"
  );
}

function renderScalar(v: null | boolean | number | string): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return yamlStr(v);
}

function renderYamlBlock(value: unknown, level: number): string[] {
  const prefix = "  ".repeat(level);

  if (isScalar(value)) return [renderScalar(value)];

  if (Array.isArray(value)) {
    if (value.length === 0) return ["[]"];
    const out: string[] = [];
    for (const item of value) {
      appendSeqItem(out, item, level, prefix);
    }
    return out;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return ["{}"];
  const out: string[] = [];
  for (const [k, v] of entries) {
    appendMapEntry(out, k, v, level, prefix);
  }
  return out;
}

function appendMapEntry(
  out: string[],
  k: string,
  v: unknown,
  level: number,
  prefix: string,
): void {
  const sk = yamlStr(k);
  if (isScalar(v)) {
    out.push(`${prefix}${sk}: ${renderScalar(v)}`);
  } else if (Array.isArray(v)) {
    if (v.length === 0) {
      out.push(`${prefix}${sk}: []`);
    } else {
      out.push(`${prefix}${sk}:`);
      out.push(...renderYamlBlock(v, level + 1));
    }
  } else {
    const ov = v as Record<string, unknown>;
    if (Object.keys(ov).length === 0) {
      out.push(`${prefix}${sk}: {}`);
    } else {
      out.push(`${prefix}${sk}:`);
      out.push(...renderYamlBlock(v, level + 1));
    }
  }
}

function appendSeqItem(
  out: string[],
  item: unknown,
  level: number,
  prefix: string,
): void {
  if (isScalar(item)) {
    out.push(`${prefix}- ${renderScalar(item)}`);
    return;
  }
  if (Array.isArray(item)) {
    if (item.length === 0) {
      out.push(`${prefix}- []`);
    } else {
      // nested array: block form under `-`
      out.push(`${prefix}-`);
      out.push(...renderYamlBlock(item, level + 1));
    }
    return;
  }
  // object item — compact sequence notation (first key inline with `- `)
  const entries = Object.entries(item as Record<string, unknown>);
  if (entries.length === 0) {
    out.push(`${prefix}- {}`);
    return;
  }
  const [fk, fv] = entries[0];
  const sfk = yamlStr(fk);
  if (isScalar(fv)) {
    out.push(`${prefix}- ${sfk}: ${renderScalar(fv)}`);
  } else if (Array.isArray(fv) && fv.length === 0) {
    out.push(`${prefix}- ${sfk}: []`);
  } else if (
    !Array.isArray(fv) &&
    Object.keys(fv as Record<string, unknown>).length === 0
  ) {
    out.push(`${prefix}- ${sfk}: {}`);
  } else {
    out.push(`${prefix}- ${sfk}:`);
    out.push(...renderYamlBlock(fv, level + 2));
  }
  // Remaining entries: aligned with the first key (prefix + two spaces)
  const innerPrefix = prefix + "  ";
  for (const [k, v] of entries.slice(1)) {
    appendMapEntry(out, k, v, level + 1, innerPrefix);
  }
}

/** Serialize an already-parsed JSON value (object/array/scalar) to YAML text. */
export function jsonToYaml(value: unknown): string {
  return renderYamlBlock(value, 0).join("\n");
}
