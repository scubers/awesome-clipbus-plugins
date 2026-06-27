import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildXmlArtifact } from "./payload.ts";

export function createXmlDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildXmlArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
