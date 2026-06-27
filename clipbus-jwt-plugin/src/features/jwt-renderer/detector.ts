import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildJwtArtifact } from "./payload.ts";

export function createJwtDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildJwtArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
