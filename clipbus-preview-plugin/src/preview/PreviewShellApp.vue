<template>
  <main class="workbench" :data-theme="selectedTheme">
    <section class="workbench__controls">
      <label class="workbench__control">
        <span>View</span>
        <select v-model="selectedView">
          <option value="renderer">Renderer</option>
          <option value="action">Action</option>
        </select>
      </label>

      <label v-if="activeScenarioOptions.length > 0" class="workbench__control">
        <span>Scenario</span>
        <select v-model="selectedScenarioID">
          <option
            v-for="scenario in activeScenarioOptions"
            :key="scenario.id"
            :value="scenario.id"
          >
            {{ scenario.label }}
          </option>
        </select>
      </label>

      <label class="workbench__control">
        <span>Theme</span>
        <select v-model="selectedTheme">
          <option value="dark">Dark Host</option>
          <option value="light">Light Host</option>
        </select>
      </label>
    </section>

    <section class="workbench__canvas">
      <div class="host-frame">
        <div class="host-frame__title">
          <span>{{ selectedView === "renderer" ? "Attachment Renderer" : "Draft Action" }}</span>
        </div>
        <div class="host-frame__surface">
          <!-- Replace this placeholder with real feature component imports once implemented. -->
          <div class="host-frame__placeholder">
            <template v-if="activeScenarioOptions.length === 0">
              No scenarios yet — implement features and register scenarios in
              <code>src/preview/scenarios/</code>.
            </template>
            <template v-else>
              Scenario "{{ activeScenario?.label }}" — wire component in PreviewShellApp.vue.
            </template>
          </div>
        </div>
      </div>

      <aside class="workbench__notes">
        <p class="workbench__notes-title">Preview Notes</p>
        <p class="workbench__notes-body">
          This workbench simulates host chrome and theme changes.
        </p>
        <p class="workbench__notes-body">
          Once you add features: import each feature's <code>app.vue</code> here,
          add scenarios to <code>src/preview/scenarios/</code>, and map them in
          <code>activeComponent</code>.
        </p>
        <p class="workbench__notes-status">{{ statusMessage }}</p>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { attachmentScenarios } from "./scenarios/attachmentScenarios";
import { actionScenarios } from "./scenarios/actionScenarios";

type ViewKey = "renderer" | "action";
type ThemeKey = "light" | "dark";

const query = new URLSearchParams(window.location.search);
const initialView: ViewKey = query.get("view") === "action" ? "action" : "renderer";
const selectedView = ref<ViewKey>(initialView);
const selectedTheme = ref<ThemeKey>(query.get("theme") === "light" ? "light" : "dark");
const statusMessage = ref<string>("Ready. Implement features to start previewing.");

const activeScenarioOptions = computed(() =>
  selectedView.value === "renderer" ? attachmentScenarios : actionScenarios
);

const selectedScenarioID = ref<string>(activeScenarioOptions.value[0]?.id ?? "");

const activeScenario = computed(() =>
  activeScenarioOptions.value.find((s) => s.id === selectedScenarioID.value) ??
  activeScenarioOptions.value[0] ??
  null
);
</script>

<style scoped>
.workbench {
  min-height: 100%;
  padding: 24px;
  color: #e2e8f0;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.22), transparent 24%),
    linear-gradient(180deg, #111827, #0f172a);
}

.workbench[data-theme="light"] {
  color: #0f172a;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 24%),
    linear-gradient(180deg, #e2e8f0, #cbd5e1);
}

.workbench__controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.workbench__control {
  display: grid;
  gap: 6px;
}

.workbench__control span {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.72);
}

.workbench[data-theme="light"] .workbench__control span {
  color: rgba(15, 23, 42, 0.62);
}

.workbench__control select {
  min-width: 170px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(15, 23, 42, 0.48);
  color: inherit;
}

.workbench[data-theme="light"] .workbench__control select {
  background: rgba(255, 255, 255, 0.82);
}

.workbench__canvas {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 20px;
  align-items: start;
}

.host-frame {
  padding: 18px;
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.34);
  border: 1px solid rgba(45, 212, 191, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: auto;
}

.workbench[data-theme="light"] .host-frame {
  background: rgba(248, 250, 252, 0.52);
  border-color: rgba(148, 163, 184, 0.28);
}

.host-frame__title {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(226, 232, 240, 0.8);
}

.workbench[data-theme="light"] .host-frame__title {
  color: rgba(15, 23, 42, 0.7);
}

.host-frame__surface {
  display: grid;
  gap: 12px;
}

.host-frame__placeholder {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border-radius: 12px;
  border: 1px dashed rgba(148, 163, 184, 0.3);
  color: rgba(226, 232, 240, 0.55);
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

.workbench[data-theme="light"] .host-frame__placeholder {
  color: rgba(15, 23, 42, 0.45);
}

.workbench__notes {
  padding: 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.workbench[data-theme="light"] .workbench__notes {
  background: rgba(255, 255, 255, 0.76);
}

.workbench__notes-title {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workbench__notes-body,
.workbench__notes-status {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(226, 232, 240, 0.78);
}

.workbench[data-theme="light"] .workbench__notes-body,
.workbench[data-theme="light"] .workbench__notes-status {
  color: rgba(15, 23, 42, 0.72);
}

.workbench__notes-status {
  font-weight: 600;
}

@media (max-width: 980px) {
  .workbench__canvas {
    grid-template-columns: minmax(0, 1fr);
  }

  .workbench__notes {
    order: -1;
  }
}
</style>
