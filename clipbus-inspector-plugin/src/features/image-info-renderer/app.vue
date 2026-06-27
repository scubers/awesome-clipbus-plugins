<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeImageInfoPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeImageInfoPayload(attachmentPayload.value?.attachment?.payloadJson)
);

// ── Copy state ────────────────────────────────────────────────────────────────

const copiedKey = ref<string | null>(null);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

async function copyText(key: string, text: string) {
  await clipbus.clipboard.copyText({ text });
  copiedKey.value = key;
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copiedKey.value = null;
  }, 1500);
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

let stopAutoFit: (() => void) | null = null;

onMounted(() => {
  stopAutoFit = autoFit({ min: 160, max: 360 });
});

onUnmounted(() => {
  stopAutoFit?.();
  if (copyTimer) clearTimeout(copyTimer);
});

// ── Display helpers ───────────────────────────────────────────────────────────

const dimensions = computed(() =>
  payload.value
    ? `${payload.value.width} × ${payload.value.height} px`
    : ""
);

const fileSizeRaw = computed(() =>
  payload.value
    ? `(${payload.value.fileSizeBytes.toLocaleString()} bytes)`
    : ""
);
</script>

<template>
  <main class="shell">
    <section v-if="payload" class="content">

      <!-- ── Header badge ─────────────────────────────────────────────────── -->
      <div class="header-row">
        <span class="format-badge">{{ payload.format }}</span>
        <span class="orientation-label">{{ payload.orientation }}</span>
      </div>

      <!-- ── Facts grid ───────────────────────────────────────────────────── -->
      <div class="facts-grid">
        <span class="fact-label">Dimensions</span>
        <span class="fact-value with-copy">
          <span>{{ dimensions }}</span>
          <button
            class="copy-btn"
            :class="{ copied: copiedKey === 'dimensions' }"
            @click="copyText('dimensions', dimensions)"
          >{{ copiedKey === 'dimensions' ? '✓' : 'Copy' }}</button>
        </span>

        <span class="fact-label">Aspect Ratio</span>
        <span class="fact-value">
          {{ payload.aspectRatioReduced }}
          <span class="fact-muted">({{ payload.aspectRatioDecimal }})</span>
        </span>

        <span class="fact-label">Megapixels</span>
        <span class="fact-value">{{ payload.megapixels }} MP</span>

        <span class="fact-label">File Size</span>
        <span class="fact-value">
          {{ payload.fileSizeHuman }}
          <span class="fact-muted">{{ fileSizeRaw }}</span>
        </span>

        <template v-if="payload.commonLabel">
          <span class="fact-label">Resolution</span>
          <span class="fact-value">{{ payload.commonLabel }}</span>
        </template>
      </div>

    </section>
    <div v-else class="empty">Waiting for an image</div>
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

/* ── Header ────────────────────────────────────────────────────────────────── */

.header-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.format-badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: var(--clipbus-accent, #0369a1);
  color: var(--clipbus-on-accent, #ffffff);
}

.orientation-label {
  font-size: 11px;
  color: var(--clipbus-text-secondary, #64748b);
  font-style: italic;
}

/* ── Facts grid ────────────────────────────────────────────────────────────── */

.facts-grid {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 8px 12px;
  display: grid;
  grid-template-columns: 6.5rem 1fr;
  row-gap: 5px;
  column-gap: 8px;
  align-items: center;
}

.fact-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--clipbus-text-secondary, #64748b);
  white-space: nowrap;
}

.fact-value {
  font-size: 12px;
  color: var(--clipbus-text-primary, #0f172a);
  word-break: break-word;
}

.fact-muted {
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 11px;
  margin-left: 4px;
}

/* ── Copy button ───────────────────────────────────────────────────────────── */

.with-copy {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.copy-btn {
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 4px;
  border: 1px solid var(--clipbus-border, #e2e8f0);
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-secondary, #64748b);
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  line-height: 1.6;
  transition: background 0.1s, color 0.1s;
}

.copy-btn:hover {
  background: var(--clipbus-surface-elevated, #f8fafc);
  color: var(--clipbus-text-primary, #0f172a);
}

.copy-btn.copied {
  background: var(--clipbus-accent, #0369a1);
  color: var(--clipbus-on-accent, #ffffff);
  border-color: var(--clipbus-accent, #0369a1);
}

/* ── Empty state ───────────────────────────────────────────────────────────── */

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
