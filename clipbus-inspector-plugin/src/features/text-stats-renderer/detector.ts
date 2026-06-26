import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildTextStatsArtifact } from "./builder.ts";

export function createTextStatsDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildTextStatsArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
