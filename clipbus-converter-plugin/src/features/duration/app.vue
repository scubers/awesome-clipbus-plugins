<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeDurationPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeDurationPayload(attachmentPayload.value?.attachment?.payloadJson)
);

const totalSecondsDisplay = computed(() => {
  if (!payload.value) return "";
  const prefix = payload.value.approximate ? "≈" : "=";
  return `${prefix} ${payload.value.totalSeconds.toLocaleString()}`;
});

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 140, max: 300 });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy-seconds", title: "Copy Seconds" }],
    });
  } catch {
    /* not in attachment renderer context */
  }

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy-seconds" && payload.value) {
      await clipbus.clipboard.copyText({ text: String(payload.value.totalSeconds) });
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
        <span class="badge">ISO 8601 Duration</span>
      </div>
      <div class="breakdown">{{ payload.humanBreakdown }}</div>
      <div class="facts">
        <div class="fact-row">
          <span class="fact-label">Input</span>
          <span class="fact-value mono">{{ payload.original }}</span>
        </div>
        <div class="fact-row">
          <span class="fact-label">Total Seconds</span>
          <span class="fact-value mono">{{ totalSecondsDisplay }}</span>
        </div>
        <div v-if="payload.approximate" class="fact-row">
          <span class="fact-label"></span>
          <span class="fact-note">years/months use nominal values (365.25d / 30.4375d)</span>
        </div>
      </div>
    </section>
    <div v-else class="empty">Waiting for ISO 8601 duration</div>
  </main>
</template>

<style scoped>
.shell {
  /* root container: no background, no padding — host already provides spacing */
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
  background: var(--clipbus-accent, #7c3aed);
  color: var(--clipbus-accent-contrast, #ffffff);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.breakdown {
  font-size: 15px;
  font-weight: 600;
  color: var(--clipbus-text-primary, #0f172a);
  line-height: 1.4;
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
  min-width: 84px;
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

.fact-note {
  font-size: 11px;
  color: var(--clipbus-text-secondary, #64748b);
  font-style: italic;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
