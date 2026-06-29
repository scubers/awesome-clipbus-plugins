import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildChmodArtifact } from "./payload.ts";

export function createChmodDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildChmodArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
