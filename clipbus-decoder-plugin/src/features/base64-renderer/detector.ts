import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildBase64Artifact } from "./payload.ts";

export function createBase64Detector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildBase64Artifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
