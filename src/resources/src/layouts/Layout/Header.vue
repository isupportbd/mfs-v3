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
