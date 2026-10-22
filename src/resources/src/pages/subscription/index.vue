<template>
  <Pagebar title="সাবস্ক্রিপশন ও বিলিং" />
  <Toast ref="toastRef" />

  <div class="subscription-page w-100" style="min-width: 0; max-width: 100%;">
    <!-- লোডিং স্টেট -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">সাবস্ক্রিপশন তথ্য লোড হচ্ছে...</p>
    </div>

    <div v-else>
      <!-- ১. বর্তমান সক্রিয় প্লান কার্ড -->
      <div class="card border shadow-sm mb-4">
        <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="d-flex align-items-center">
            <div class="card-icon-box text-primary me-2">
              <i class="bi bi-patch-check-fill fs-4"></i>
            </div>
            <div>
              <h5 class="mb-0 fs-6 fw-bold">বর্তমান প্যাকেজ বিবরণী</h5>
              <small class="text-muted">আপনার চলতি প্লানের স্ট্যাটাস ও মেয়াদের হিসাব</small>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-primary rounded-pill px-3 py-1.5"
            @click="scrollToPlans">
            <i class="bi bi-arrow-up-circle me-1"></i>প্লান পরিবর্তন / রিনিউ
          </button>
        </div>

        <div class="card-body p-4">
          <div class="row g-4 align-items-center">
            <div class="col-12 col-md-5 border-end-md">
              <div class="d-flex align-items-center gap-2 mb-2">
                <h4 class="mb-0 fw-bold theme-text">
                  {{ currentSub?.plan?.name || (currentSub?.status === 'trial' ? 'ফ্রি ট্রায়াল' : 'কোনো সক্রিয় প্লান নেই') }}
                </h4>
                <span
                  class="badge"
                  :class="getStatusBadgeClass(currentSub?.status)">
                  {{ getStatusText(currentSub?.status) }}
                </span>
              </div>
              <p class="text-muted small mb-3">
                {{ currentSub?.plan?.description || 'সিস্টেমের সকল মৌলিক ফিচার ব্যবহারের সুযোগ।' }}
              </p>

              <div class="p-3 theme-box rounded-3">
                <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                  <span class="text-muted small">মেয়াদ বাকি:</span>
                  <span class="fw-bold small" :class="remainingDays <= 3 ? 'text-danger' : 'text-primary'">
                    {{ remainingDaysText }}
                  </span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div
                    class="progress-bar"
                    :class="remainingDays <= 3 ? 'bg-danger' : 'bg-primary'"
                    role="progressbar"
                    :style="{ width: progressPercentage + '%' }"></div>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-7">
              <div class="row g-3">
                <div class="col-6 col-sm-4">
                  <div class="p-2 border rounded text-center stat-cell">
                    <span class="text-muted small d-block mb-1">অ্যাক্টিভেশন তারিখ</span>
                    <span class="fw-bold small theme-text">{{ formatDate(currentSub?.activatedAt || currentSub?.createdAt) }}</span>
                  </div>
                </div>
                <div class="col-6 col-sm-4">
                  <div class="p-2 border rounded text-center stat-cell">
                    <span class="text-muted small d-block mb-1">মেয়াদ শেষ</span>
                    <span class="fw-bold small" :class="remainingDays <= 3 ? 'text-danger' : 'theme-text'">
                      {{ formatDate(currentSub?.expiresAt) }}
                    </span>
                  </div>
                </div>
                <div class="col-6 col-sm-4">
                  <div class="p-2 border rounded text-center stat-cell">
                    <span class="text-muted small d-block mb-1">প্যাকেজ মূল্য</span>
                    <span class="fw-bold small text-success">
                      {{ currentSub?.plan?.price ? `৳${currentSub.plan.price}` : '৳০.০০' }}
                    </span>
                  </div>
                </div>
                <div class="col-6 col-sm-4">
                  <div class="p-2 border rounded text-center stat-cell">
                    <span class="text-muted small d-block mb-1">সর্বোচ্চ ওয়ালেট</span>
                    <span class="fw-bold small theme-text">
                      {{ currentSub?.plan?.maxMfsAccounts ? `${currentSub.plan.maxMfsAccounts} টি` : 'আনলিমিটেড' }}
                    </span>
                  </div>
                </div>
                <div class="col-6 col-sm-4">
                  <div class="p-2 border rounded text-center stat-cell">
                    <span class="text-muted small d-block mb-1">দৈনিক লেনদেন</span>
                    <span class="fw-bold small theme-text">
                      {{ currentSub?.plan?.maxTransactions ? `${currentSub.plan.maxTransactions} টি` : 'আনলিমিটেড' }}
                    </span>
                  </div>
                </div>
                <div class="col-6 col-sm-4">
                  <div class="p-2 border rounded text-center stat-cell">
                    <span class="text-muted small d-block mb-1">পেমেন্ট মেথড</span>
                    <span class="fw-bold small theme-text">{{ currentSub?.paymentMethod || 'সিস্টেম ট্রায়াল' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ২. সাবস্ক্রিপশন ও পেমেন্টের পূর্ণাঙ্গ ইতিহাস তালিকা -->
      <div class="card border shadow-sm mb-4">
        <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fs-6 fw-bold theme-text d-flex align-items-center">
            <i class="bi bi-clock-history text-primary me-2"></i>সাবস্ক্রিপশন ও পেমেন্ট হিস্ট্রি
          </h5>
          <span class="badge theme-box text-muted border">মোট {{ historyList.length }} টি রেকর্ড</span>
        </div>

        <div class="card-body p-0">
          <div v-if="historyList.length === 0" class="text-center py-5 text-muted">
            <i class="bi bi-receipt fs-1 d-block mb-2 text-secondary opacity-50"></i>
            <p class="mb-0">কোনো পূর্ববর্তী সাবস্ক্রিপশন হিস্ট্রি পাওয়া যায়নি।</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr class="table-header-row">
                  <th class="ps-3">প্যাকেজ / প্লান</th>
                  <th>পেমেন্ট মেথড</th>
                  <th>TrxID</th>
                  <th>শুরুর তারিখ</th>
                  <th>মেয়াদ শেষের তারিখ</th>
                  <th class="text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in historyList" :key="item.id">
                  <td class="ps-3 fw-bold theme-text">
                    {{ item.plan?.name || (item.status === 'trial' ? 'ফ্রি ট্রায়াল' : 'কাস্টম প্লান') }}
                    <span v-if="item.plan?.price" class="small text-muted d-block fw-normal">
                      ৳{{ item.plan.price }} ({{ item.plan.durationDays }} দিন)
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary border">
                      {{ item.paymentMethod || 'সিস্টেম ট্রায়াল' }}
                    </span>
                  </td>
                  <td class="font-monospace small">
                    {{ item.trxId || '—' }}
                  </td>
                  <td class="small">
                    {{ formatDate(item.activatedAt || item.createdAt) }}
                  </td>
                  <td class="small">
                    {{ formatDate(item.expiresAt) }}
                  </td>
                  <td class="text-center">
                    <span class="badge" :class="getStatusBadgeClass(item.status)">
                      {{ getStatusText(item.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ৩. প্লান আপগ্রেড / পরিবর্তন সেকশন -->
      <div id="upgrade-section" class="card border shadow-sm mb-4">
        <div class="card-header bg-transparent py-3 border-bottom">
          <h5 class="mb-0 fs-6 fw-bold text-primary d-flex align-items-center">
            <i class="bi bi-stars me-2 fs-5"></i>প্লান আপগ্রেড অথবা পরিবর্তন করুন
          </h5>
          <small class="text-muted">আপনার ব্যবসার আকার অনুযায়ী যেকোনো প্যাকেজ বেছে নিন</small>
        </div>

        <div class="card-body p-4">
          <div class="row g-4">
            <div
              v-for="plan in availablePlans"
              :key="plan.id"
              class="col-12 col-md-6 col-lg-4">
              <div
                class="card h-100 border transition-card plan-box"
                :class="currentSub?.planId === plan.id ? 'border-primary shadow-sm active-plan-box' : 'hover-shadow'">
                <div class="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h5 class="card-title fw-bold mb-0 theme-text">{{ plan.name }}</h5>
                      <span v-if="currentSub?.planId === plan.id" class="badge bg-primary">চলতি প্লান</span>
                    </div>
                    <p class="text-muted small mb-3">{{ plan.description || 'মার্চেন্টদের জন্য উপযুক্ত ফিচার সেট।' }}</p>

                    <div class="mb-3">
                      <span class="fs-3 fw-extrabold text-primary">৳{{ plan.price }}</span>
                      <span class="text-muted small"> / {{ plan.durationDays }} দিন</span>
                    </div>

                    <ul class="list-unstyled small text-muted mb-4">
                      <li class="mb-2 d-flex align-items-center">
                        <i class="bi bi-check-circle-fill text-success me-2"></i>
                        <span>ওয়ালেট অ্যাকাউন্ট: <strong>{{ plan.maxMfsAccounts ? `${plan.maxMfsAccounts} টি` : 'আনলিমিটেড' }}</strong></span>
                      </li>
                      <li class="mb-2 d-flex align-items-center">
                        <i class="bi bi-check-circle-fill text-success me-2"></i>
                        <span>দৈনিক লেনদেন: <strong>{{ plan.maxTransactions ? `${plan.maxTransactions} টি` : 'আনলিমিটেড' }}</strong></span>
                      </li>
                      <li class="mb-2 d-flex align-items-center">
                        <i class="bi bi-check-circle-fill text-success me-2"></i>
                        <span>স্বয়ংক্রিয় গ্রাহক সার্ভিস চার্জ পলিসি</span>
                      </li>
                      <li class="d-flex align-items-center">
                        <i class="bi bi-check-circle-fill text-success me-2"></i>
                        <span>রিয়েলটাইম লেজার ও পুঁজিপত্র</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    class="btn w-100 rounded-pill py-2"
                    :class="currentSub?.planId === plan.id ? 'btn-outline-primary' : 'btn-primary'"
                    @click="openPurchaseModal(plan)">
                    {{ currentSub?.planId === plan.id ? 'রিনিউ করুন' : 'এই প্লানটি নিন' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- সাবস্ক্রিপশন পেমেন্ট সাবমিট মডাল -->
    <div
      v-if="showPurchaseModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 500px;">
        <div class="modal-content shadow border-0">
          <div class="modal-header py-3">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-credit-card-2-front text-primary me-2"></i>পেমেন্ট ভেরিফিকেশন তথ্য
            </h6>
            <button type="button" class="btn-close" @click="closePurchaseModal"></button>
          </div>
          <form @submit.prevent="submitPurchase">
            <div class="modal-body p-4">
              <div class="alert alert-info py-2 px-3 small mb-3">
                নির্বাচিত প্লান: <strong>{{ selectedPlan?.name }}</strong> | মূল্য: <strong>৳{{ selectedPlan?.price }}</strong> ({{ selectedPlan?.durationDays }} দিন)
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small mb-1">পেমেন্ট মেথড <span class="text-danger">*</span></label>
                <select v-model="purchaseForm.paymentMethod" class="form-select" required>
                  <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                  <option value="নগদ (Nagad)">নগদ (Nagad)</option>
                  <option value="রকেট (Rocket)">রকেট (Rocket)</option>
                  <option value="ব্যাংক ট্রান্সফার (Bank)">ব্যাংক ট্রান্সফার (Bank)</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small mb-1">TrxID <span class="text-danger">*</span></label>
                <input
                  v-model="purchaseForm.trxId"
                  type="text"
                  class="form-control"
                  placeholder="যেমন: BLA849X7Q"
                  required />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small mb-1">মন্তব্য বা রেফারেন্স (ঐচ্ছিক)</label>
                <input
                  v-model="purchaseForm.paymentNote"
                  type="text"
                  class="form-control"
                  placeholder="যেমন: যে নম্বর থেকে পাঠানো হয়েছে" />
              </div>
            </div>
            <div class="modal-footer py-2">
              <button type="button" class="btn btn-secondary btn-sm" @click="closePurchaseModal">বাতিল</button>
              <button type="submit" class="btn btn-primary btn-sm" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                রিকোয়েস্ট পাঠান
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import Pagebar from "@/components/Pagebar.vue";
import Toast from "@/components/Toast.vue";

useHead({ title: "সাবস্ক্রিপশন ও বিলিং - MFS Ledger" });

const toastRef = ref<any>(null);
const loading = ref(true);
const submitting = ref(false);

const currentSub = ref<any>(null);
const historyList = ref<any[]>([]);
const availablePlans = ref<any[]>([]);

const showPurchaseModal = ref(false);
const selectedPlan = ref<any>(null);

const purchaseForm = reactive({
  paymentMethod: "বিকাশ (bKash)",
  trxId: "",
  paymentNote: ""
});

async function loadSubscriptionData() {
  loading.value = true;
  try {
    const [subRes, plansRes] = await Promise.all([
      axios.get("/api/subscription/my-subscription"),
      axios.get("/api/subscription/plans")
    ]);

    currentSub.value = subRes?.data?.data?.current || null;
    historyList.value = subRes?.data?.data?.history || [];
    availablePlans.value = (plansRes?.data?.data || []).filter((p: any) => p.isActive);
  } catch (e: any) {
    toastRef.value?.error("সাবস্ক্রিপশন তথ্য লোড করতে ব্যর্থ হয়েছে");
  } finally {
    loading.value = false;
  }
}

const remainingDiffMs = computed(() => {
  if (!currentSub.value?.expiresAt) return null;
  const exp = new Date(currentSub.value.expiresAt).getTime();
  const now = Date.now();
  return exp - now;
});

const remainingDays = computed(() => {
  if (remainingDiffMs.value === null) return 0;
  return Math.max(0, Math.floor(remainingDiffMs.value / (1000 * 60 * 60 * 24)));
});

const remainingDaysText = computed(() => {
  if (remainingDiffMs.value === null) return "অসীম";
  if (remainingDiffMs.value <= 0) return "মেয়াদ শেষ হয়েছে";

  const totalMinutes = Math.floor(remainingDiffMs.value / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} দিন`);
  if (hours > 0 || days > 0) parts.push(`${hours} ঘণ্টা`);
  parts.push(`${minutes} মিনিট`);

  return parts.join(" ");
});

const progressPercentage = computed(() => {
  const duration = currentSub.value?.plan?.durationDays || 7;
  const passed = duration - remainingDays.value;
  return Math.min(100, Math.max(5, (passed / duration) * 100));
});

function formatDate(dateStr: any) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active":
      return "bg-success-subtle text-success border border-success-subtle";
    case "trial":
      return "bg-info-subtle text-info border border-info-subtle";
    case "pending":
      return "bg-warning-subtle text-warning border border-warning-subtle";
    case "expired":
      return "bg-danger-subtle text-danger border border-danger-subtle";
    default:
      return "bg-secondary-subtle text-secondary";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "active":
      return "সক্রিয়";
    case "trial":
      return "ট্রায়াল";
    case "pending":
      return "পেন্ডিং ভেরিফিকেশন";
    case "expired":
      return "মেয়াদোত্তীর্ণ";
    case "cancelled":
      return "বাতিল";
    default:
      return status || "অজানা";
  }
}

function scrollToPlans() {
  const el = document.getElementById("upgrade-section");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

function openPurchaseModal(plan: any) {
  selectedPlan.value = plan;
  purchaseForm.paymentMethod = "বিকাশ (bKash)";
  purchaseForm.trxId = "";
  purchaseForm.paymentNote = "";
  showPurchaseModal.value = true;
}

function closePurchaseModal() {
  showPurchaseModal.value = false;
  selectedPlan.value = null;
}

async function submitPurchase() {
  if (!selectedPlan.value) return;
  submitting.value = true;
  try {
    await axios.post("/api/subscription/request", {
      planId: selectedPlan.value.id,
      paymentMethod: purchaseForm.paymentMethod,
      trxId: purchaseForm.trxId,
      paymentNote: purchaseForm.paymentNote
    });

    toastRef.value?.success("পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!");
    closePurchaseModal();
    await loadSubscriptionData();
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে");
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadSubscriptionData();
});
</script>

<style scoped>
.subscription-page {
  font-family: inherit;
}

.transition-card {
  transition: all 0.2s ease-in-out;
}

.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.theme-text {
  color: var(--bs-body-color, #1e293b);
}

.theme-box {
  background-color: var(--bs-tertiary-bg, #f8f9fa);
  border: 1px solid var(--bs-border-color, #e2e8f0);
}

.stat-cell {
  background-color: var(--bs-body-bg, #ffffff);
  border-color: var(--bs-border-color, #e2e8f0) !important;
}

.table-header-row th {
  background-color: var(--bs-tertiary-bg, #f1f5f9) !important;
  color: var(--bs-body-color, #1e293b) !important;
  border-bottom-color: var(--bs-border-color, #e2e8f0) !important;
}

.plan-box {
  background-color: transparent !important;
  border: 1px solid var(--bs-border-color, #e2e8f0) !important;
}

.active-plan-box {
  background-color: transparent !important;
  border: 2px solid var(--bs-primary, #0d6efd) !important;
}

:deep([data-bs-theme="dark"]) .theme-box,
[data-bs-theme="dark"] .theme-box {
  background-color: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep([data-bs-theme="dark"]) .stat-cell,
[data-bs-theme="dark"] .stat-cell {
  background-color: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

:deep([data-bs-theme="dark"]) .table-header-row th,
[data-bs-theme="dark"] .table-header-row th {
  background-color: rgba(255, 255, 255, 0.06) !important;
  color: #f1f5f9 !important;
  border-bottom-color: rgba(255, 255, 255, 0.1) !important;
}

:deep([data-bs-theme="dark"]) .plan-box,
[data-bs-theme="dark"] .plan-box {
  background-color: transparent !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

:deep([data-bs-theme="dark"]) .active-plan-box,
[data-bs-theme="dark"] .active-plan-box {
  background-color: transparent !important;
  border-color: var(--bs-primary, #0d6efd) !important;
}

:deep([data-bs-theme="dark"]) .border-end-md,
[data-bs-theme="dark"] .border-end-md {
  border-right-color: rgba(255, 255, 255, 0.1) !important;
}

@media (min-width: 768px) {
  .border-end-md {
    border-right: 1px solid var(--bs-border-color, #dee2e6);
  }
}
</style>
