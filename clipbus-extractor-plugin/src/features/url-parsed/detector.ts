import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildUrlArtifact } from "./payload.ts";

export function createUrlDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildUrlArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
