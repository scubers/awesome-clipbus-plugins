<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeCsvPayload, buildMarkdownTable } from "./payload";

// autoFit must observe this renderer's own root (content-sized), not document.body —
// in the preview workbench document.body is the whole page, so without a target autoFit
// never converges and spams setHeight every frame.
const rootEl = ref<HTMLElement | null>(null);

const MAX_DISPLAY_ROWS = 50;

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeCsvPayload(attachmentPayload.value?.attachment?.payloadJson)
);

const displayRows = computed(() =>
  payload.value ? payload.value.rows.slice(0, MAX_DISPLAY_ROWS) : []
);

const hiddenRowCount = computed(() =>
  payload.value ? Math.max(0, payload.value.rowCount - MAX_DISPLAY_ROWS) : 0
);

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 160, max: 460, target: rootEl.value ?? undefined });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy", title: "Copy as Markdown Table" }],
    });
  } catch {
    /* not in attachment renderer context */
  }

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy" && payload.value) {
      await clipbus.clipboard.copyText({
        text: buildMarkdownTable(payload.value),
      });
    }
  });
});

onUnmounted(() => {
  unsub?.();
  stopAutoFit?.();
});
</script>

<template>
  <main ref="rootEl" class="shell">
    <section v-if="payload" class="content">
      <div class="meta-row">
        <span class="badge">{{ payload.display.typeLabel }}</span>
        <span class="headline">{{ payload.display.headline }}</span>
        <span class="delimiter-hint">{{ payload.display.facts[2].value }}</span>
      </div>
      <div class="table-wrap">
        <table class="csv-table">
          <thead>
            <tr>
              <th v-for="header in payload.headers" :key="header" class="th">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rIdx) in displayRows"
              :key="rIdx"
              :class="rIdx % 2 === 0 ? 'row-even' : 'row-odd'"
            >
              <td
                v-for="(cell, cIdx) in row"
                :key="cIdx"
                class="td"
                :title="cell"
              >
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="hiddenRowCount > 0" class="more-rows">
        +{{ hiddenRowCount }} more rows
      </div>
    </section>
    <div v-else class="empty">Waiting for CSV content</div>
  </main>
</template>

<style scoped>
.shell {
  padding: 0;
  display: flex;
  flex-direction: column;
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 13px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  background: var(--clipbus-accent, #0f766e);
  color: var(--clipbus-accent-contrast, #ffffff);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.headline {
  color: var(--clipbus-text-secondary, #64748b);
  font-size: 12px;
  font-weight: 500;
}

.delimiter-hint {
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 11px;
  margin-left: auto;
}

.table-wrap {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 360px;
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
}

.csv-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  line-height: 1.4;
}

.th {
  background: var(--clipbus-surface-elevated, #f8fafc);
  color: var(--clipbus-text-secondary, #64748b);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 6px 10px;
  text-align: left;
  border-bottom: 1px solid var(--clipbus-border, #e2e8f0);
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-even {
  background: var(--clipbus-surface, #ffffff);
}

.row-odd {
  background: var(--clipbus-surface-elevated, #f8fafc);
}

.td {
  padding: 5px 10px;
  color: var(--clipbus-text-primary, #0f172a);
  border-bottom: 1px solid var(--clipbus-divider, #f1f5f9);
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-rows {
  text-align: center;
  font-size: 11px;
  color: var(--clipbus-text-tertiary, #94a3b8);
  padding: 4px 0 2px;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
