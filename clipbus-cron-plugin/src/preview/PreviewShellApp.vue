<template>
  <main class="wb" :data-theme="theme">
    <header class="wb__bar">
      <label v-if="hasRenderer && hasAction" class="wb__ctl">
        <span>View</span>
        <select v-model="view">
          <option value="renderer">Renderer</option>
          <option value="action">Action</option>
        </select>
      </label>
      <label v-if="scenarios.length > 1" class="wb__ctl">
        <span>Scenario</span>
        <select v-model="scenarioId">
          <option v-for="s in scenarios" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
      </label>
      <label class="wb__ctl">
        <span>Theme</span>
        <select v-model="theme">
          <option value="light">Light Host</option>
          <option value="dark">Dark Host</option>
        </select>
      </label>
      <span class="wb__tag">{{ view === 'renderer' ? 'Attachment Renderer' : 'Draft Action' }}</span>
    </header>

    <section class="wb__stage">
      <div class="wb__card" :style="themeVars">
        <component :is="activeComponent" v-if="activeComponent" :key="view + ':' + scenarioId" />
        <div v-else class="wb__empty">
          This plugin exposes no previewable WebView (auto-run actions / no renderers).
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { attachmentScenarios } from "./scenarios/attachmentScenarios";
import { actionScenarios } from "./scenarios/actionScenarios";

/* ─── PER-PLUGIN: import every renderer + draft-action feature component ─── */
import CronRenderer from "../features/cron-renderer/app.vue";

/* ─── PER-PLUGIN: map scenario.component (feature id) → component ─── */
const RENDERERS: Record<string, unknown> = {
  "cron-renderer": CronRenderer,
};
const ACTIONS: Record<string, unknown> = {};
/* ──────────────────────────────────────────────────────────────────────── */

// Mock host bridge so SDK host verbs resolve instead of throwing in the browser.
const g = globalThis as unknown as { webkit?: { messageHandlers?: Record<string, unknown> } };
if (!g.webkit?.messageHandlers?.clipbusPluginCall) {
  g.webkit = { messageHandlers: { clipbusPluginCall: { postMessage: async () => ({ response: {} }) } } };
}

type ViewKey = "renderer" | "action";
const hasRenderer = attachmentScenarios.length > 0;
const hasAction = actionScenarios.length > 0;
const params = new URLSearchParams(window.location.search);
const view = ref<ViewKey>(
  params.get("view") === "action" && hasAction ? "action" : hasRenderer ? "renderer" : "action"
);
const theme = ref<"light" | "dark">(params.get("theme") === "dark" ? "dark" : "light");

const scenarios = computed(() => (view.value === "renderer" ? attachmentScenarios : actionScenarios));
const scenarioId = ref<string>(scenarios.value[0]?.id ?? "");
watch(scenarios, (list) => {
  if (!list.some((s) => s.id === scenarioId.value)) scenarioId.value = list[0]?.id ?? "";
});
const scenario = computed(
  () => scenarios.value.find((s) => s.id === scenarioId.value) ?? scenarios.value[0] ?? null
);
const activeComponent = computed(() => {
  const s = scenario.value as { component?: string } | null;
  if (!s?.component) return null;
  return ((view.value === "renderer" ? RENDERERS : ACTIONS)[s.component] as unknown) ?? null;
});

// Seed SDK topics BEFORE the child renders (sync + immediate). :key forces remount per scenario.
watch(
  [scenario, view],
  () => {
    const s = scenario.value as { bootstrap?: unknown } | null;
    if (!s) return;
    const mode = view.value === "renderer" ? "attachmentRenderer" : "action";
    window.dispatchEvent(new CustomEvent("clipbus-plugin-context", { detail: { mode } }));
    window.dispatchEvent(
      new CustomEvent(view.value === "renderer" ? "clipbus-plugin-attachment" : "clipbus-plugin-draft", {
        detail: s.bootstrap,
      })
    );
  },
  { immediate: true, flush: "sync" }
);

// Theme tokens so renderers using var(--clipbus-*) re-theme in the workbench.
const LIGHT: Record<string, string> = {
  "--clipbus-text-primary": "#0f172a", "--clipbus-text-secondary": "#475569",
  "--clipbus-text-tertiary": "#94a3b8", "--clipbus-surface": "#ffffff",
  "--clipbus-surface-elevated": "#f1f5f9", "--clipbus-border": "#e2e8f0",
  "--clipbus-accent": "#2563eb", "--clipbus-on-accent": "#ffffff",
};
const DARK: Record<string, string> = {
  "--clipbus-text-primary": "#e2e8f0", "--clipbus-text-secondary": "#94a3b8",
  "--clipbus-text-tertiary": "#64748b", "--clipbus-surface": "#1e293b",
  "--clipbus-surface-elevated": "#0f172a", "--clipbus-border": "#334155",
  "--clipbus-accent": "#3b82f6", "--clipbus-on-accent": "#ffffff",
};
const themeVars = computed(() => (theme.value === "dark" ? DARK : LIGHT));
</script>

<style scoped>
.wb { min-height: 100%; padding: 20px; display: flex; flex-direction: column; gap: 16px;
  background: linear-gradient(180deg, #0f172a, #111827); }
.wb[data-theme="light"] { background: linear-gradient(180deg, #e2e8f0, #cbd5e1); }
.wb__bar { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; }
.wb__ctl { display: grid; gap: 6px; }
.wb__ctl span { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9); }
.wb[data-theme="light"] .wb__ctl span { color: rgba(51, 65, 85, 0.8); }
.wb__ctl select { min-width: 170px; padding: 8px 10px; border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.35); background: rgba(15, 23, 42, 0.5); color: inherit;
  color: #e2e8f0; }
.wb[data-theme="light"] .wb__ctl select { background: rgba(255, 255, 255, 0.85); color: #0f172a; }
.wb__tag { margin-left: auto; align-self: center; font-size: 11px; font-weight: 700;
  letter-spacing: 0.04em; color: rgba(148, 163, 184, 0.85); }
.wb__stage { display: flex; justify-content: center; }
/* Card mimics the host renderer viewport. Fixed width, content drives height; the
   renderer's own autoFit/overflow governs its internal layout. */
.wb__card { width: 380px; max-width: 100%; padding: 14px; border-radius: 14px;
  background: var(--clipbus-surface, #ffffff); color: var(--clipbus-text-primary, #0f172a);
  border: 1px solid var(--clipbus-border, #e2e8f0); box-shadow: 0 10px 30px rgba(2, 6, 23, 0.35);
  overflow: auto; }
.wb__empty { padding: 28px 12px; text-align: center; font-size: 13px;
  color: var(--clipbus-text-tertiary, #94a3b8); }
</style>
