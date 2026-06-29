<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import type { PluginAttachmentPayload } from "@clipbus/plugin-sdk/ui";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeVibePayload } from "./payload";
import { ANIMATIONS } from "./animations/index";
import type { VibeAnimationInstance } from "./animations/types";
import { resolveAnimationList, buildButtons, indexForButton, type AnimationMeta } from "./switching";

// User-configurable animation list. Read-only setting (host writes, plugin reads).
// Settings live in a flat, shared JSON store, so the key is namespaced with the
// plugin id. Value = a JSON array of animation ids (or a comma/space-separated
// string), e.g. ["text-loop","particle-core"]. Only the listed animations are
// shown (one button each, in order) and the FIRST is displayed on load. Unset or
// invalid -> all animations in default order.
const ANIMATIONS_SETTING_KEY = "plugin.vibe.animations";
const ALL_METAS: AnimationMeta[] = ANIMATIONS.map((a) => ({ id: a.id, label: a.label }));

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeVibePayload((attachmentPayload.value as PluginAttachmentPayload | undefined)?.attachment?.payloadJson));

const stageEl = ref<HTMLElement | null>(null);
const activeList = ref<AnimationMeta[]>(ALL_METAS);
const index = ref(0);
let instance: VibeAnimationInstance | null = null;
let unsubHostInvoke: (() => void) | null = null;

function mount() {
  instance?.dispose(); instance = null;
  const host = stageEl.value;
  const id = activeList.value[index.value]?.id;
  const anim = ANIMATIONS.find((a) => a.id === id);
  if (!host || !anim) return;
  instance = anim.create({ container: host, text: payload.value?.text ?? "" });
  instance.start();
}

// Push the native button bar once (one enabled button per listed animation).
async function pushButtons() {
  try {
    await clipbus.attachmentRenderer.setButtons({ buttons: buildButtons(activeList.value) });
  } catch {
    /* not an attachmentRenderer context (e.g. dev preview) — ignore */
  }
}

function switchTo(buttonID: string) {
  const next = indexForButton(activeList.value, buttonID, index.value);
  if (next === index.value) { instance?.replay(); return; }
  index.value = next;
  mount();
}

async function readAnimationsSetting(): Promise<unknown> {
  try {
    const { value } = await clipbus.settings.get({ key: ANIMATIONS_SETTING_KEY });
    return value;
  } catch {
    return null;
  }
}

async function init() {
  const setting = await readAnimationsSetting();
  activeList.value = resolveAnimationList(setting, ALL_METAS);
  index.value = 0;                 // default shows the first listed animation
  mount();
  void pushButtons();
  unsubHostInvoke = clipbus.attachmentRenderer.onHostInvoke.on(({ buttonID }) => switchTo(buttonID));
}

onMounted(() => { void init(); });
watch(payload, () => mount());   // 切换剪贴板项时重建（保留当前选择的动画）
onUnmounted(() => {
  unsubHostInvoke?.(); unsubHostInvoke = null;
  instance?.dispose(); instance = null;
});
</script>

<template>
  <main class="shell">
    <div ref="stageEl" class="stage"></div>
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
</style>
