<template>
  <main class="escape-shell">
    <section class="escape-shell__controls">
      <!-- Mode toggle -->
      <div class="escape-shell__field escape-shell__field--row">
        <span class="escape-shell__label">Mode</span>
        <div class="escape-shell__segmented">
          <button
            v-for="m in modes"
            :key="m.value"
            type="button"
            class="escape-shell__seg-btn"
            :class="{ 'escape-shell__seg-btn--active': draft.mode === m.value }"
            @click="draft.mode = m.value"
          >{{ m.label }}</button>
        </div>
      </div>

      <!-- Input -->
      <div class="escape-shell__field">
        <label class="escape-shell__label" for="escape-input">Input</label>
        <textarea
          id="escape-input"
          v-model="draft.input"
          class="escape-shell__textarea"
          placeholder="Enter text here…"
          rows="3"
        />
      </div>
    </section>

    <!-- Results -->
    <section class="escape-shell__results">
      <!-- Encoded result -->
      <div class="escape-shell__result-block">
        <div class="escape-shell__result-header">
          <span class="escape-shell__label">Encoded</span>
          <button
            type="button"
            class="escape-shell__copy-btn"
            @click="copyText(result.encoded)"
          >Copy</button>
        </div>
        <pre class="escape-shell__result-pre">{{ result.encoded || "(empty)" }}</pre>
      </div>

      <!-- Decoded result -->
      <div class="escape-shell__result-block">
        <div class="escape-shell__result-header">
          <span class="escape-shell__label">Decoded</span>
          <button
            type="button"
            class="escape-shell__copy-btn"
            @click="copyText(result.decoded)"
          >Copy</button>
        </div>
        <pre class="escape-shell__result-pre">{{ result.decoded || "(empty)" }}</pre>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, watch } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { INITIAL_DRAFT, transform } from "./payload";
import type { EscapeMode } from "./payload";

const modes: { value: EscapeMode; label: string }[] = [
  { value: "url", label: "URL" },
  { value: "html", label: "HTML" },
  { value: "base64", label: "Base64" },
  { value: "unicode", label: "Unicode" },
  { value: "json", label: "JSON" },
];

const draftTopic = useTopicRef(clipbus.action.draft);
const draft = reactive({ ...INITIAL_DRAFT });

watch(draftTopic, (d) => Object.assign(draft, d ?? {}), { immediate: true });

const result = computed(() => transform(draft.mode, draft.input));

async function copyText(text: string): Promise<void> {
  await clipbus.clipboard.copyText({ text });
}

let unsubHostInvoke: (() => void) | null = null;

onMounted(async () => {
  await clipbus.action.setButtons({
    buttons: [{ id: "submit", title: "Copy Encoded Result", isEnabled: true }],
  });
  unsubHostInvoke = clipbus.action.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "submit") {
      await clipbus.action.complete({
        result: { resultKind: "text", text: result.value.encoded },
        userMessage: "Copied encoded result",
      });
    }
  });
});

onUnmounted(() => {
  unsubHostInvoke?.();
  unsubHostInvoke = null;
});
</script>

<style scoped>
.escape-shell {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  height: 100%;
  min-height: 0;
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.escape-shell__controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
}

.escape-shell__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.escape-shell__field--row {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.escape-shell__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--clipbus-text-tertiary, #64748b);
  flex-shrink: 0;
}

.escape-shell__segmented {
  display: flex;
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 6px;
  overflow: hidden;
}

.escape-shell__seg-btn {
  flex: 1;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 500;
  border: none;
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-secondary, #475569);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  white-space: nowrap;
}

.escape-shell__seg-btn + .escape-shell__seg-btn {
  border-left: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
}

.escape-shell__seg-btn--active {
  background: var(--clipbus-accent, #2563eb);
  color: var(--clipbus-accent-contrast, #ffffff);
  font-weight: 600;
}

.escape-shell__textarea {
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 6px;
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 11px;
  padding: 6px 8px;
  resize: vertical;
  min-height: 56px;
  font-family: inherit;
  line-height: 1.5;
}

.escape-shell__results {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  min-height: 0;
}

.escape-shell__result-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
}

.escape-shell__result-block:last-child {
  border-bottom: none;
}

.escape-shell__result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.escape-shell__copy-btn {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 4px;
  background: var(--clipbus-surface-elevated, rgba(248, 250, 252, 0.78));
  color: var(--clipbus-text-secondary, #475569);
  cursor: pointer;
}

.escape-shell__copy-btn:hover {
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
}

.escape-shell__copy-btn:focus-visible {
  outline: 2px solid var(--clipbus-accent, #2563eb);
  outline-offset: 2px;
}

.escape-shell__result-pre {
  margin: 0;
  padding: 6px 8px;
  border: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
  border-radius: 6px;
  background: var(--clipbus-surface-elevated, rgba(248, 250, 252, 0.78));
  font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--clipbus-text-primary, #0f172a);
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  max-height: 100px;
  min-height: 28px;
}
</style>
