import { PLUGIN_WRITE_LIMITS } from "@clipbus/plugin-sdk";

/** Optional decoded-text indexes are bounded by UTF-8 bytes, without splitting a code point. */
export function searchSnippet(text: string): string {
  let bytes = 0;
  let snippet = "";
  for (const char of text) {
    bytes += Buffer.byteLength(char);
    if (bytes > PLUGIN_WRITE_LIMITS.maximumSearchTextBytes) break;
    snippet += char;
  }
  return snippet;
}
