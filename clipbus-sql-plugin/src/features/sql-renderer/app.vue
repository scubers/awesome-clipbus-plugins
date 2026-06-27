<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeSqlPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeSqlPayload(attachmentPayload.value?.attachment?.payloadJson)
);

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 140, max: 460 });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy", title: "复制格式化 SQL" }],
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
        <span class="badge">{{ payload.statementType }}</span>
        <span class="label-sql">SQL</span>
      </div>

      <div class="code-block">
        <div class="code-label">格式化 SQL</div>
        <pre class="code-text">{{ payload.formatted }}</pre>
      </div>
    </section>
    <div v-else class="empty">等待 SQL 内容</div>
  </main>
</template>

<style scoped>
.shell {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 13px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: var(--clipbus-accent, #0369a1);
  color: var(--clipbus-accent-contrast, #ffffff);
}

.label-sql {
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 600;
  background: var(--clipbus-surface-elevated, #f1f5f9);
  color: var(--clipbus-text-secondary, #64748b);
  border: 1px solid var(--clipbus-border, #e2e8f0);
}

.code-block {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-x: auto;
}

.code-label {
  font-size: 10px;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.code-text {
  margin: 0;
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre;
  color: var(--clipbus-text-primary, #0f172a);
  max-height: 320px;
  overflow-y: auto;
  overflow-x: auto;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
