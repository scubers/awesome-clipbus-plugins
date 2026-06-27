<template>
  <main class="rx-shell">
    <section class="rx-shell__inputs">
      <!-- Pattern -->
      <div class="rx-shell__field">
        <label class="rx-shell__label" for="rx-pattern">Pattern</label>
        <input
          id="rx-pattern"
          v-model="draft.pattern"
          type="text"
          class="rx-shell__input rx-shell__input--mono"
          placeholder="e.g. \d+"
          spellcheck="false"
        />
      </div>

      <!-- Flags -->
      <div class="rx-shell__field">
        <label class="rx-shell__label" for="rx-flags">Flags</label>
        <input
          id="rx-flags"
          v-model="draft.flags"
          type="text"
          class="rx-shell__input rx-shell__input--mono rx-shell__input--short"
          placeholder="g"
          spellcheck="false"
        />
      </div>

      <!-- Test text -->
      <div class="rx-shell__field">
        <label class="rx-shell__label" for="rx-text">Test Text</label>
        <textarea
          id="rx-text"
          v-model="draft.text"
          class="rx-shell__textarea"
          placeholder="Paste text to test here…"
          rows="4"
          spellcheck="false"
        ></textarea>
      </div>
    </section>

    <!-- Status bar -->
    <div class="rx-shell__status" :class="{ 'rx-shell__status--error': !result.ok }">
      <template v-if="!draft.pattern">
        <span class="rx-shell__status-hint">Enter a regex pattern</span>
      </template>
      <template v-else-if="!result.ok">
        <span class="rx-shell__status-icon">⚠</span>
        <span>{{ result.error }}</span>
      </template>
      <template v-else>
        <span class="rx-shell__status-count">{{ result.matchCount }} match(es)</span>
      </template>
    </div>

    <!-- Match list -->
    <section v-if="result.ok && result.matches.length > 0" class="rx-shell__matches">
      <ul class="rx-shell__match-list">
        <li
          v-for="(m, i) in result.matches"
          :key="i"
          class="rx-shell__match-item"
        >
          <span class="rx-shell__match-index">#{{ i + 1 }}</span>
          <span class="rx-shell__match-text">{{ m.match }}</span>
          <span class="rx-shell__match-pos">@{{ m.index }}</span>
          <span v-if="m.groups.length > 0" class="rx-shell__match-groups">
            Groups: {{ m.groups.join(", ") }}
          </span>
        </li>
      </ul>
    </section>

    <div v-else-if="result.ok && draft.pattern && draft.text" class="rx-shell__empty">
      No matches
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, watch } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { INITIAL_DRAFT, runRegex } from "./payload";

const draftTopic = useTopicRef(clipbus.action.draft);
const draft = reactive({ ...INITIAL_DRAFT });

watch(draftTopic, (d) => Object.assign(draft, d ?? {}), { immediate: true });

const result = computed(() => runRegex(draft.pattern, draft.flags, draft.text));

let unsubHostInvoke: (() => void) | null = null;

onMounted(async () => {
  await clipbus.action.setButtons({
    buttons: [{ id: "submit", title: "Copy Matches", isEnabled: true }],
  });
  unsubHostInvoke = clipbus.action.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "submit") {
      const text = result.value.matches.map((m) => m.match).join("\n");
      await clipbus.action.complete({
        result: { resultKind: "text", text },
        userMessage: "Matches copied",
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
.rx-shell {
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

.rx-shell__inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
}

.rx-shell__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rx-shell__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--clipbus-text-tertiary, #64748b);
}

.rx-shell__input {
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 6px;
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 12px;
  padding: 4px 8px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.rx-shell__input:focus {
  border-color: var(--clipbus-accent, #2563eb);
}

.rx-shell__input--mono {
  font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
}

.rx-shell__input--short {
  width: 80px;
}

.rx-shell__textarea {
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 6px;
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 11px;
  font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
  padding: 6px 8px;
  resize: vertical;
  min-height: 64px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.rx-shell__textarea:focus {
  border-color: var(--clipbus-accent, #2563eb);
}

.rx-shell__status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 11px;
  background: var(--clipbus-surface-elevated, rgba(248, 250, 252, 0.78));
  border-bottom: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
  color: var(--clipbus-text-secondary, #475569);
}

.rx-shell__status--error {
  color: var(--clipbus-error, #dc2626);
  background: var(--clipbus-error-surface, rgba(254, 242, 242, 0.9));
}

.rx-shell__status-count {
  font-weight: 600;
  color: var(--clipbus-accent, #2563eb);
}

.rx-shell__status-hint {
  color: var(--clipbus-text-tertiary, #64748b);
}

.rx-shell__status-icon {
  font-size: 12px;
}

.rx-shell__matches {
  flex: 1;
  overflow-y: auto;
  padding: 8px 14px;
}

.rx-shell__match-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rx-shell__match-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--clipbus-surface-elevated, rgba(248, 250, 252, 0.78));
  border: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
  font-size: 11px;
  flex-wrap: wrap;
}

.rx-shell__match-index {
  font-size: 10px;
  color: var(--clipbus-text-tertiary, #64748b);
  flex-shrink: 0;
  min-width: 28px;
}

.rx-shell__match-text {
  font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
  font-weight: 600;
  color: var(--clipbus-text-primary, #0f172a);
  word-break: break-all;
}

.rx-shell__match-pos {
  font-size: 10px;
  color: var(--clipbus-text-tertiary, #64748b);
  flex-shrink: 0;
}

.rx-shell__match-groups {
  font-size: 10px;
  color: var(--clipbus-text-secondary, #475569);
  font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
  word-break: break-all;
}

.rx-shell__empty {
  padding: 12px 14px;
  font-size: 11px;
  color: var(--clipbus-text-tertiary, #64748b);
  text-align: center;
}
</style>
