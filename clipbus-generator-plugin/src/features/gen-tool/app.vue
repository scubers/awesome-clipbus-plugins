<template>
  <main class="gen-shell">
    <section class="gen-shell__controls">
      <!-- Mode toggle -->
      <div class="gen-shell__field gen-shell__field--row">
        <span class="gen-shell__label">模式</span>
        <div class="gen-shell__segmented">
          <button
            type="button"
            class="gen-shell__seg-btn"
            :class="{ 'gen-shell__seg-btn--active': draft.mode === 'uuid' }"
            @click="setMode('uuid')"
          >UUID</button>
          <button
            type="button"
            class="gen-shell__seg-btn"
            :class="{ 'gen-shell__seg-btn--active': draft.mode === 'password' }"
            @click="setMode('password')"
          >密码</button>
        </div>
      </div>

      <!-- Count -->
      <div class="gen-shell__field gen-shell__field--row">
        <label class="gen-shell__label" for="gen-count">数量</label>
        <input
          id="gen-count"
          v-model.number="draft.count"
          type="number"
          min="1"
          max="20"
          class="gen-shell__input gen-shell__input--number"
        />
      </div>

      <!-- Password-specific controls -->
      <template v-if="draft.mode === 'password'">
        <div class="gen-shell__field gen-shell__field--row">
          <label class="gen-shell__label" for="gen-length">长度</label>
          <input
            id="gen-length"
            v-model.number="draft.length"
            type="number"
            min="8"
            max="64"
            class="gen-shell__input gen-shell__input--number"
          />
        </div>
        <div class="gen-shell__checkboxes">
          <label class="gen-shell__check">
            <input v-model="draft.useUppercase" type="checkbox" />
            <span>大写字母</span>
          </label>
          <label class="gen-shell__check">
            <input v-model="draft.useNumbers" type="checkbox" />
            <span>数字</span>
          </label>
          <label class="gen-shell__check">
            <input v-model="draft.useSymbols" type="checkbox" />
            <span>符号</span>
          </label>
        </div>
      </template>
    </section>

    <!-- Result preview -->
    <section class="gen-shell__preview">
      <div class="gen-shell__preview-header">
        <span class="gen-shell__label">结果</span>
        <button
          type="button"
          class="gen-shell__regen-btn"
          @click="regenerate"
        >重新生成</button>
      </div>
      <pre class="gen-shell__result">{{ draft.result || "（点击重新生成）" }}</pre>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, watch } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import {
  INITIAL_DRAFT,
  passwordCharset,
  buildPassword,
  formatUuids,
  uuidFromBytes,
} from "./payload";

const draftTopic = useTopicRef(clipbus.action.draft);
const draft = reactive({ ...INITIAL_DRAFT });

watch(draftTopic, (d) => Object.assign(draft, d ?? {}), { immediate: true });

function randomBytes(n: number): Uint8Array {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}

function regenerate(): void {
  if (draft.mode === "uuid") {
    const count = Math.max(1, Math.min(20, draft.count));
    const uuids = Array.from({ length: count }, () => uuidFromBytes(randomBytes(16)));
    draft.result = formatUuids(uuids);
  } else {
    const count = Math.max(1, Math.min(20, draft.count));
    const len = Math.max(8, Math.min(64, draft.length));
    const cs = passwordCharset(draft);
    const passwords = Array.from({ length: count }, () =>
      buildPassword(len, cs, randomBytes(len))
    );
    draft.result = passwords.join("\n");
  }
}

function setMode(mode: "uuid" | "password"): void {
  draft.mode = mode;
}

// Recompute result whenever any generation-relevant setting changes
watch(
  [
    () => draft.mode,
    () => draft.count,
    () => draft.length,
    () => draft.useUppercase,
    () => draft.useNumbers,
    () => draft.useSymbols,
  ],
  () => {
    regenerate();
  }
);

let unsubHostInvoke: (() => void) | null = null;

onMounted(async () => {
  regenerate();
  await clipbus.action.setButtons({
    buttons: [{ id: "submit", title: "生成并复制", isEnabled: true }],
  });
  unsubHostInvoke = clipbus.action.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "submit") {
      await clipbus.action.complete({
        result: { resultKind: "text", text: draft.result },
        userMessage: "已生成",
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
.gen-shell {
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

.gen-shell__controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--clipbus-border, rgba(226, 232, 240, 0.9));
}

.gen-shell__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gen-shell__field--row {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.gen-shell__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--clipbus-text-tertiary, #64748b);
  flex-shrink: 0;
  min-width: 36px;
}

.gen-shell__segmented {
  display: flex;
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 6px;
  overflow: hidden;
}

.gen-shell__seg-btn {
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

.gen-shell__seg-btn + .gen-shell__seg-btn {
  border-left: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
}

.gen-shell__seg-btn--active {
  background: var(--clipbus-accent, #2563eb);
  color: var(--clipbus-accent-contrast, #ffffff);
  font-weight: 600;
}

.gen-shell__input {
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 6px;
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 11px;
  padding: 3px 6px;
}

.gen-shell__input--number {
  width: 60px;
}

.gen-shell__checkboxes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.gen-shell__check {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--clipbus-text-primary, #0f172a);
  cursor: pointer;
  user-select: none;
}

.gen-shell__check input[type="checkbox"] {
  accent-color: var(--clipbus-accent, #2563eb);
  width: 13px;
  height: 13px;
  cursor: pointer;
}

.gen-shell__preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px 12px;
  flex: 1;
  min-height: 0;
}

.gen-shell__preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gen-shell__regen-btn {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 10px;
  border: 1px solid var(--clipbus-border, rgba(148, 163, 184, 0.5));
  border-radius: 5px;
  background: var(--clipbus-surface-elevated, rgba(248, 250, 252, 0.78));
  color: var(--clipbus-text-secondary, #475569);
  cursor: pointer;
}

.gen-shell__regen-btn:hover {
  background: var(--clipbus-surface, #ffffff);
  color: var(--clipbus-text-primary, #0f172a);
}

.gen-shell__regen-btn:focus-visible {
  outline: 2px solid var(--clipbus-accent, #2563eb);
  outline-offset: 2px;
}

.gen-shell__result {
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
