import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildUuidArtifact } from "./payload.ts";

export function createUuidDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildUuidArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
