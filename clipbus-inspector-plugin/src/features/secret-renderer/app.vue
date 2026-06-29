<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeSecretPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeSecretPayload(attachmentPayload.value?.attachment?.payloadJson)
);

// autoFit must target this renderer's root, not document.body, to avoid
// infinite resize loops in the preview workbench.
const rootEl = ref<HTMLElement | null>(null);

let stopAutoFit: (() => void) | null = null;

onMounted(() => {
  stopAutoFit = autoFit({ min: 120, max: 360, target: rootEl.value ?? undefined });
});

onUnmounted(() => {
  stopAutoFit?.();
});
</script>

<template>
  <main ref="rootEl" class="shell">
    <section v-if="payload" class="content">
      <div class="danger-banner">
        <span class="banner-icon">⚠</span>
        <span class="banner-text">Sensitive data detected</span>
      </div>

      <div class="match-list">
        <div v-for="match in payload.matches" :key="match.type" class="match-row">
          <span class="match-label">{{ match.label }}</span>
          <span class="match-value">{{ match.masked }}</span>
          <span class="confidence-chip" :class="match.confidence">{{ match.confidence }}</span>
        </div>
      </div>

      <div class="advisory">
        Avoid pasting into chat, AI assistants, or untrusted apps — rotate it if it was exposed.
      </div>
    </section>
    <div v-else class="empty">Waiting for text content</div>
  </main>
</template>

<style scoped>
.shell {
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

.danger-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--clipbus-danger-bg, #fef2f2);
  border: 1px solid var(--clipbus-danger, #dc2626);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--clipbus-danger, #dc2626);
  font-weight: 600;
}

.banner-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.banner-text {
  font-size: 13px;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.match-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 7px 10px;
  min-width: 0;
}

.match-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--clipbus-text-secondary, #64748b);
}

.match-value {
  flex: 1;
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 12px;
  color: var(--clipbus-text-primary, #0f172a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.confidence-chip {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  padding: 2px 5px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.confidence-chip.high {
  background: var(--clipbus-danger-bg, #fef2f2);
  color: var(--clipbus-danger, #dc2626);
}

.confidence-chip.medium {
  background: var(--clipbus-warning-bg, #fffbeb);
  color: var(--clipbus-warning, #b45309);
}

.advisory {
  font-size: 11px;
  color: var(--clipbus-text-secondary, #64748b);
  line-height: 1.4;
  padding: 6px 0 2px;
  border-top: 1px solid var(--clipbus-border, #e2e8f0);
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
