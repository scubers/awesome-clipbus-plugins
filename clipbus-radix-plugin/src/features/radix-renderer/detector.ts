import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildRadixArtifact } from "./payload.ts";

export function createRadixDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildRadixArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
