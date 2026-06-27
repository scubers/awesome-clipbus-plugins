import { patchConsole, patchTextInputState } from "@clipbus/plugin-sdk/dom";
patchConsole();
patchTextInputState();
import { createApp } from "vue";
import App from "./app.vue";
import "../../shared/base.css";
createApp(App).mount("#app");
