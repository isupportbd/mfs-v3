<template>
  <div class="pagebar-container pt-1 pb-1 mb-2">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb m-0 small fst-italic align-items-center" style="font-size: 0.825rem;">
        <li class="breadcrumb-item">
          <router-link to="/" class="text-decoration-none text-muted">
            <i class="bi bi-house-door me-1"></i>Dashboard
          </router-link>
        </li>
        <li v-if="props.title && props.title.toLowerCase() !== 'dashboard'" class="breadcrumb-item active fw-medium text-dark" aria-current="page">
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

<style lang="scss" scoped></style>
