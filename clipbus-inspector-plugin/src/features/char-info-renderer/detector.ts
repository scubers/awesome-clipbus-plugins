import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildCharArtifact } from "./payload.ts";

export function createCharInfoDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildCharArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
