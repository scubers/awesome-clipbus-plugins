import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildDurationArtifact } from "./payload.ts";

export function createDurationDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildDurationArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
