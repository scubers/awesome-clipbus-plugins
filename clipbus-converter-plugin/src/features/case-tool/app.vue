<template>
  <main class="case-shell">
    <section class="case-shell__input-section">
      <label class="case-shell__label" for="case-input">输入文本</label>
      <input
        id="case-input"
        v-model="draft.input"
        type="text"
        class="case-shell__input"
        placeholder="例如：helloWorld / foo_bar-baz"
        @input="syncDraft"
      />
    </section>

    <section class="case-shell__results">
      <div
        v-for="variant in variants"
        :key="variant.label"
        class="case-shell__row"
      >
        <span class="case-shell__variant-label">{{ variant.label }}</span>
        <span class="case-shell__variant-value">{{ variant.value || "—" }}</span>
        <button
          type="button"
          class="case-shell__copy-btn"
          :disabled="!variant.value"
          @click="copyVariant(variant.value)"
        >复制</button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, watch } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { INITIAL_DRAFT, buildAllCases, toCamel } from "./payload";

const draftTopic = useTopicRef(clipbus.action.draft);
const draft = reactive({ ...INITIAL_DRAFT });

watch(draftTopic, (d) => Object.assign(draft, d ?? {}), { immediate: true });

function syncDraft(): void {
  // draft.input is already bound via v-model; update is reactive
}

const variants = computed(() => buildAllCases(draft.input));

async function copyVariant(value: string): Promise<void> {
  if (!value) return;
  await clipbus.clipboard.copyText({ text: value });
}

let unsubHostInvoke: (() => void) | null = null;

onMounted(async () => {
  await clipbus.action.setButtons({
    buttons: [{ id: "submit", title: "复制 camelCase", isEnabled: true }],
  });
  unsubHostInvoke = clipbus.action.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "submit") {
      await clipbus.action.complete({
        result: { resultKind: "text", text: toCamel(draft.input) },
        userMessage: "已复制",
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
.case-shell {
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

.case-shell__input-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
}

.case-shell__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--clipbus-text-tertiary, #64748b);
}

.case-shell__input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 6px;
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 12px;
  padding: 5px 8px;
  outline: none;
}

.case-shell__input:focus {
  border-color: var(--clipbus-accent, #2563eb);
  box-shadow: 0 0 0 2px var(--clipbus-accent-muted, rgba(37, 99, 235, 0.15));
}

.case-shell__results {
  display: flex;
  flex-direction: column;
  padding: 8px 0 12px;
}

.case-shell__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  border-bottom: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.6));
}

.case-shell__row:last-child {
  border-bottom: none;
}

.case-shell__variant-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--clipbus-text-tertiary, #64748b);
  min-width: 96px;
  flex-shrink: 0;
}

.case-shell__variant-value {
  flex: 1;
  font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  color: var(--clipbus-text-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.case-shell__copy-btn {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 4px;
  background: var(--clipbus-surface-elevated, rgba(248, 250, 252, 0.78));
  color: var(--clipbus-text-secondary, #475569);
  cursor: pointer;
}

.case-shell__copy-btn:hover:not(:disabled) {
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
}

.case-shell__copy-btn:focus-visible {
  outline: 2px solid var(--clipbus-accent, #2563eb);
  outline-offset: 2px;
}

.case-shell__copy-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
