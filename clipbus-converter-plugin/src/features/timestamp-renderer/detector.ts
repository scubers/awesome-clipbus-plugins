import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildTimestampArtifact } from "./payload.ts";

export function createTimestampDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildTimestampArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
