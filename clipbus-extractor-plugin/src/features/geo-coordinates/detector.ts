import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildGeoArtifact } from "./payload.ts";

export function createGeoDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildGeoArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
