import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildImageInfoArtifact } from "./payload.ts";

export function createImageInfoDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildImageInfoArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
