import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildCronArtifact } from "./payload.ts";

export function createCronDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildCronArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
