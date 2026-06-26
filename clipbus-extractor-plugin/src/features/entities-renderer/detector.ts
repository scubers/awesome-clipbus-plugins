import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildEntitiesArtifact } from "./payload.ts";

export function createEntitiesDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildEntitiesArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
