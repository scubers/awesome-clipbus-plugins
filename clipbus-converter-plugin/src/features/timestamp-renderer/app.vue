<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeTimestampPayload } from "./payload";

// autoFit must observe this renderer's own root (content-sized), not document.body —
// in the dev preview workbench document.body is the whole page, so without a target
// autoFit never converges and spams setHeight every frame.
const rootEl = ref<HTMLElement | null>(null);

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeTimestampPayload(attachmentPayload.value?.attachment?.payloadJson)
);

const relativeTime = computed(() => {
  if (!payload.value) return "";
  const diffMs = payload.value.epochMs - Date.now();
  const absSec = Math.abs(Math.floor(diffMs / 1000));
  const absMin = Math.floor(absSec / 60);
  const absHour = Math.floor(absMin / 60);
  const absDay = Math.floor(absHour / 24);

  if (absSec < 60) return "just now";
  if (absMin < 60) return diffMs < 0 ? `${absMin}m ago` : `in ${absMin}m`;
  if (absHour < 24) return diffMs < 0 ? `${absHour}h ago` : `in ${absHour}h`;
  return diffMs < 0 ? `${absDay}d ago` : `in ${absDay}d`;
});

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 140, max: 300, target: rootEl.value ?? undefined });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy-iso", title: "Copy ISO 8601" }],
    });
  } catch {
    /* not in attachment renderer context */
  }

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy-iso" && payload.value) {
      await clipbus.clipboard.copyText({ text: payload.value.iso });
    }
  });
});

onUnmounted(() => {
  unsub?.();
  stopAutoFit?.();
});
</script>

<template>
  <main ref="rootEl" class="shell">
    <section v-if="payload" class="content">
      <div class="meta-row">
        <span class="badge">Unix Timestamp</span>
        <span class="unit-chip">{{ payload.unit === "seconds" ? "sec" : "ms" }}</span>
      </div>
      <div class="local-time">{{ payload.local }}</div>
      <div class="facts">
        <div class="fact-row">
          <span class="fact-label">ISO 8601</span>
          <span class="fact-value mono">{{ payload.iso }}</span>
        </div>
        <div class="fact-row">
          <span class="fact-label">UTC</span>
          <span class="fact-value mono">{{ payload.utc }}</span>
        </div>
        <div class="fact-row">
          <span class="fact-label">Weekday</span>
          <span class="fact-value">{{ payload.weekday }}</span>
        </div>
        <div class="fact-row">
          <span class="fact-label">Relative</span>
          <span class="fact-value">{{ relativeTime }}</span>
        </div>
      </div>
    </section>
    <div v-else class="empty">Waiting for Unix timestamp</div>
  </main>
</template>

<style scoped>
.shell {
  /* 复用 native 卡片自身 padding，根容器不再叠加内距，避免双层内距 */
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
  gap: 8px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
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

.unit-chip {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  color: var(--clipbus-text-secondary, #64748b);
}

.local-time {
  font-size: 16px;
  font-weight: 600;
  color: var(--clipbus-text-primary, #0f172a);
  line-height: 1.3;
}

.facts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 8px 12px;
}

.fact-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.fact-label {
  font-size: 11px;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-weight: 500;
  min-width: 60px;
  padding-top: 1px;
  flex-shrink: 0;
}

.fact-value {
  font-size: 12px;
  color: var(--clipbus-text-primary, #0f172a);
  word-break: break-all;
}

.fact-value.mono {
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
