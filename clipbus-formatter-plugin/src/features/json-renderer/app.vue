<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeJsonPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeJsonPayload(attachmentPayload.value?.attachment?.payloadJson)
);

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 160, max: 480 });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy", title: "Copy Formatted Result" }],
    });
  } catch {
    /* not in attachment renderer context */
  }

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy" && payload.value) {
      await clipbus.clipboard.copyText({ text: payload.value.formatted });
    }
  });
});

onUnmounted(() => {
  unsub?.();
  stopAutoFit?.();
});
</script>

<template>
  <main class="shell">
    <section v-if="payload" class="content">
      <div class="meta-row">
        <span class="badge">{{ payload.display.typeLabel }}</span>
        <span class="char-count">{{ payload.display.subheadline }}</span>
      </div>
      <div class="code-block">
        <div class="code-label">Formatted Result</div>
        <pre class="code-text">{{ payload.formatted }}</pre>
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
