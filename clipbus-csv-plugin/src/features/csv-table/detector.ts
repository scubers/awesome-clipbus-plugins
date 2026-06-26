import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildCsvArtifact } from "./payload.ts";

export function createCsvDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildCsvArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
