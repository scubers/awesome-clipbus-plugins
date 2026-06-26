<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeTextStatsPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeTextStatsPayload(attachmentPayload.value?.attachment?.payloadJson)
);

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 160, max: 360 });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [
        { id: "copy-sha256", title: "复制 SHA-256" },
        { id: "copy-md5", title: "复制 MD5" },
      ],
    });
  } catch {
    /* not in attachment renderer context */
  }

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (!payload.value) return;
    if (d?.buttonID === "copy-sha256") {
      await clipbus.clipboard.copyText({ text: payload.value.sha256 });
    } else if (d?.buttonID === "copy-md5") {
      await clipbus.clipboard.copyText({ text: payload.value.md5 });
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
      <div class="header-row">
        <span class="badge">文本统计</span>
        <span class="preview-text">{{ payload.preview }}</span>
      </div>

      <div class="stats-grid">
        <div class="stat-tile">
          <span class="stat-value">{{ payload.chars.toLocaleString() }}</span>
          <span class="stat-label">字符</span>
          <span class="stat-sub">非空白 {{ payload.charsNoSpaces.toLocaleString() }}</span>
        </div>
        <div class="stat-tile">
          <span class="stat-value">{{ payload.words.toLocaleString() }}</span>
          <span class="stat-label">词</span>
        </div>
        <div class="stat-tile">
          <span class="stat-value">{{ payload.lines.toLocaleString() }}</span>
          <span class="stat-label">行</span>
        </div>
        <div class="stat-tile">
          <span class="stat-value">{{ payload.bytes.toLocaleString() }}</span>
          <span class="stat-label">字节</span>
        </div>
      </div>

      <div class="hash-block">
        <div class="hash-section-label">哈希</div>
        <div class="hash-row">
          <span class="hash-name">MD5</span>
          <span class="hash-value">{{ payload.md5 }}</span>
        </div>
        <div class="hash-row">
          <span class="hash-name">SHA-1</span>
          <span class="hash-value">{{ payload.sha1 }}</span>
        </div>
        <div class="hash-row">
          <span class="hash-name">SHA-256</span>
          <span class="hash-value">{{ payload.sha256 }}</span>
        </div>
      </div>
    </section>
    <div v-else class="empty">等待文本内容</div>
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
  gap: 10px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.badge {
  flex-shrink: 0;
  background: var(--clipbus-accent, #7c3aed);
  color: var(--clipbus-accent-contrast, #ffffff);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.preview-text {
  color: var(--clipbus-text-secondary, #64748b);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.stat-tile {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--clipbus-text-primary, #0f172a);
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  color: var(--clipbus-text-secondary, #64748b);
  font-weight: 500;
}

.stat-sub {
  font-size: 10px;
  color: var(--clipbus-text-tertiary, #94a3b8);
  text-align: center;
}

.hash-block {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hash-section-label {
  font-size: 11px;
  color: var(--clipbus-text-secondary, #64748b);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.hash-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.hash-name {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--clipbus-text-tertiary, #94a3b8);
  width: 48px;
}

.hash-value {
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 11px;
  color: var(--clipbus-text-primary, #0f172a);
  word-break: break-all;
  line-height: 1.4;
  min-width: 0;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
