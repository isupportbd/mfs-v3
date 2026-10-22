<template>
  <div class="d-flex flex-column justify-content-between h-100">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center">
        <div class="me-2 text-success fs-5">
          <i class="bi bi-card-checklist"></i>
        </div>
        <h5 class="card-title mb-0 fs-6 fw-semibold">Plans</h5>
      </div>

      <router-link
        v-if="isSuperAdmin"
        to="/plans/create"
        class="btn btn-sm btn-outline-success">
        <i class="bi bi-sliders me-1"></i>Manage
      </router-link>
    </div>

    <div class="py-2">
      <div v-if="loading" class="text-muted small">
        <span class="spinner-border spinner-border-sm text-success me-1" role="status"></span>
        Loading...
      </div>
      <div v-else class="d-flex align-items-baseline">
        <span class="display-6 fw-bold me-2">{{ activeCount }}</span>
        <span class="text-muted small">Total Active Plans</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";

interface PlanItem {
  id: number;
  name: string;
  description?: string;
  price: string;
  durationDays: number;
  maxMfsAccounts?: number | null;
  isActive: boolean;
}

const { user } = useAuth();
const isSuperAdmin = computed(() => user.value?.role?.name === "superadmin");

const plansList = ref<PlanItem[]>([]);
const loading = ref(false);

const activeCount = computed(() => plansList.value.filter((p) => p.isActive).length);

async function fetchPlans() {
  loading.value = true;
  try {
    const res = await axios.get("/api/subscription");
    plansList.value = res.data?.data || [];
  } catch (e) {
    console.error("Failed to load plans", e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchPlans();
});
</script>
