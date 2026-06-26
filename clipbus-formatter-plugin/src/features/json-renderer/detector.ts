import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildJsonArtifact } from "./payload.ts";

export function createJsonDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildJsonArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
