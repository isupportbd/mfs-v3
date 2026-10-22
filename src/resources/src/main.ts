import "@/plugins/axios";
import { createHead } from "@vueuse/head";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { DialogPlugin } from "@/plugins/dialog";
import { GumPlugin } from "@/plugins/gum";
import { PulsePlugin } from "@/plugins/pulse";
import App from "./App.vue";
import router from "./router";
import { useAdminUiStore } from "@/stores/admin-ui";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/assets/scss/custom.scss";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const app = createApp(App);
const pinia = createPinia();
const head = createHead({ titleTemplate: (title) => (title ? `${title} | MFS Ledger` : "MFS Ledger") });

app.use(pinia);
app.use(router);
app.use(head);
app.use(DialogPlugin);
app.use(GumPlugin);
app.use(PulsePlugin);

// Single source of truth for the theme: index.html already applied the class
// before the first paint, here we only sync the store state.
useAdminUiStore(pinia).initTheme();

app.mount("#app");
