<template>
  <div class="pagebar-container mb-2" style="padding-top: 5px; padding-bottom: 5px;">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb m-0 small fst-italic align-items-center" style="font-size: 0.85rem;">
        <li class="breadcrumb-item">
          <router-link to="/" class="text-decoration-none text-muted">
            <i class="bi bi-house-door me-1"></i>হোম
          </router-link>
        </li>
        <li
          v-if="props.title && props.title.toLowerCase() !== 'dashboard' && props.title !== 'হোম'"
          class="breadcrumb-item active fw-medium"
          style="color: var(--bs-body-color) !important;"
          aria-current="page">
          {{ props.title }}
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useSlots } from "vue";

defineOptions({ name: "PageBar", inheritAttrs: false });

interface PageBarProps {
  title?: string;
}

const props = defineProps<PageBarProps>();
const slots = useSlots();

const target = ref<HTMLElement | null>(null);

onMounted(() => {
  target.value = document.getElementById("pagebar");
});
</script>

<style lang="scss" scoped>
.breadcrumb {
  --bs-breadcrumb-item-padding-x: 0.25rem;
}
.breadcrumb-item + .breadcrumb-item {
  padding-left: 0.25rem !important;
  &::before {
    padding-right: 0.25rem !important;
  }
}
:global(html.theme-dark .breadcrumb-item.active) {
  color: #f8fafc !important;
}
:global(html.theme-light .breadcrumb-item.active) {
  color: #1e293b !important;
}
</style>
