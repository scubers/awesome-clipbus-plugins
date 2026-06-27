import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildQueryArtifact } from "./payload.ts";

export function createQueryDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildQueryArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
