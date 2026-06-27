import type {
  PluginDetectorHandler,
  PluginDetectorInput,
  PluginDetectorArtifact,
} from "@clipbus/plugin-sdk/runtime";
import { buildSqlArtifact } from "./payload.ts";

export function createSqlDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const artifact = buildSqlArtifact(input);
      return artifact ? [artifact] : [];
    },
  };
}
