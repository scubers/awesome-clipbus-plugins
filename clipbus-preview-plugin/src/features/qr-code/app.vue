<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import qrcode from "qrcode-generator";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeQrPayload } from "./payload";

const MARGIN = 4;

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeQrPayload(attachmentPayload.value?.attachment?.payloadJson)
);

const qrSvgData = computed(() => {
  if (!payload.value) return null;
  const qr = qrcode(0, "M");
  qr.addData(payload.value.url);
  qr.make();
  const count = qr.getModuleCount();
  const size = count + 2 * MARGIN;
  let d = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        d += `M${c + MARGIN} ${r + MARGIN}h1v1h-1z`;
      }
    }
  }
  return { size, d };
});

let unsub: (() => void) | null = null;

onMounted(async () => {
  try {
    await clipbus.attachmentRenderer.setButtons({
      buttons: [{ id: "copy-url", title: "Copy URL" }],
    });
  } catch {
    /* not in attachment renderer context */
  }

  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy-url" && payload.value) {
      await clipbus.clipboard.copyText({ text: payload.value.url });
    }
  });
});

onUnmounted(() => {
  unsub?.();
});
</script>

<template>
  <main class="shell">
    <section v-if="payload && qrSvgData" class="content">
      <div class="qr-wrapper">
        <!-- QR SVG: dark fill="#000000" and background fill="#ffffff" are SVG
             presentation attributes — functional data colors, not chrome CSS -->
        <svg
          :viewBox="`0 0 ${qrSvgData.size} ${qrSvgData.size}`"
          xmlns="http://www.w3.org/2000/svg"
          class="qr-svg"
          role="img"
          :aria-label="`QR code for ${payload.url}`"
        >
          <rect
            :width="qrSvgData.size"
            :height="qrSvgData.size"
            fill="#ffffff"
          />
          <path :d="qrSvgData.d" fill="#000000" />
        </svg>
      </div>
      <div class="url-label">
        <span class="url-type">{{ payload.display.typeLabel }}</span>
        <span class="url-text">{{ payload.display.headline }}</span>
      </div>
    </section>
    <div v-else class="empty">No URL detected</div>
  </main>
</template>

<style scoped>
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
  align-items: center;
  gap: 8px;
}

.qr-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fixed 180px box — QR modules scale inside the SVG viewBox */
.qr-svg {
  width: 180px;
  height: 180px;
  display: block;
}

.url-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
}

.url-type {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--clipbus-text-secondary, #64748b);
}

.url-text {
  font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Code", monospace;
  font-size: 12px;
  color: var(--clipbus-text-primary, #0f172a);
  word-break: break-all;
  text-align: center;
}

.empty {
  padding: 20px;
  text-align: center;
  color: var(--clipbus-text-tertiary, #94a3b8);
  font-size: 13px;
}
</style>
