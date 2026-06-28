import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildVibeArtifact } from "./payload.ts";

export function createVibeDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const a = buildVibeArtifact(input);
      return a ? [a] : [];
    },
  };
}
