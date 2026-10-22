<template>
  <Pagebar title="Dashboard" />

  <div class="dashboard-content">
    <div class="row g-3 mb-3">
      <!-- 1. ইউজার্স ও সাবস্ক্রিপশন -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border shadow-sm h-100">
          <div class="card-body d-flex flex-column justify-content-between">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center">
                <div class="me-2 text-primary fs-5">
                  <i class="bi bi-people"></i>
                </div>
                <h5 class="card-title mb-0 fs-6 fw-semibold">Users</h5>
              </div>
              <button type="button" class="btn btn-sm btn-outline-primary" disabled>
                <i class="bi bi-person-gear me-1"></i>Manage
              </button>
            </div>
            <div class="py-2">
              <div class="d-flex align-items-baseline">
                <span class="display-6 fw-bold me-2">--</span>
                <span class="text-muted small">Total Subscriptions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. প্লানস -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border shadow-sm h-100">
          <div class="card-body">
            <PlansCard />
          </div>
        </div>
      </div>

      <!-- 3. একাউন্টস -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border shadow-sm h-100">
          <div class="card-body d-flex flex-column justify-content-between">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center">
                <div class="me-2 text-info fs-5">
                  <i class="bi bi-wallet2"></i>
                </div>
                <h5 class="card-title mb-0 fs-6 fw-semibold">Accounts</h5>
              </div>
              <button type="button" class="btn btn-sm btn-outline-info" disabled>
                <i class="bi bi-wallet me-1"></i>Manage
              </button>
            </div>
            <div class="py-2">
              <div class="d-flex align-items-baseline">
                <span class="display-6 fw-bold me-2">--</span>
                <span class="text-muted small">Connected Accounts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. এডমিন গ্লোবাল সেটিংস -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border shadow-sm h-100">
          <div class="card-body">
            <GlobalSettingsCard />
          </div>
        </div>
      </div>
    </div>

    <div class="placeholder-panel"></div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { onMounted, onUnmounted } from "vue";
import Pagebar from "@/components/Pagebar.vue";
import { useAuth } from "@/composables/useAuth";
import { pulse } from "@/plugins/pulse";
import GlobalSettingsCard from "./components/GlobalSettingsCard.vue";
import PlansCard from "./components/PlansCard.vue";

useHead({ title: "Dashboard" });

const { user } = useAuth();

onMounted(() => {
  const ch = pulse.channel("user");
  ch.listen("user.changed", () => alert("me"));
  onUnmounted(() => ch.stopListening("user.changed"));
});

// const hardRefresh = () => window.location.reload();
</script>

<style scoped>
.placeholder-card,
.placeholder-panel {
  border: 1px solid var(--app-border);
  border-radius: 0.3rem;
  background: var(--app-surface);
}

.placeholder-card {
  min-height: 220px;
}

.placeholder-panel {
  min-height: 520px;
}

@media (max-width: 768px) {
  .placeholder-card {
    min-height: 160px;
  }

  .placeholder-panel {
    min-height: 360px;
  }
}
</style>
