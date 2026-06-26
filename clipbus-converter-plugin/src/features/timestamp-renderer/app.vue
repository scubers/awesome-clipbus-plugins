<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeTimestampPayload } from "./payload";

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

  if (absSec < 60) return "刚刚";
  if (absMin < 60) return diffMs < 0 ? `${absMin} 分钟前` : `${absMin} 分钟后`;
  if (absHour < 24) return diffMs < 0 ? `${absHour} 小时前` : `${absHour} 小时后`;
  return diffMs < 0 ? `${absDay} 天前` : `${absDay} 天后`;
});

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 140, max: 300 });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy-iso", title: "复制 ISO 8601" }],
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
  <main class="shell">
    <section v-if="payload" class="content">
      <div class="meta-row">
        <span class="badge">Unix 时间戳</span>
        <span class="unit-chip">{{ payload.unit === "seconds" ? "秒" : "毫秒" }}</span>
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
          <span class="fact-label">星期</span>
          <span class="fact-value">{{ payload.weekday }}</span>
        </div>
        <div class="fact-row">
          <span class="fact-label">相对时间</span>
          <span class="fact-value">{{ relativeTime }}</span>
        </div>
      </div>
    </section>
    <div v-else class="empty">等待 Unix 时间戳</div>
  </main>
</template>

<style scoped>
.shell {
  padding: 12px 16px;
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
