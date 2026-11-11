<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { autoFit } from "@clipbus/plugin-sdk/dom";
import { ctx } from "@clipbus/plugin-sdk/view";
import { useCard } from "../../shared/composables/useCard";
import { attachment, decodeFormattedTextPayload } from "./payload";
import { htmlFragment, sanitizedFragment } from "../rich-text/html";

const card = useCard(attachment);
const payload = computed(() => decodeFormattedTextPayload(card.attachment.value.payload));
const state = ref<"loading" | "ready" | "rtf" | "missing" | "error">(
  payload.value?.kind === "rich_text_preview" ? "loading" : "ready",
);
const bodyEl = ref<HTMLElement | null>(null);
const rootEl = ref<HTMLElement | null>(null);
let stopAutoFit: (() => void) | null = null;

function openLinks(event: MouseEvent): void {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
  if (!link) return;
  event.preventDefault();
  ctx.system.openUrl({ url: link.href }).catch((error: unknown) => ctx.log.warn("open link failed", error));
}

onMounted(async () => {
  stopAutoFit = autoFit({ min: 120, max: 520, target: rootEl.value ?? undefined });
  if (payload.value?.kind !== "rich_text_preview") return;
  bodyEl.value?.addEventListener("click", openLinks);
  if (payload.value.format !== "html") {
    state.value = "rtf";
    return;
  }
  try {
    const { richText } = await ctx.item.getRichText();
    if (!richText?.html) {
      state.value = "missing";
      return;
    }
    bodyEl.value?.replaceChildren(sanitizedFragment(htmlFragment(richText.html), document));
    state.value = "ready";
  } catch (error) {
    ctx.log.warn("rich text loading failed", error);
    state.value = "error";
  }
});
onUnmounted(() => {
  stopAutoFit?.();
  bodyEl.value?.removeEventListener("click", openLinks);
});
</script>

<template>
  <div class="viewport">
    <main ref="rootEl" class="shell">
      <section v-if="payload?.kind === 'markdown_preview'" class="content">
        <div class="meta-row">
          <span class="meta-item">{{ payload.sourceChars }} chars</span>
          <span class="meta-sep">·</span>
          <span class="meta-item">{{ payload.lineCount }} lines</span>
          <span v-if="payload.headingCount > 0" class="meta-sep">·</span>
          <span v-if="payload.headingCount > 0" class="meta-item">{{ payload.headingCount }} headings</span>
        </div>
        <div class="md-body" v-html="payload.html"></div>
      </section>
      <template v-else-if="payload?.kind === 'rich_text_preview'">
        <div v-show="state === 'ready'" ref="bodyEl" class="rich-body"></div>
        <p v-if="state === 'loading'" class="empty">Loading rich text…</p>
        <p v-else-if="state === 'rtf'" class="empty">This item only has RTF. An HTML preview is not available.</p>
        <p v-else-if="state === 'missing'" class="empty">The original rich text is no longer available.</p>
        <p v-else-if="state === 'error'" class="empty">Rich text could not be loaded.</p>
      </template>
      <div v-else class="empty">Awaiting formatted text</div>
    </main>
  </div>
</template>

<style scoped>
.viewport { height: 100%; overflow: auto; }
.shell {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 13px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-weight: 500;
}

.meta-sep {
  color: var(--clipbus-border, #e2e8f0);
}

.md-body {
  color: var(--clipbus-text-primary, #0f172a);
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: break-word;
}

.md-body :deep(h1),
.md-body :deep(h2),
.md-body :deep(h3),
.md-body :deep(h4),
.md-body :deep(h5),
.md-body :deep(h6) {
  margin: 0 0 6px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--clipbus-text-primary, #0f172a);
}

.md-body :deep(h1) { font-size: 17px; }
.md-body :deep(h2) { font-size: 15px; }
.md-body :deep(h3),
.md-body :deep(h4),
.md-body :deep(h5),
.md-body :deep(h6) { font-size: 13px; }

.md-body :deep(p) {
  margin: 0 0 8px;
  color: var(--clipbus-text-primary, #0f172a);
}

.md-body :deep(p:last-child) {
  margin-bottom: 0;
}

.md-body :deep(strong) {
  font-weight: 600;
  color: var(--clipbus-text-primary, #0f172a);
}

.md-body :deep(em) {
  font-style: italic;
  color: var(--clipbus-text-secondary, #64748b);
}

.md-body :deep(code) {
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 11px;
  background: var(--clipbus-surface-elevated, #f1f5f9);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 3px;
  padding: 1px 4px;
  color: var(--clipbus-text-primary, #0f172a);
}

.md-body :deep(pre) {
  background: var(--clipbus-surface-elevated, #f8fafc);
  border: 1px solid var(--clipbus-border, #e2e8f0);
  border-radius: 6px;
  padding: 8px 10px;
  overflow-x: auto;
  margin: 0 0 8px;
}

.md-body :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--clipbus-text-primary, #0f172a);
}

.md-body :deep(ul),
.md-body :deep(ol) {
  margin: 0 0 8px;
  padding-left: 20px;
  color: var(--clipbus-text-primary, #0f172a);
}

.md-body :deep(li) {
  margin-bottom: 3px;
  line-height: 1.5;
}

.md-body :deep(blockquote) {
  margin: 0 0 8px;
  padding: 4px 10px;
  border-left: 3px solid var(--clipbus-accent, #0ea5e9);
  color: var(--clipbus-text-secondary, #64748b);
  font-style: italic;
}

.md-body :deep(a) {
  color: var(--clipbus-accent, #0ea5e9);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.rich-body { overflow-wrap: break-word; line-height: 1.6; }
.rich-body :deep(p), .rich-body :deep(blockquote), .rich-body :deep(pre),
.rich-body :deep(ul), .rich-body :deep(ol), .rich-body :deep(table) { margin: 0 0 10px; }
.rich-body :deep(h1), .rich-body :deep(h2), .rich-body :deep(h3),
.rich-body :deep(h4), .rich-body :deep(h5), .rich-body :deep(h6) { margin: 0 0 8px; line-height: 1.35; }
.rich-body :deep(h1) { font-size: 20px; }
.rich-body :deep(h2) { font-size: 17px; }
.rich-body :deep(h3) { font-size: 15px; }
.rich-body :deep(ul), .rich-body :deep(ol) { padding-left: 24px; }
.rich-body :deep(blockquote) { padding-left: 10px; border-left: 3px solid var(--clipbus-border, #cbd5e1); }
.rich-body :deep(pre) { padding: 8px; overflow-x: auto; white-space: pre-wrap; background: var(--clipbus-surface-elevated, #f1f5f9); }
.rich-body :deep(code) { font-family: "SF Mono", "Menlo", monospace; font-size: 12px; }
.rich-body :deep(a) { color: var(--clipbus-accent, #2563eb); text-underline-offset: 2px; }
.rich-body :deep(table) { border-collapse: collapse; max-width: 100%; }
.rich-body :deep(th), .rich-body :deep(td) { border: 1px solid var(--clipbus-border, #cbd5e1); padding: 4px 7px; }

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
