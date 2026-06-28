<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeQueryPayload } from "./payload";

// autoFit must observe this renderer's own root (content-sized), not document.body —
// in the preview workbench document.body is the whole page, so without a target autoFit
// never converges and spams setHeight every frame.
const rootEl = ref<HTMLElement | null>(null);

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeQueryPayload(attachmentPayload.value?.attachment?.payloadJson)
);

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 140, max: 420, target: rootEl.value ?? undefined });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy-json", title: "Copy as JSON" }],
    });
  } catch {
    /* not in attachment renderer context */
  }

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy-json" && payload.value) {
      await clipbus.clipboard.copyText({ text: payload.value.jsonObject });
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
        <span class="badge">Query String</span>
        <span class="headline">
          {{ payload.count }} parameter{{ payload.count === 1 ? "" : "s" }}
        </span>
        <span v-if="payload.hasDuplicateKeys" class="dup-note">
          duplicate keys
        </span>
      </div>
      <div class="table-wrap">
        <table class="query-table">
          <thead>
            <tr>
              <th class="th">Key</th>
              <th class="th">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(pair, idx) in payload.pairs"
              :key="idx"
              :class="idx % 2 === 0 ? 'row-even' : 'row-odd'"
            >
              <td class="td td-key" :title="pair.key">{{ pair.key }}</td>
              <td class="td td-val" :title="pair.value">{{ pair.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <div v-else class="empty">Waiting for query string content</div>
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

.dup-note {
  color: var(--clipbus-warning, #b45309);
  font-size: 11px;
  margin-left: auto;
}

.table-wrap {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 280px;
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
}

.query-table {
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
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-key {
  color: var(--clipbus-text-secondary, #64748b);
  font-weight: 500;
  max-width: 140px;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
