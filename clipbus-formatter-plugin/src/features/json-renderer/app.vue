<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeJsonPayload } from "./payload";

// autoFit must observe this renderer's own root (content-sized), not document.body —
// in the preview workbench document.body is the whole page, so without a target autoFit
// never converges and spams setHeight every frame.
const rootEl = ref<HTMLElement | null>(null);

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeJsonPayload(attachmentPayload.value?.attachment?.payloadJson),
);

type ViewMode = "json" | "yaml";
const activeView = ref<ViewMode>("json");

const displayText = computed(() =>
  activeView.value === "yaml"
    ? (payload.value?.yaml ?? "")
    : (payload.value?.formatted ?? ""),
);

const codeLabel = computed(() =>
  activeView.value === "yaml" ? "YAML Output" : "Formatted Result",
);

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

async function syncCopyButton(): Promise<void> {
  try {
    const title = activeView.value === "yaml" ? "Copy YAML" : "Copy JSON";
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy", title }],
    });
  } catch {
    /* not in attachment renderer context */
  }
}

onMounted(async () => {
  stopAutoFit = autoFit({ min: 160, max: 480, target: rootEl.value ?? undefined });

  await syncCopyButton();

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy" && payload.value) {
      const text =
        activeView.value === "yaml"
          ? payload.value.yaml
          : payload.value.formatted;
      await clipbus.clipboard.copyText({ text });
    }
  });
});

watch(activeView, syncCopyButton);

onUnmounted(() => {
  unsub?.();
  stopAutoFit?.();
});
</script>

<template>
  <main ref="rootEl" class="shell">
    <section v-if="payload" class="content">
      <div class="meta-row">
        <span class="badge">{{ payload.display.typeLabel }}</span>
        <span class="char-count">{{ payload.display.subheadline }}</span>
      </div>
      <div class="view-toggle">
        <button
          :class="['toggle-btn', { active: activeView === 'json' }]"
          @click="activeView = 'json'"
        >JSON</button>
        <button
          :class="['toggle-btn', { active: activeView === 'yaml' }]"
          @click="activeView = 'yaml'"
        >YAML</button>
      </div>
      <div class="code-block">
        <div class="code-label">{{ codeLabel }}</div>
        <pre class="code-text">{{ displayText }}</pre>
      </div>
    </section>
    <div v-else class="empty">Waiting for JSON content</div>
  </main>
</template>

<style scoped>
.shell {
  /* 复用 native 卡片自身 padding，根容器不再叠加内距，避免双层内距 */
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 13px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background: var(--clipbus-accent, #7c3aed);
  color: var(--clipbus-accent-contrast, #ffffff);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.char-count {
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 11px;
}

.view-toggle {
  display: flex;
  gap: 2px;
  background: var(--clipbus-surface-elevated, #f1f5f9);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 2px;
  align-self: flex-start;
}

.toggle-btn {
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--clipbus-text-secondary, #64748b);
  cursor: pointer;
  line-height: 1.5;
}

.toggle-btn.active {
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
}

.code-block {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.code-label {
  font-size: 11px;
  color: var(--clipbus-text-secondary, #64748b);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.code-text {
  margin: 0;
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--clipbus-text-primary, #0f172a);
  max-height: 360px;
  overflow-y: auto;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
