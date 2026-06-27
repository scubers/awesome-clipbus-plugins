<template>
  <main class="lorem-shell">
    <section class="lorem-shell__controls">
      <!-- Unit segmented control -->
      <div class="lorem-shell__field lorem-shell__field--row">
        <span class="lorem-shell__label">Unit</span>
        <div class="lorem-shell__segmented">
          <button
            type="button"
            class="lorem-shell__seg-btn"
            :class="{ 'lorem-shell__seg-btn--active': draft.unit === 'paragraphs' }"
            @click="draft.unit = 'paragraphs'"
          >Paragraphs</button>
          <button
            type="button"
            class="lorem-shell__seg-btn"
            :class="{ 'lorem-shell__seg-btn--active': draft.unit === 'sentences' }"
            @click="draft.unit = 'sentences'"
          >Sentences</button>
          <button
            type="button"
            class="lorem-shell__seg-btn"
            :class="{ 'lorem-shell__seg-btn--active': draft.unit === 'words' }"
            @click="draft.unit = 'words'"
          >Words</button>
        </div>
      </div>

      <!-- Count -->
      <div class="lorem-shell__field lorem-shell__field--row">
        <label class="lorem-shell__label" for="lorem-count">Count</label>
        <input
          id="lorem-count"
          v-model.number="draft.count"
          type="number"
          min="1"
          max="50"
          class="lorem-shell__input lorem-shell__input--number"
        />
      </div>

      <!-- Start with Lorem ipsum toggle -->
      <div class="lorem-shell__checkboxes">
        <label class="lorem-shell__check">
          <input v-model="draft.startWithLorem" type="checkbox" />
          <span>Start with "Lorem ipsum dolor sit amet…"</span>
        </label>
      </div>
    </section>

    <!-- Result preview -->
    <section class="lorem-shell__preview">
      <div class="lorem-shell__preview-header">
        <span class="lorem-shell__label">Result</span>
        <div class="lorem-shell__preview-actions">
          <button
            type="button"
            class="lorem-shell__regen-btn"
            @click="regenerate"
          >Regenerate</button>
          <button
            type="button"
            class="lorem-shell__copy-btn"
            @click="copyResult"
          >Copy</button>
        </div>
      </div>
      <pre class="lorem-shell__result">{{ draft.result || "(click Regenerate to preview)" }}</pre>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, watch } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { INITIAL_DRAFT, generateLorem, clampCount } from "./payload";

const draftTopic = useTopicRef(clipbus.action.draft);
const draft = reactive({ ...INITIAL_DRAFT });

watch(draftTopic, (d) => Object.assign(draft, d ?? {}), { immediate: true });

function regenerate(): void {
  const count = clampCount(draft.count);
  draft.result = generateLorem(draft.unit, count, draft.startWithLorem);
}

async function copyResult(): Promise<void> {
  if (draft.result) {
    await clipbus.clipboard.copyText({ text: draft.result });
  }
}

// Recompute result whenever any generation-relevant setting changes
watch(
  [
    () => draft.unit,
    () => draft.count,
    () => draft.startWithLorem,
  ],
  () => {
    regenerate();
  }
);

let unsubHostInvoke: (() => void) | null = null;

onMounted(async () => {
  regenerate();
  await clipbus.action.setButtons({
    buttons: [{ id: "submit", title: "Insert", isEnabled: true }],
  });
  unsubHostInvoke = clipbus.action.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "submit") {
      await clipbus.action.complete({
        result: { resultKind: "text", text: draft.result },
        userMessage: "Inserted",
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
.lorem-shell {
  display: flex;
  flex-direction: column;
  gap: 0;
  /* 透明底色 + 零外距：复用 host action 容器自带的底色与内距，避免与宿主割裂 */
  padding: 0;
  height: 100%;
  min-height: 0;
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.lorem-shell__controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0 10px;
  border-bottom: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
}

.lorem-shell__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lorem-shell__field--row {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.lorem-shell__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--clipbus-text-tertiary, #64748b);
  flex-shrink: 0;
  min-width: 36px;
}

.lorem-shell__segmented {
  display: flex;
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 6px;
  overflow: hidden;
}

.lorem-shell__seg-btn {
  flex: 1;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  border: none;
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-secondary, #475569);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.lorem-shell__seg-btn + .lorem-shell__seg-btn {
  border-left: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
}

.lorem-shell__seg-btn--active {
  background: var(--clipbus-accent, #2563eb);
  color: var(--clipbus-accent-contrast, #ffffff);
  font-weight: 600;
}

.lorem-shell__input {
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 6px;
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 11px;
  padding: 3px 6px;
}

.lorem-shell__input--number {
  width: 60px;
}

.lorem-shell__checkboxes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.lorem-shell__check {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--clipbus-text-primary, #0f172a);
  cursor: pointer;
  user-select: none;
}

.lorem-shell__check input[type="checkbox"] {
  accent-color: var(--clipbus-accent, #2563eb);
  width: 13px;
  height: 13px;
  cursor: pointer;
}

.lorem-shell__preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0 12px;
  flex: 1;
  min-height: 0;
}

.lorem-shell__preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lorem-shell__preview-actions {
  display: flex;
  gap: 6px;
}

.lorem-shell__regen-btn,
.lorem-shell__copy-btn {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 10px;
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 5px;
  background: var(--clipbus-surface-elevated, rgba(248, 250, 252, 0.78));
  color: var(--clipbus-text-secondary, #475569);
  cursor: pointer;
}

.lorem-shell__regen-btn:hover,
.lorem-shell__copy-btn:hover {
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
}

.lorem-shell__regen-btn:focus-visible,
.lorem-shell__copy-btn:focus-visible {
  outline: 2px solid var(--clipbus-accent, #2563eb);
  outline-offset: 2px;
}

.lorem-shell__result {
  margin: 0;
  padding: 8px 10px;
  border: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
  border-radius: 8px;
  background: var(--clipbus-surface-elevated, rgba(248, 250, 252, 0.78));
  font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--clipbus-text-primary, #0f172a);
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  max-height: 180px;
  min-height: 40px;
}
</style>
