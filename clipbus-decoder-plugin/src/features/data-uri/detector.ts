import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildDataUriArtifact } from "./payload.ts";

export function createDataUriDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildDataUriArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
