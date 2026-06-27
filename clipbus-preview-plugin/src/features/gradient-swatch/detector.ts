import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildGradientArtifact } from "./payload.ts";

export function createGradientDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildGradientArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
