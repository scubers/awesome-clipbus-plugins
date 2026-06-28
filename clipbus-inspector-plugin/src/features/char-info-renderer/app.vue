<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeCharPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeCharPayload(attachmentPayload.value?.attachment?.payloadJson)
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

// autoFit must observe this renderer's own root (content-sized), not document.body —
// in the preview workbench document.body is the whole page, so without a target
// autoFit never converges and spams setHeight every frame.
const rootEl = ref<HTMLElement | null>(null);

let stopAutoFit: (() => void) | null = null;

onMounted(() => {
  stopAutoFit = autoFit({ min: 160, max: 360, target: rootEl.value ?? undefined });
});

onUnmounted(() => {
  stopAutoFit?.();
  if (copyTimer) clearTimeout(copyTimer);
});

// ── Display helpers ───────────────────────────────────────────────────────────

const codePointsDisplay = computed(() =>
  payload.value ? payload.value.codePoints.join("  ") : ""
);
</script>

<template>
  <main ref="rootEl" class="shell">
    <section v-if="payload" class="content">

      <!-- ── Glyph + category ────────────────────────────────────────────── -->
      <div class="glyph-row">
        <div class="glyph-box" :class="{ 'glyph-box--wide': payload.isInvisible }">
          <span v-if="payload.isInvisible" class="invisible-hint">(zero-width / invisible)</span>
          <span v-else class="glyph-char">{{ payload.glyph }}</span>
        </div>
        <span class="category-badge">{{ payload.category }}</span>
      </div>

      <!-- ── Facts grid ───────────────────────────────────────────────────── -->
      <div class="facts-grid">
        <span class="fact-label">Code Point</span>
        <span class="fact-value with-copy">
          <span>{{ codePointsDisplay }}</span>
          <button
            class="copy-btn"
            :class="{ copied: copiedKey === 'codePoints' }"
            @click="copyText('codePoints', codePointsDisplay)"
          >{{ copiedKey === 'codePoints' ? '✓' : 'Copy' }}</button>
        </span>

        <span class="fact-label">UTF-8</span>
        <span class="fact-value with-copy">
          <span>{{ payload.utf8 }}</span>
          <button
            class="copy-btn"
            :class="{ copied: copiedKey === 'utf8' }"
            @click="copyText('utf8', payload.utf8)"
          >{{ copiedKey === 'utf8' ? '✓' : 'Copy' }}</button>
        </span>

        <span class="fact-label">UTF-16</span>
        <span class="fact-value">{{ payload.utf16 }}</span>

        <span class="fact-label">HTML Entity</span>
        <span class="fact-value with-copy">
          <span>{{ payload.htmlEntity }}</span>
          <button
            class="copy-btn"
            :class="{ copied: copiedKey === 'htmlEntity' }"
            @click="copyText('htmlEntity', payload.htmlEntity)"
          >{{ copiedKey === 'htmlEntity' ? '✓' : 'Copy' }}</button>
        </span>

        <span class="fact-label">Decimal</span>
        <span class="fact-value fact-mono-muted">{{ payload.primaryDecimal }}</span>
      </div>

    </section>
    <div v-else class="empty">Paste a character to inspect</div>
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

/* ── Glyph ─────────────────────────────────────────────────────────────────── */

.glyph-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.glyph-box {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 8px;
  background: var(--clipbus-surface-elevated, #f8fafc);
}

.glyph-box--wide {
  width: auto;
  padding: 0 10px;
}

.glyph-char {
  font-size: 32px;
  line-height: 1;
}

.invisible-hint {
  font-size: 10px;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-style: italic;
  text-align: center;
}

.category-badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: var(--clipbus-accent, #0369a1);
  color: var(--clipbus-on-accent, #ffffff);
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
  font-family: ui-monospace, monospace;
}

.fact-mono-muted {
  font-size: 12px;
  font-family: ui-monospace, monospace;
  color: var(--clipbus-text-tertiary, #94a3b8);
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
