import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildDiffArtifact } from "./payload.ts";

export function createDiffDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildDiffArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
