import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildSecretArtifact } from "./payload.ts";

export function createSecretDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildSecretArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
