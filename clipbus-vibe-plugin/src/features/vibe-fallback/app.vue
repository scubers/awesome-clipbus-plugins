<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import type { PluginAttachmentPayload } from "@clipbus/plugin-sdk/ui";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeVibePayload } from "./payload";
import { ANIMATIONS } from "./animations/index";
import type { VibeAnimationInstance } from "./animations/types";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeVibePayload((attachmentPayload.value as PluginAttachmentPayload | undefined)?.attachment?.payloadJson));

const stageEl = ref<HTMLElement | null>(null);
const index = ref(0);
let instance: VibeAnimationInstance | null = null;

function mount() {
  instance?.dispose(); instance = null;
  const host = stageEl.value;
  if (!host) return;
  instance = ANIMATIONS[index.value].create({ container: host, text: payload.value?.text ?? "" });
  instance.start();
}

function shuffle() {
  if (ANIMATIONS.length <= 1) { instance?.replay(); return; }
  index.value = (index.value + 1) % ANIMATIONS.length;
  mount();
}

onMounted(() => {
  index.value = ANIMATIONS.length > 1 ? Math.floor(Math.random() * ANIMATIONS.length) : 0;
  mount();
});
watch(payload, () => mount());   // 切换剪贴板项时重建
onUnmounted(() => { instance?.dispose(); instance = null; });

const currentLabel = computed(() => ANIMATIONS[index.value]?.label ?? "");
const btnLabel = computed(() => (ANIMATIONS.length > 1 ? currentLabel.value : "Replay"));
</script>

<template>
  <main class="shell">
    <div ref="stageEl" class="stage"></div>
    <button class="switch" type="button" @click="shuffle">
      <span class="ico" aria-hidden="true">⟳</span>{{ btnLabel }}
    </button>
  </main>
</template>

<style scoped>
.shell {
  position: relative; width: 100%; height: 100%; padding: 0; overflow: hidden;
  /* 动画卡的深色"太空"背景：情绪动画视觉本质（经设计批准的例外） */
  background: radial-gradient(120% 120% at 50% 38%, #0b0b1a 0%, #06060d 55%, #030308 100%);
}
.stage { position: absolute; inset: 0; }
.stage :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }
.switch {
  position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 999px; cursor: pointer;
  font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
  color: rgba(234, 246, 255, 0.92);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}
.switch:hover { background: rgba(124, 92, 255, 0.22); border-color: rgba(124, 92, 255, 0.5); }
.switch:active { transform: translateX(-50%) scale(0.96); }
.ico { font-size: 13px; line-height: 1; }
</style>
