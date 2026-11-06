import manifest from "../../../manifest.json";
import samples from "./samples.json";
import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

export const attachmentScenarios: PreviewScenario[] = samples.map(sample => {
  const declared = manifest.renderers.find(renderer => renderer.id === sample.view)!;
  const reference = { type: declared.attachmentType, key: "primary", updatedAt: 1, own: true };
  return {
    id: sample.id, label: sample.label, view: sample.view,
    plugin: { id: manifest.plugin.id, version: manifest.plugin.version },
    item: {
      id: `item-${sample.id}`, kind: "text", tags: ["toolbox"],
      sourceApp: "com.preview.editor", pinned: false,
      createdAt: 1, lastCopiedAt: 1, attachments: [reference],
    },
    attachment: { ...reference, payload: sample.payload, ...(sample.card ? { card: sample.card } : {}) },
    renderer: { title: declared.title, tint: declared.tint, buttons: declared.buttons },
    height: declared.height,
  };
});
