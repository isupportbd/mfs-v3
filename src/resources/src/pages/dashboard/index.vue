<template>
  <Pagebar title="Dashboard" />

  <div class="dashboard-content">
    <div class="row g-3 mb-3">
      <!-- 1. ইউজার্স ও সাবস্ক্রিপশন -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <div class="me-2 text-primary fs-4">
                <i class="bi bi-people"></i>
              </div>
              <h5 class="card-title mb-0 fs-6 fw-semibold">Users & Subscriptions</h5>
            </div>
            <div id="card-users-content">
              <!-- কোন কার্ডে কি হবে তা ইউজার পরবর্তী নির্দেশনায় জানাবেন -->
            </div>
          </div>
        </div>
      </div>

      <!-- 2. প্লানস -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100">
          <div class="card-body">
            <PlansCard />
          </div>
        </div>
      </div>

      <!-- 3. একাউন্টস -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <div class="me-2 text-info fs-4">
                <i class="bi bi-wallet2"></i>
              </div>
              <h5 class="card-title mb-0 fs-6 fw-semibold">Accounts</h5>
            </div>
            <div id="card-accounts-content">
              <!-- কোন কার্ডে কি হবে তা ইউজার পরবর্তী নির্দেশনায় জানাবেন -->
            </div>
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
