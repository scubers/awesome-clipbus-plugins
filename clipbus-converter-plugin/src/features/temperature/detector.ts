import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildTemperatureArtifact } from "./payload.ts";

export function createTemperatureDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildTemperatureArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
