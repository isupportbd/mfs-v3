<template>
  <div>
    <!-- কার্ডের একদম শীর্ষ হেডার: বামে টাইটেল ও কাউন্ট, ডানে নতুন ট্যাবে অ্যাড বাটন -->
    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
      <div class="d-flex align-items-center">
        <div class="me-2 text-success fs-5">
          <i class="bi bi-card-checklist"></i>
        </div>
        <h5 class="card-title mb-0 fs-6 fw-semibold me-2">Plans</h5>
        <span class="badge bg-success-subtle text-success small" title="Active Plans">{{ activeCount }} Active</span>
      </div>
      
      <!-- মূল পেজে প্ল্যান তৈরি পেজ ওপেন করার বাটন -->
      <router-link
        v-if="isSuperAdmin"
        to="/plans/create"
        class="btn btn-sm btn-success">
        <i class="bi bi-plus-lg me-1"></i>Add Plan
      </router-link>
    </div>

    <!-- প্ল্যানের তালিকা -->
    <div v-if="loading" class="text-center py-3">
      <span class="spinner-border spinner-border-sm text-success" role="status"></span>
    </div>

    <div v-else-if="plansList.length === 0" class="text-center py-2 text-muted small">
      No plans created yet.
    </div>

    <div v-else class="list-group list-group-flush small">
      <div
        v-for="plan in plansList"
        :key="plan.id"
        class="list-group-item px-0 d-flex justify-content-between align-items-center">
        <div>
          <span class="fw-semibold text-dark">{{ plan.name }}</span>
          <span
            v-if="!plan.maxMfsAccounts || Number(plan.maxMfsAccounts) === 0"
            class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
            Unlimited MFS
          </span>
          <span
            v-else
            class="badge bg-warning-subtle text-dark border border-warning-subtle ms-2">
            {{ plan.maxMfsAccounts }} MFS
          </span>
          <span class="badge bg-light text-dark border ms-1">{{ plan.durationDays }} Days</span>
        </div>
        <div class="d-flex align-items-center">
          <span class="fw-bold me-2">৳{{ Number(plan.price).toLocaleString() }}</span>
          <button
            v-if="isSuperAdmin"
            type="button"
            class="btn btn-sm btn-link p-0 text-decoration-none"
            :class="plan.isActive ? 'text-danger' : 'text-success'"
            :title="plan.isActive ? 'Deactivate' : 'Activate'"
            @click="toggleStatus(plan.id)">
            <i :class="plan.isActive ? 'bi bi-pause-circle' : 'bi bi-play-circle'"></i>
          </button>
        </div>
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

async function toggleStatus(id: number) {
  try {
    await axios.patch(`/api/subscription/${id}/toggle`);
    await fetchPlans();
  } catch (e) {
    console.error("Failed to toggle plan status", e);
  }
}

onMounted(() => {
  fetchPlans();
});
</script>
