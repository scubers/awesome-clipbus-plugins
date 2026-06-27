import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildMarkdownArtifact } from "./payload.ts";

export function createMarkdownDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildMarkdownArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
