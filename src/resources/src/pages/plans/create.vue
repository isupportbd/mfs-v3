<template>
  <Pagebar title="Plans" />
  <Toast ref="toastRef" />

  <div class="plans-management">
    <!-- ১. শীর্ষ ইনলাইন অ্যাড প্ল্যান ফর্ম (স্কেচ অনুযায়ী) -->
    <div class="card border shadow-sm mb-4">
      <div class="card-body py-3">
        <form @submit.prevent="submitPlan">
          <div class="row g-2 align-items-end">
            <!-- Plan Name -->
            <div class="col-12 col-md-3">
              <Input
                id="name"
                v-model="form.data.name"
                type="text"
                label="Plan Name"
                placeholder="e.g. Standard"
                topclass="mb-0"
                :err="form.errors.name"
                focus
                must />
            </div>

            <!-- Price -->
            <div class="col-6 col-md-2">
              <Input
                id="price"
                v-model="form.data.price"
                type="number"
                label="Price (৳)"
                placeholder="e.g. 500"
                topclass="mb-0"
                :err="form.errors.price"
                must />
            </div>

            <!-- Duration -->
            <div class="col-6 col-md-2">
              <Input
                id="durationDays"
                v-model="form.data.durationDays"
                type="number"
                label="Duration (Days)"
                placeholder="e.g. 30"
                topclass="mb-0"
                :err="form.errors.durationDays"
                must />
            </div>

            <!-- Yearly Discount -->
            <div class="col-6 col-md-2">
              <Input
                id="yearlyDiscount"
                v-model="form.data.yearlyDiscount"
                type="number"
                label="Yearly Disc. (%)"
                placeholder="e.g. 10"
                topclass="mb-0"
                :err="form.errors.yearlyDiscount" />
            </div>

            <!-- MFS Accounts Limit -->
            <div class="col-6 col-md-2">
              <Input
                id="maxMfsAccounts"
                v-model="form.data.maxMfsAccounts"
                type="number"
                label="MFS Limit (0=Unlimited)"
                placeholder="e.g. 2 or 0"
                topclass="mb-0"
                :err="form.errors.maxMfsAccounts" />
            </div>

            <!-- Add Button -->
            <div class="col-12 col-md-1">
              <Button
                type="submit"
                class="btn btn-success w-100 fw-semibold"
                style="height: 37.6px; line-height: 1;"
                label="Add"
                icon="bi bi-plus-lg"
                :disabled="saving" />
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ২. নিচে All Plans এরিয়া (স্কেচ অনুযায়ী) -->
    <div class="card border shadow-sm">
      <div class="card-header bg-transparent py-2 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fs-6 fw-bold text-dark">
          <i class="bi bi-card-checklist me-1 text-success"></i>All Plans
        </h5>
        <span class="badge bg-light text-dark border">{{ plansList.length }} Plans</span>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-4">
          <span class="spinner-border spinner-border-sm text-success" role="status"></span>
        </div>

        <div v-else-if="plansList.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-3 d-block mb-1"></i>
          <span>No plans found. Add your first plan above.</span>
        </div>

        <!-- Plans Table (ফ্রেমওয়ার্ক রেসপনসিভ টেবিল) -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light small text-muted">
              <tr>
                <th scope="col" class="ps-3">#</th>
                <th scope="col">Plan Name</th>
                <th scope="col">MFS Accounts</th>
                <th scope="col">Price</th>
                <th scope="col">Duration</th>
                <th scope="col">Yearly Discount</th>
                <th scope="col">Status</th>
                <th scope="col" class="text-end pe-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(plan, idx) in plansList" :key="plan.id">
                <td class="ps-3 text-muted small">{{ idx + 1 }}</td>
                <td class="fw-semibold text-dark">{{ plan.name }}</td>
                <td>
                  <span
                    v-if="!plan.maxMfsAccounts || Number(plan.maxMfsAccounts) === 0"
                    class="badge bg-primary-subtle text-primary border border-primary-subtle">
                    <i class="bi bi-infinity me-1"></i>Unlimited
                  </span>
                  <span
                    v-else
                    class="badge bg-warning-subtle text-dark border border-warning-subtle">
                    Any {{ plan.maxMfsAccounts }} Accounts
                  </span>
                </td>
                <td class="fw-bold text-success">৳{{ Number(plan.price).toLocaleString() }}</td>
                <td>
                  <span class="badge bg-light text-dark border">{{ plan.durationDays }} Days</span>
                </td>
                <td>
                  <span v-if="Number(plan.yearlyDiscount) > 0" class="badge bg-info-subtle text-info">
                    {{ plan.yearlyDiscount }}% OFF
                  </span>
                  <span v-else class="text-muted small">0%</span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="plan.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ plan.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end pe-3">
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="plan.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                    :title="plan.isActive ? 'Deactivate' : 'Activate'"
                    @click="toggleStatus(plan.id)">
                    <i :class="plan.isActive ? 'bi bi-pause-circle me-1' : 'bi bi-play-circle me-1'"></i>
                    {{ plan.isActive ? 'Pause' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { useHead } from "@vueuse/head";
import { onMounted, ref } from "vue";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Pagebar from "@/components/Pagebar.vue";
import Toast from "@/components/Toast.vue";
import { useGumForm } from "@/plugins/gum";

useHead({ title: "Plans Management" });

interface PlanItem {
  id: number;
  name: string;
  price: string;
  durationDays: number;
  yearlyDiscount: string;
  maxMfsAccounts: number | null;
  isActive: boolean;
}

const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const plansList = ref<PlanItem[]>([]);
const loading = ref(false);
const saving = ref(false);

const form = useGumForm({
  name: "",
  price: 0,
  durationDays: 30,
  yearlyDiscount: 0,
  maxMfsAccounts: "" as string | number
});

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

async function submitPlan() {
  saving.value = true;

  try {
    const numLimit = Number(form.data.maxMfsAccounts);
    const accountsLimit = !isNaN(numLimit) && numLimit > 0 ? numLimit : null;

    await axios.post("/api/subscription", {
      name: String(form.data.name || "").trim(),
      price: Number(form.data.price),
      durationDays: Number(form.data.durationDays),
      yearlyDiscount: Number(form.data.yearlyDiscount || 0),
      maxMfsAccounts: accountsLimit && accountsLimit > 0 ? accountsLimit : null
    });

    toastRef.value?.toastme("Plan added successfully!", "success");
    form.reset();
    await fetchPlans();
  } catch (err: any) {
    const msg = err.response?.data?.message || "Failed to create plan. Please verify the input.";
    toastRef.value?.toastme(msg, "danger");
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(id: number) {
  try {
    await axios.patch(`/api/subscription/${id}/toggle`);
    toastRef.value?.toastme("Plan status updated", "info");
    await fetchPlans();
  } catch (e) {
    toastRef.value?.toastme("Failed to update status", "danger");
  }
}

onMounted(() => {
  fetchPlans();
});
</script>

<style scoped></style>
