<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeEntitiesPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeEntitiesPayload(attachmentPayload.value?.attachment?.payloadJson)
);

const groups = computed(() => {
  if (!payload.value) return [];
  const p = payload.value;
  const result: { label: string; items: string[] }[] = [];
  if (p.urls.length > 0) result.push({ label: "链接", items: p.urls });
  if (p.emails.length > 0) result.push({ label: "邮箱", items: p.emails });
  if (p.ips.length > 0) result.push({ label: "IP 地址", items: p.ips });
  return result;
});

let unsub: (() => void) | null = null;
let stopAutoFit: (() => void) | null = null;

onMounted(async () => {
  stopAutoFit = autoFit({ min: 140, max: 420 });

  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy-all", title: "复制全部" }],
    });
  } catch {
    /* not in attachment renderer context */
  }

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy-all" && payload.value) {
      const allItems = [
        ...payload.value.urls,
        ...payload.value.emails,
        ...payload.value.ips,
      ];
      await clipbus.clipboard.copyText({ text: allItems.join("\n") });
    }
  });
});

onUnmounted(() => {
  unsub?.();
  stopAutoFit?.();
});
</script>

<template>
  <main class="shell">
    <section v-if="payload" class="content">
      <div class="header-row">
        <span class="title">提取结果</span>
        <span class="badge">{{ payload.totalCount }}</span>
      </div>
      <div v-for="group in groups" :key="group.label" class="group">
        <div class="group-header">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-count">{{ group.items.length }}</span>
        </div>
        <ul class="item-list">
          <li v-for="item in group.items" :key="item" class="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </section>
    <div v-else class="empty">等待包含链接、邮箱或 IP 的文本</div>
  </main>
</template>

<style scoped>
.shell {
  padding: 12px 16px;
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

.header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-weight: 600;
  font-size: 13px;
  color: var(--clipbus-text-primary, #0f172a);
}

.badge {
  background: var(--clipbus-accent, #2563eb);
  color: var(--clipbus-accent-contrast, #ffffff);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.group {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--clipbus-surface, #f1f5f9);
  border-bottom: 1px solid var(--clipbus-border, #e2e8f0);
}

.group-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--clipbus-text-secondary, #64748b);
}

.group-count {
  font-size: 11px;
  color: var(--clipbus-text-tertiary, #94a3b8);
}

.item-list {
  margin: 0;
  padding: 6px 0;
  list-style: none;
  max-height: 120px;
  overflow-y: auto;
}

.item {
  padding: 3px 10px;
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 11px;
  line-height: 1.5;
  word-break: break-all;
  color: var(--clipbus-text-primary, #0f172a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item:hover {
  background: var(--clipbus-surface, #f1f5f9);
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
