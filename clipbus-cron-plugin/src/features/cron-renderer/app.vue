<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeCronPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeCronPayload(attachmentPayload.value?.attachment?.payloadJson)
);

let stopAutoFit: (() => void) | null = null;

onMounted(() => {
  stopAutoFit = autoFit({ min: 120, max: 380 });
});

onUnmounted(() => {
  stopAutoFit?.();
});
</script>

<template>
  <main class="shell">
    <section v-if="payload" class="content">
      <div class="expression">{{ payload.expression }}</div>

      <table class="fields-table">
        <thead>
          <tr>
            <th class="col-name">字段</th>
            <th class="col-raw">原值</th>
            <th class="col-desc">说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in payload.fields" :key="field.name">
            <td class="col-name cell-name">{{ field.name }}</td>
            <td class="col-raw cell-raw">{{ field.raw }}</td>
            <td class="col-desc cell-desc">{{ field.description }}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary">{{ payload.summary }}</div>
    </section>
    <div v-else class="empty">等待 Cron 表达式</div>
  </main>
</template>

<style scoped>
.shell {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 13px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expression {
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--clipbus-accent, #b45309);
  background: color-mix(in srgb, var(--clipbus-accent, #b45309) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--clipbus-accent, #b45309) 24%, transparent);
  border-radius: 6px;
  padding: 6px 10px;
  letter-spacing: 0.06em;
}

.fields-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.fields-table th {
  text-align: left;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--clipbus-text-tertiary, #94a3b8);
  padding: 0 6px 4px 0;
  border-bottom: 1px solid var(--clipbus-border, #e2e8f0);
}

.fields-table td {
  padding: 5px 6px 5px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--clipbus-border, #e2e8f0) 60%, transparent);
  vertical-align: middle;
}

.fields-table tr:last-child td {
  border-bottom: none;
}

.col-name {
  width: 14%;
}

.col-raw {
  width: 22%;
}

.col-desc {
  width: 64%;
}

.cell-name {
  color: var(--clipbus-text-secondary, #64748b);
  font-weight: 500;
}

.cell-raw {
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  color: var(--clipbus-text-primary, #0f172a);
}

.cell-desc {
  color: var(--clipbus-text-primary, #0f172a);
}

.summary {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 12px;
  color: var(--clipbus-text-secondary, #64748b);
  line-height: 1.5;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
