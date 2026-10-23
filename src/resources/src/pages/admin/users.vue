<template>
  <Pagebar title="Users & Subscriptions" />
  <Toast ref="toastRef" />

  <div class="users-page w-100 pb-5" style="min-width: 0; max-width: 100%;">
    <!-- সামারি কার্ডস -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border shadow-sm p-3 h-100">
          <div class="d-flex align-items-center">
            <div class="card-icon-box bg-primary-subtle text-primary me-3 p-3 rounded-3 fs-4">
              <i class="bi bi-people-fill"></i>
            </div>
            <div>
              <span class="text-muted small d-block">Total Registrations</span>
              <h4 class="mb-0 fw-bold">{{ subscriptionsList.length }}</h4>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border shadow-sm p-3 h-100">
          <div class="d-flex align-items-center">
            <div class="card-icon-box bg-warning-subtle text-warning me-3 p-3 rounded-3 fs-4">
              <i class="bi bi-clock-history"></i>
            </div>
            <div>
              <span class="text-muted small d-block">Pending Approvals</span>
              <h4 class="mb-0 fw-bold text-warning">{{ pendingCount }}</h4>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border shadow-sm p-3 h-100">
          <div class="d-flex align-items-center">
            <div class="card-icon-box bg-success-subtle text-success me-3 p-3 rounded-3 fs-4">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <div>
              <span class="text-muted small d-block">Active Paid Plans</span>
              <h4 class="mb-0 fw-bold text-success">{{ activeCount }}</h4>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border shadow-sm p-3 h-100">
          <div class="d-flex align-items-center">
            <div class="card-icon-box bg-info-subtle text-info me-3 p-3 rounded-3 fs-4">
              <i class="bi bi-shield-check"></i>
            </div>
            <div>
              <span class="text-muted small d-block">Active Trials</span>
              <h4 class="mb-0 fw-bold text-info">{{ trialCount }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- সাবস্ক্রিপশন ও ইউজার তালিকা -->
    <div class="card border shadow-sm w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="mb-0 fw-bold text-primary">
            <i class="bi bi-person-gear me-2 fs-5"></i>All Subscriptions & Users
          </h6>
          <span class="badge bg-light text-dark border">{{ filteredList.length }} items</span>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- ফিল্টার বাটন -->
          <div class="btn-group btn-group-sm" role="group">
            <button
              type="button"
              class="btn"
              :class="filterStatus === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="filterStatus = 'all'">
              সকল ({{ subscriptionsList.length }})
            </button>
            <button
              type="button"
              class="btn"
              :class="filterStatus === 'pending' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'"
              @click="filterStatus = 'pending'">
              পেন্ডিং ({{ pendingCount }})
            </button>
            <button
              type="button"
              class="btn"
              :class="filterStatus === 'active' ? 'btn-success' : 'btn-outline-secondary'"
              @click="filterStatus = 'active'">
              সক্রিয় ({{ activeCount }})
            </button>
            <button
              type="button"
              class="btn"
              :class="filterStatus === 'trial' ? 'btn-info text-white' : 'btn-outline-secondary'"
              @click="filterStatus = 'trial'">
              ট্রায়াল ({{ trialCount }})
            </button>
          </div>

          <!-- সার্চ -->
          <div style="min-width: 200px;">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control form-control-sm"
              placeholder="সার্চ (নাম, মোবাইল, ইমেইল, TRX)..." />
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
          <span class="ms-2 text-muted small">তথ্য লোড হচ্ছে...</span>
        </div>

        <div v-else-if="filteredList.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-2 d-block mb-2"></i>
          কোনো সাবস্ক্রিপশন রেকর্ড পাওয়া যায়নি
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" class="ps-3" style="width: 50px;">#</th>
                <th scope="col">User Details</th>
                <th scope="col">Company / Business</th>
                <th scope="col">Plan Details</th>
                <th scope="col">Status</th>
                <th scope="col">Payment / Trx</th>
                <th scope="col">Expires At</th>
                <th scope="col" class="text-end pe-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sub, idx) in filteredList" :key="sub.id">
                <td class="ps-3 text-muted small">{{ idx + 1 }}</td>
                <td>
                  <div class="fw-bold">{{ sub.user?.name || 'Unknown' }}</div>
                  <div class="small text-muted">
                    <i class="bi bi-telephone me-1"></i>{{ sub.user?.mobile || '-' }}
                  </div>
                  <div class="small text-muted">
                    <i class="bi bi-envelope me-1"></i>{{ sub.user?.email || '-' }}
                  </div>
                </td>
                <td>
                  <div class="fw-semibold">{{ sub.user?.companyName || '-' }}</div>
                  <div class="small text-muted">{{ sub.user?.address || '-' }}</div>
                </td>
                <td>
                  <div class="fw-bold text-primary">{{ sub.plan?.name || 'Standard' }}</div>
                  <div class="small text-muted">৳{{ sub.plan?.price || '0' }} / {{ sub.plan?.durationDays || 30 }} Days</div>
                </td>
                <td>
                  <span class="badge" :class="getStatusBadgeClass(sub.status)">
                    {{ getStatusText(sub.status) }}
                  </span>
                </td>
                <td>
                  <div v-if="sub.trxId" class="small">
                    <span class="fw-bold text-success">{{ sub.paymentMethod || 'Manual' }}</span>
                    <div class="text-muted">TRX: <code>{{ sub.trxId }}</code></div>
                    <div v-if="sub.paymentNote" class="text-muted fst-italic">Note: {{ sub.paymentNote }}</div>
                  </div>
                  <span v-else class="text-muted small">No payment info</span>
                </td>
                <td class="small">
                  <span v-if="sub.expiresAt">{{ formatDate(sub.expiresAt) }}</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="text-end pe-3">
                  <!-- পেন্ডিং হলে এপ্রুভ বা রিজেক্ট বাটন -->
                  <div v-if="sub.status === 'pending'" class="d-flex justify-content-end gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-success d-inline-flex align-items-center"
                      :disabled="actionLoading === sub.id"
                      @click="approveSub(sub.id)">
                      <i class="bi bi-check-lg me-1"></i>Approve
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                      :disabled="actionLoading === sub.id"
                      @click="rejectSub(sub.id)">
                      <i class="bi bi-x-lg me-1"></i>Reject
                    </button>
                  </div>
                  <span v-else class="text-muted small">
                    <i class="bi bi-dash"></i>
                  </span>
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
import { computed, onMounted, ref } from "vue";
import Pagebar from "@/components/Pagebar.vue";
import Toast from "@/components/Toast.vue";

useHead({ title: "Manage Users & Subscriptions - MFS Ledger" });

const toastRef = ref<any>(null);
const loading = ref(false);
const actionLoading = ref<number | null>(null);
const subscriptionsList = ref<any[]>([]);
const filterStatus = ref<"all" | "pending" | "active" | "trial">("all");
const searchQuery = ref("");

const pendingCount = computed(() => subscriptionsList.value.filter((s) => s.status === "pending").length);
const activeCount = computed(() => subscriptionsList.value.filter((s) => s.status === "active").length);
const trialCount = computed(() => subscriptionsList.value.filter((s) => s.status === "trial").length);

const filteredList = computed(() => {
  let list = subscriptionsList.value;
  if (filterStatus.value !== "all") {
    list = list.filter((s) => s.status === filterStatus.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.user?.name?.toLowerCase().includes(q) ||
        s.user?.mobile?.toLowerCase().includes(q) ||
        s.user?.email?.toLowerCase().includes(q) ||
        s.user?.companyName?.toLowerCase().includes(q) ||
        s.trxId?.toLowerCase().includes(q)
    );
  }
  return list;
});

async function loadData() {
  loading.value = true;
  try {
    const res = await axios.get("/api/subscription/subscriptions/all");
    subscriptionsList.value = res.data?.data || [];
  } catch (err: any) {
    toastRef.value?.error(err?.response?.data?.message || "সাবস্ক্রিপশন ডাটা লোড করতে ব্যর্থ হয়েছে");
  } finally {
    loading.value = false;
  }
}

async function approveSub(id: number) {
  actionLoading.value = id;
  try {
    const res = await axios.post(`/api/subscription/subscriptions/${id}/approve`);
    toastRef.value?.success(res.data?.message || "সাবস্ক্রিপশন সফলভাবে অনুমোদিত হয়েছে");
    await loadData();
  } catch (err: any) {
    toastRef.value?.error(err?.response?.data?.message || "অনুমোদন ব্যর্থ হয়েছে");
  } finally {
    actionLoading.value = null;
  }
}

async function rejectSub(id: number) {
  if (!confirm("আপনি কি নিশ্চিতভাবে এই পেমেন্ট রিকোয়েস্টটি বাতিল করতে চান?")) return;
  actionLoading.value = id;
  try {
    const res = await axios.post(`/api/subscription/subscriptions/${id}/reject`);
    toastRef.value?.info(res.data?.message || "রিকোয়েস্ট বাতিল করা হয়েছে");
    await loadData();
  } catch (err: any) {
    toastRef.value?.error(err?.response?.data?.message || "বাতিল করতে ব্যর্থ হয়েছে");
  } finally {
    actionLoading.value = null;
  }
}

function getStatusBadgeClass(status?: string): string {
  switch (status) {
    case "active":
      return "bg-success-subtle text-success border border-success-subtle";
    case "trial":
      return "bg-info-subtle text-info border border-info-subtle";
    case "pending":
      return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
    case "expired":
    case "cancelled":
      return "bg-danger-subtle text-danger border border-danger-subtle";
    default:
      return "bg-secondary-subtle text-muted";
  }
}

function getStatusText(status?: string): string {
  switch (status) {
    case "active":
      return "সক্রিয় (Active)";
    case "trial":
      return "ট্রায়াল (Trial)";
    case "pending":
      return "পেন্ডিং (Pending)";
    case "expired":
      return "মেয়াদ শেষ (Expired)";
    case "cancelled":
      return "বাতিল (Cancelled)";
    default:
      return status || "অজানা";
  }
}

function formatDate(val?: string): string {
  if (!val) return "-";
  try {
    const d = new Date(val);
    return d.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.users-page {
  font-family: inherit;
}
</style>
