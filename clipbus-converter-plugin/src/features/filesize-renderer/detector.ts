import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildFilesizeArtifact } from "./payload.ts";

export function createFilesizeDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildFilesizeArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
