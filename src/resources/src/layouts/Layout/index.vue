<template>
  <!-- main start -->
  <div class="main full-width" :class="{ 'no-transition': disableTransition }">
    <div class="content-wrapper container-xxl px-2 px-sm-3">
      <Header
        :is-scrolled="headerScrolled"
        :theme-mode="themeMode"
        :on-logout="logout"
        :on-toggle-theme="ui.cycleTheme" />
      <!-- content start -->
      <div class="content">
        <router-view />
      </div>
      <!-- content end -->
      <Footer />
    </div>
  </div>
  <!-- main end -->
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onBeforeUnmount, onMounted, provide, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import Footer from "@/layouts/Layout/Footer.vue";
import Header from "@/layouts/Layout/Header.vue";
import { useAdminUiStore } from "@/stores/admin-ui";
import { useAuthStore } from "@/stores/auth";

const ui = useAdminUiStore();
const auth = useAuthStore();
const router = useRouter();
const { themeMode } = storeToRefs(ui);
const headerScrolled = ref(false);
const disableTransition = ref(true);
const featureButtons = reactive<
  Array<{
    id: symbol;
    icon?: string;
    label: string;
    title: string;
    attrs?: Record<string, string>;
    onClick: () => void;
  }>
>([]);
provide("featureButtons", featureButtons);

async function logout() {
  await auth.logout();
  await router.push("/login");
}

function onScroll() {
  const y = window.scrollY;
  if (y > 20) {
    headerScrolled.value = true;
  } else if (y < 5) {
    headerScrolled.value = false;
  }
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Force reflow then enable transitions on next frame
  void document.body.offsetHeight;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      disableTransition.value = false;
    });
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped>
.main.full-width {
  padding-left: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}

@media (max-width: 576px) {
  .main.full-width {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
</style>
