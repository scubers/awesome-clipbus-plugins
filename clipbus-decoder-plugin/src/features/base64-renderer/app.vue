<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeBase64Payload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeBase64Payload(attachmentPayload.value?.attachment?.payloadJson)
);

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 120, max: 320 });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy", title: "复制解码结果" }],
    });
  } catch {
    /* not in attachment renderer context */
  }

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy" && payload.value) {
      await clipbus.clipboard.copyText({ text: payload.value.decoded });
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
        <span class="badge">{{ payload.encoding === "url-safe" ? "Base64 URL-safe" : "Base64" }}</span>
        <span class="char-count">{{ payload.originalLength }} → {{ payload.decodedLength }} 字符</span>
      </div>
      <div class="decoded-block">
        <div class="decoded-label">解码结果</div>
        <pre class="decoded-text">{{ payload.decoded }}</pre>
      </div>
    </section>
    <div v-else class="empty">等待 Base64 内容</div>
  </main>
</template>

<style scoped>
.shell {
  padding: 12px 16px;
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
  background: var(--clipbus-accent, #0f766e);
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

.decoded-block {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.decoded-label {
  font-size: 11px;
  color: var(--clipbus-text-secondary, #64748b);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.decoded-text {
  margin: 0;
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--clipbus-text-primary, #0f172a);
  max-height: 220px;
  overflow-y: auto;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
