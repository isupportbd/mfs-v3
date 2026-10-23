<template>
  <header :class="{ scrolled: isScrolled }">
    <nav class="navbar bg-transparent p-0">
      <div class="container-fluid p-0 d-flex align-items-center justify-content-between gap-2 flex-nowrap">
        <!-- Brand / Logo & Name -->
        <div class="card card-body nav-card d-flex align-items-center flex-row flex-grow-1 overflow-hidden" style="min-width: 0;">
          <router-link to="/" class="d-flex align-items-center text-decoration-none text-truncate" style="color: inherit;">
            <img src="@/assets/images/logo.svg" alt="MFS Ledger Logo" class="me-2 flex-shrink-0" style="width: 28px; height: 36px; object-fit: contain;" />
            <p class="m-0 fs-5 fs-sm-4 text-truncate" style="color: inherit;">MFS Ledger</p>
          </router-link>
        </div>

        <!-- Header Actions (Buttons) -->
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          <template v-for="btn in featureButtons" :key="btn.id">
            <button v-if="!btn.render" type="button" class="nav-btn" :class="btn.class" :title="btn.title || undefined" :aria-label="btn.label || 'button'" v-bind="btn.attrs" @click="btn.onClick">
              <i v-if="btn.icon" :class="btn.icon"></i>
              <span v-if="btn.label" class="ms-1 d-none d-sm-inline">{{ btn.label }}</span>
            </button>
            <template v-else>
              <component :is="featureComponent(btn)" />
            </template>
          </template>

          <!-- Font switch & preview dropdown -->
          <div class="dropdown">
            <button
              id="font-switch"
              type="button"
              class="nav-btn d-inline-flex align-items-center gap-1 px-2"
              title="বাংলা ফন্ট নির্বাচন ও টেস্ট করুন"
              data-bs-toggle="dropdown"
              data-bs-display="static"
              aria-expanded="false"
              style="width: auto; min-width: 38px;">
              <i class="bi bi-fonts fs-5"></i>
              <span class="d-none d-lg-inline small fw-semibold" style="font-size: 11px;">
                {{ ui.activeFont.englishName }}
              </span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-lg border p-2" style="min-width: 290px; max-width: 330px; z-index: 1060;">
              <li class="px-2 py-1 mb-1 border-bottom">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="small fw-bold text-primary">
                    <i class="bi bi-type me-1"></i>বাংলা ফন্ট নির্বাচন
                  </span>
                  <span class="badge bg-primary-subtle text-primary border">Google Fonts</span>
                </div>
                <div class="text-muted" style="font-size: 11px;">ক্লিক করলেই লাইভ পুরো ড্যাশবোর্ডে ফন্ট পরিবর্তন হবে</div>
              </li>
              <li v-for="font in BANGLA_FONTS" :key="font.id" class="my-1">
                <button
                  type="button"
                  class="dropdown-item rounded-2 p-2 d-flex flex-column align-items-start transition-all"
                  :class="{ 'active bg-primary text-white': ui.currentFontId === font.id }"
                  @click="ui.applyFont(font.id)">
                  <div class="w-100 d-flex align-items-center justify-content-between">
                    <span class="fw-bold fs-6" :style="{ fontFamily: font.fontFamily }">
                      {{ font.name }}
                    </span>
                    <span
                      v-if="font.badge"
                      class="badge"
                      :class="ui.currentFontId === font.id ? 'bg-light text-dark' : 'bg-success-subtle text-success'"
                      style="font-size: 10px;">
                      {{ font.badge }}
                    </span>
                    <i v-else-if="ui.currentFontId === font.id" class="bi bi-check-lg"></i>
                  </div>
                  <div
                    class="w-100 mt-1 d-flex justify-content-between align-items-center opacity-75"
                    style="font-size: 12px;"
                    :style="{ fontFamily: font.fontFamily }">
                    <span>নমুনা: কাস্টমার, পুঁজি, লেনদেন ১২৩৪৫</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>

          <!-- Theme toggle -->
          <button id="theme-switch" type="button" title="theme" class="nav-btn" aria-label="button" @click="props.onToggleTheme">
            <i :class="themeIconClass"></i>
          </button>

          <!-- User dropdown -->
          <div class="btn-group">
            <button type="button" class="nav-btn" title="user" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" aria-label="button">
              <i class="bi bi-person-circle"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <div class="dropdown-item">
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-0 me-2">
                      <i class="bi bi-person-circle fs-3"></i>
                    </div>
                    <div class="flex-grow-1 text-capitalize">
                      <h6 class="mb-0 fs-6">{{ authUser?.name }}</h6>
                      <small class="text-muted">{{ authUser?.role?.name }}</small>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div class="dropdown-divider my-1"></div>
              </li>
              <li>
                <button type="button" class="dropdown-item" @click="props.onLogout">
                  <i class="bi bi-power me-2"></i><span>Log Out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed, h, inject } from "vue";
import { authUser } from "@/composables/useAuth";
import { BANGLA_FONTS, useAdminUiStore } from "@/stores/admin-ui";

const ui = useAdminUiStore();

interface ButtonEntry {
  id: symbol;
  icon?: string;
  label: string;
  title: string;
  attrs?: Record<string, string>;
  class?: any;
  onClick: () => void;
  render?: () => any[];
}

const featureButtons = inject<ButtonEntry[]>("featureButtons")!;

function featureComponent(btn: ButtonEntry) {
  return {
    name: "FeatureSlot",
    render: () => h("div", { class: ["order-3 order-sm-4", btn.class] }, btn.render!())
  };
}

interface HeaderProps {
  isScrolled: boolean;
  themeMode: "light" | "dark" | "auto";
  onLogout: () => void | Promise<void>;
  onToggleTheme: () => void;
}

const props = defineProps<HeaderProps>();

const themeIconClass = computed(() => {
  if (props.themeMode === "light") return "bi bi-brightness-high-fill";
  if (props.themeMode === "dark") return "bi bi-moon-stars";
  return "bi bi-circle-half";
});
</script>

<style lang="scss" scoped></style>
