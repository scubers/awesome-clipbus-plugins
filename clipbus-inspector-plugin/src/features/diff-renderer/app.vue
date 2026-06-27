<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeDiffPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeDiffPayload(attachmentPayload.value?.attachment?.payloadJson)
);

let stopAutoFit: (() => void) | null = null;

onMounted(() => {
  stopAutoFit = autoFit({ min: 140, max: 480 });
});

onUnmounted(() => {
  stopAutoFit?.();
});
</script>

<template>
  <main class="shell">
    <section v-if="payload" class="content">
      <div class="stats-bar">
        <span class="stat stat--add">+{{ payload.additions }}</span>
        <span class="stat-sep"> − </span>
        <span class="stat stat--del">{{ payload.deletions }}</span>
        <span class="stat-sep"> · </span>
        <span class="stat stat--files">{{ payload.files }} file{{ payload.files !== 1 ? 's' : '' }}</span>
      </div>
      <div class="diff-lines">
        <div
          v-for="(line, idx) in payload.lines"
          :key="idx"
          class="diff-line"
          :class="`diff-line--${line.type}`"
        >
          <span class="diff-gutter">{{ line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' ' }}</span>
          <span class="diff-text">{{ line.text.slice(line.type === 'add' || line.type === 'del' ? 1 : 0) }}</span>
        </div>
      </div>
    </section>
    <div v-else class="empty">Waiting for diff content</div>
  </main>
</template>

<style scoped>
.shell {
  padding: 0;
  display: flex;
  flex-direction: column;
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 12px;
}

.content {
  display: flex;
  flex-direction: column;
}

.stats-bar {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid var(--clipbus-border, #e2e8f0);
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
}

.stat--add {
  color: var(--clipbus-success, #16a34a);
}

.stat-sep {
  color: var(--clipbus-text-secondary, #64748b);
  font-weight: 400;
}

.stat--del {
  color: var(--clipbus-danger, #dc2626);
}

.stat--files {
  color: var(--clipbus-text-secondary, #64748b);
  font-weight: 400;
}

.diff-lines {
  overflow-y: auto;
  max-height: 420px;
}

.diff-line {
  display: flex;
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 11px;
  line-height: 1.5;
  white-space: pre;
}

.diff-line--add {
  background: color-mix(in srgb, var(--clipbus-success, #16a34a) 12%, transparent);
}

.diff-line--del {
  background: color-mix(in srgb, var(--clipbus-danger, #dc2626) 12%, transparent);
}

.diff-line--hunk {
  background: color-mix(in srgb, var(--clipbus-accent, #0f766e) 10%, transparent);
  color: var(--clipbus-accent, #0f766e);
}

.diff-line--meta {
  background: var(--clipbus-surface-elevated, #f8fafc);
  color: var(--clipbus-text-tertiary, #94a3b8);
}

.diff-line--ctx {
  background: transparent;
}

.diff-gutter {
  flex: 0 0 16px;
  padding: 0 4px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  user-select: none;
}

.diff-line--add .diff-gutter {
  color: var(--clipbus-success, #16a34a);
}

.diff-line--del .diff-gutter {
  color: var(--clipbus-danger, #dc2626);
}

.diff-text {
  flex: 1;
  padding: 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
