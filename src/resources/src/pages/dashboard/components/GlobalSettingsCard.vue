<template>
  <div class="d-flex flex-column justify-content-between h-100">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center">
        <div class="me-2 text-primary fs-5">
          <i class="bi bi-gear-wide-connected"></i>
        </div>
        <h5 class="card-title mb-0 fs-6 fw-semibold">Global Settings</h5>
      </div>

      <router-link
        v-if="isSuperAdmin"
        to="/admin/settings"
        class="btn btn-sm btn-outline-primary">
        <i class="bi bi-sliders me-1"></i>Manage
      </router-link>
    </div>

    <div class="py-2">
      <div v-if="loading" class="text-muted small">
        <span class="spinner-border spinner-border-sm text-primary me-1" role="status"></span>
        Loading...
      </div>
      <div v-else class="d-flex align-items-baseline">
        <span class="display-6 fw-bold me-2">{{ activeProvidersCount }}</span>
        <span class="text-muted small">Active Providers</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();
const isSuperAdmin = computed(() => user.value?.role?.name === "superadmin");
const activeProvidersCount = ref(0);
const loading = ref(false);

async function fetchProvidersCount() {
  loading.value = true;
  try {
    const res = await axios.get("/api/settings/providers");
    activeProvidersCount.value = res.data?.data?.length || 0;
  } catch (e) {
    console.error("Failed to load providers count", e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProvidersCount();
});
</script>
