<template>
  <Pagebar title="হোম" />

  <div class="dashboard-content">
    <!-- ১. সুপারএডমিন প্যানেল (শুধুমাত্র সুপারএডমিন দেখতে পাবেন) -->
    <div v-if="isSuperAdmin" class="superadmin-section mb-4 pb-2 border-bottom">
      <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h5 class="fs-6 fw-bold mb-0 text-muted">
          <i class="bi bi-shield-lock-fill me-1 text-primary"></i>সুপারএডমিন কন্ট্রোল প্যানেল
        </h5>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
          Superadmin Controls
        </span>
      </div>

      <div class="row g-3">
        <!-- 1. ইউজার্স ও সাবস্ক্রিপশন -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                  <div class="card-icon-box text-primary me-2">
                    <i class="bi bi-people"></i>
                  </div>
                  <h5 class="card-title mb-0 fs-6 fw-semibold">Users</h5>
                </div>
                <router-link to="/admin/users" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-person-gear me-1"></i>Manage
                </router-link>
              </div>
              <div class="py-2">
                <div class="d-flex align-items-baseline">
                  <span class="stat-value me-2">{{ totalSubCount }}</span>
                  <span class="text-muted small">Total Subscriptions</span>
                </div>
                <div v-if="pendingSubCount > 0" class="mt-1">
                  <span class="badge bg-warning text-dark">
                    <i class="bi bi-exclamation-circle me-1"></i>{{ pendingSubCount }} Pending Approval
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. প্লানস -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100">
            <div class="card-body p-3">
              <PlansCard />
            </div>
          </div>
        </div>

        <!-- 3. একাউন্টস -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                  <div class="card-icon-box text-info me-2">
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
                  <span class="stat-value me-2">--</span>
                  <span class="text-muted small">Connected Accounts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. এডমিন গ্লোবাল সেটিংস -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100">
            <div class="card-body p-3">
              <GlobalSettingsCard />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ২. ইউজার / মার্চেন্ট ড্যাশবোর্ড (৮টি কার্ড: কাস্টমার, প্রোভাইডার, পুঁজি, লেনদেন, রিপোর্ট, ঋণ ও দেনা, সাবস্ক্রিপশন, সেটিংস) -->
    <div class="user-merchant-section">
      <div v-if="isSuperAdmin" class="d-flex align-items-center mb-3">
        <h5 class="fs-6 fw-bold mb-0 text-muted">
          <i class="bi bi-shop me-1 text-success"></i>মার্চেন্ট / ইউজার ড্যাশবোর্ড ভিউ
        </h5>
      </div>

      <div class="row g-3">
        <!-- ১. কাস্টমার -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100 merchant-card card-bar-primary">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-primary me-2">
                    <i class="bi bi-people-fill"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">কাস্টমার</h5>
                    <span class="text-muted small">Customers</span>
                  </div>
                </div>
                <router-link
                  to="/customers"
                  class="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-0.5 small flex-shrink-0 text-decoration-none">
                  তালিকা
                </router-link>
              </div>
              <div class="py-2">
                <div class="d-flex align-items-baseline">
                  <span class="stat-value me-2">{{ toBengaliNumber(customerCount) }}</span>
                  <span class="text-muted small">জন কাস্টমার</span>
                </div>
                <p class="text-muted small mb-0 mt-1 text-truncate">
                  <i class="bi bi-person-check text-primary me-1"></i>গ্রাহক তালিকা ও মোবাইল নম্বর
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ২. প্রোভাইডার -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100 merchant-card card-bar-info">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-info me-2">
                    <i class="bi bi-wallet2"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">প্রোভাইডার</h5>
                    <span class="text-muted small">Providers</span>
                  </div>
                </div>
                <router-link
                  to="/providers"
                  class="btn btn-sm btn-outline-info rounded-pill px-2.5 py-0.5 small flex-shrink-0 text-decoration-none">
                  ম্যানেজ
                </router-link>
              </div>
              <div class="py-2">
                <div class="d-flex align-items-baseline">
                  <span class="stat-value me-2">{{ toBengaliNumber(providerCount) }}</span>
                  <span class="text-muted small">টি ওয়ালেট</span>
                </div>
                <p class="text-muted small mb-0 mt-1 text-truncate">
                  <i class="bi bi-phone text-info me-1"></i>বিকাশ, নগদ, রকেট ও ব্যাংক
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ৩. পুঁজি -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100 merchant-card card-bar-success">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-success me-2">
                    <i class="bi bi-cash-stack"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">পুঁজি</h5>
                    <span class="text-muted small">Capital / Fund</span>
                  </div>
                </div>
                <router-link
                  to="/capital"
                  class="btn btn-sm btn-outline-success rounded-pill px-2.5 py-0.5 small flex-shrink-0 text-decoration-none">
                  হিসাব
                </router-link>
              </div>
              <div class="py-2">
                <div class="d-flex align-items-baseline">
                  <span class="stat-value text-success me-2"><span class="currency-symbol">৳</span>{{ toBengaliNumber(capitalAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })) }}</span>
                  <span class="text-muted small">বর্তমান পুঁজি</span>
                </div>
                <p class="text-muted small mb-0 mt-1 text-truncate">
                  <i class="bi bi-graph-up-arrow text-success me-1"></i>চলতি মূলধন ও ক্যাশ স্থিতি
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ৪. লেনদেন -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100 merchant-card card-bar-primary">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-primary me-2">
                    <i class="bi bi-arrow-left-right"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">লেনদেন</h5>
                    <span class="text-muted small">Transactions</span>
                  </div>
                </div>
                <router-link
                  to="/transactions"
                  class="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-0.5 small flex-shrink-0 text-decoration-none">
                  এন্ট্রি
                </router-link>
              </div>
              <div class="py-2">
                <div class="d-flex align-items-baseline">
                  <span class="stat-value me-2">০</span>
                  <span class="text-muted small">টি আজকের এন্ট্রি</span>
                </div>
                <p class="text-muted small mb-0 mt-1 text-truncate">
                  <i class="bi bi-arrow-down-up text-primary me-1"></i>ক্যাশ ইন, ক্যাশ আউট ও ট্রান্সফার
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ৫. রিপোর্ট -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100 merchant-card card-bar-warning">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-warning me-2">
                    <i class="bi bi-bar-chart-line-fill"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">রিপোর্ট</h5>
                    <span class="text-muted small">Reports</span>
                  </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-warning rounded-pill px-2.5 py-0.5 small flex-shrink-0">
                  দেখুন
                </button>
              </div>
              <div class="py-2">
                <div class="d-flex align-items-baseline">
                  <span class="stat-value me-2">লেজার</span>
                  <span class="text-muted small">স্টেটমেন্ট</span>
                </div>
                <p class="text-muted small mb-0 mt-1 text-truncate">
                  <i class="bi bi-file-earmark-spreadsheet text-warning me-1"></i>দৈনিক ও মাসিক হিসাব বিবরণী
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ৬. ঋণ ও দেনা -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100 merchant-card card-bar-danger">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-danger me-2">
                    <i class="bi bi-journal-bookmark-fill"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">ঋণ ও দেনা</h5>
                    <span class="text-muted small">Loans & Debts</span>
                  </div>
                </div>
                <router-link
                  to="/loans"
                  class="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-0.5 small flex-shrink-0 text-decoration-none">
                  খাতা
                </router-link>
              </div>
              <div class="py-2">
                <div class="d-flex align-items-baseline">
                  <span class="stat-value text-danger me-2"><span class="currency-symbol">৳</span>{{ toBengaliNumber(totalLoanDue.toLocaleString('en-US')) }}</span>
                  <span class="text-muted small">অবশিষ্ট দেনা</span>
                </div>
                <p class="text-muted small mb-0 mt-1 text-truncate">
                  <i class="bi bi-journal-bookmark text-danger me-1"></i>গৃহীত ও প্রদত্ত ঋণ খাতা
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ৭. সাবস্ক্রিপশন -->
        <div class="col-12 col-sm-6 col-lg-3">
          <router-link to="/subscription" class="text-decoration-none d-block h-100">
            <div class="card border shadow-sm h-100 merchant-card card-bar-primary">
              <div class="card-body d-flex flex-column justify-content-between p-3">
                <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                  <div class="d-flex align-items-center min-w-0">
                    <div class="card-icon-box text-primary me-2">
                      <i class="bi bi-patch-check-fill"></i>
                    </div>
                    <div class="text-truncate">
                      <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">সাবস্ক্রিপশন</h5>
                      <span class="text-muted small">Subscription</span>
                    </div>
                  </div>
                  <span class="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-0.5 small flex-shrink-0">
                    প্লান
                  </span>
                </div>
                <div class="py-2">
                  <div class="d-flex align-items-baseline">
                    <span class="stat-value text-primary me-2">{{ subPlanName }}</span>
                    <span class="badge bg-success-subtle text-success">{{ subStatusText }}</span>
                  </div>
                  <p class="text-muted small mb-0 mt-1 text-truncate">
                    <i class="bi bi-clock-history text-primary me-1"></i>{{ subRemainingText }}
                  </p>
                </div>
              </div>
            </div>
          </router-link>
        </div>

        <!-- ৮. সেটিংস -->
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card border shadow-sm h-100 merchant-card card-bar-secondary">
            <div class="card-body d-flex flex-column justify-content-between p-3">
              <div class="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <div class="d-flex align-items-center min-w-0">
                  <div class="card-icon-box text-secondary me-2">
                    <i class="bi bi-gear-fill"></i>
                  </div>
                  <div class="text-truncate">
                    <h5 class="card-title mb-0 fs-6 fw-bold text-truncate">সেটিংস</h5>
                    <span class="text-muted small">Settings</span>
                  </div>
                </div>
                <router-link
                  to="/settings"
                  class="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-0.5 small flex-shrink-0 text-decoration-none">
                  কনফিগার
                </router-link>
              </div>
              <div class="py-2">
                <div class="d-flex align-items-baseline">
                  <span class="stat-value me-2">শপ</span>
                  <span class="text-muted small">প্রোফাইল</span>
                </div>
                <p class="text-muted small mb-0 mt-1 text-truncate">
                  <i class="bi bi-sliders text-secondary me-1"></i>দোকানের নাম, ঠিকানা ও নিরাপত্তা
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import axios from "axios";
import { computed, onMounted, onUnmounted, ref } from "vue";
import Pagebar from "@/components/Pagebar.vue";
import { useAuth } from "@/composables/useAuth";
import { toBengaliNumber } from "@/helpers/utils";
import { pulse } from "@/plugins/pulse";
import GlobalSettingsCard from "./components/GlobalSettingsCard.vue";
import PlansCard from "./components/PlansCard.vue";

useHead({ title: "Dashboard" });

const { user } = useAuth();
const isSuperAdmin = computed(() => user.value?.role?.name === "superadmin");
const totalSubCount = ref(0);
const pendingSubCount = ref(0);
const customerCount = ref(0);
const providerCount = ref(0);
const capitalAmount = ref(0);
const totalLoanDue = ref(0);
const activeSub = ref<any>(null);
const loadingSub = ref(true);

const subPlanName = computed(() => {
  if (loadingSub.value) return "...";
  if (!activeSub.value) return "কোনো প্লান নেই";
  return activeSub.value.plan?.name || (activeSub.value.status === "trial" ? "ট্রায়াল প্লান" : "সাবস্ক্রিপশন");
});

const subStatusText = computed(() => {
  if (loadingSub.value) return "...";
  if (!activeSub.value) return "নিষ্ক্রিয়";
  if (activeSub.value.status === "active") return "সক্রিয়";
  if (activeSub.value.status === "trial") return "ট্রায়াল";
  if (activeSub.value.status === "pending") return "পেন্ডিং";
  if (activeSub.value.status === "expired") return "মেয়াদ শেষ";
  return activeSub.value.status;
});

const subRemainingText = computed(() => {
  if (loadingSub.value) return "তথ্য লোড হচ্ছে...";
  if (!activeSub.value?.expiresAt) return "মেয়াদ ও প্যাকেজ বিবরণী";
  const exp = new Date(activeSub.value.expiresAt).getTime();
  const diff = exp - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return days > 0 ? `${days} দিন মেয়াদ বাকি` : "মেয়াদ শেষ হয়েছে";
});

onMounted(async () => {
  if (isSuperAdmin.value) {
    try {
      const allSubRes = await axios.get("/api/subscription/subscriptions/all");
      const list = allSubRes.data?.data || [];
      totalSubCount.value = list.length;
      pendingSubCount.value = list.filter((s: any) => s.status === "pending").length;
    } catch {
      totalSubCount.value = 0;
      pendingSubCount.value = 0;
    }
  }

  try {
    const sRes = await axios.get("/api/subscription/my-subscription");
    activeSub.value = sRes.data?.data?.current || null;
  } catch {
    activeSub.value = null;
  } finally {
    loadingSub.value = false;
  }
  try {
    const res = await axios.get("/api/customers");
    customerCount.value = res.data?.total ?? res.data?.data?.length ?? 0;
  } catch {
    customerCount.value = 0;
  }

  try {
    const pRes = await axios.get("/api/providers");
    providerCount.value = pRes.data?.total ?? pRes.data?.data?.length ?? 0;
  } catch {
    providerCount.value = 0;
  }

  try {
    const cRes = await axios.get("/api/capital");
    capitalAmount.value = Number(cRes.data?.data?.totalCapital) || 0;
  } catch {
    capitalAmount.value = 0;
  }

  try {
    const lRes = await axios.get("/api/loans");
    totalLoanDue.value = Number(lRes.data?.data?.summary?.totalPayableDue) || 0;
  } catch {
    totalLoanDue.value = 0;
  }

  const custChannel = pulse.channel("customers");
  custChannel.listen("customer.created", () => {
    customerCount.value++;
  });
  custChannel.listen("customer.deleted", () => {
    if (customerCount.value > 0) customerCount.value--;
  });

  const provChannel = pulse.channel("providers");
  provChannel.listen("provider.created", () => {
    providerCount.value++;
  });
  provChannel.listen("provider.deleted", () => {
    if (providerCount.value > 0) providerCount.value--;
  });

  onUnmounted(() => {
    custChannel.stopListening("customer.created");
    custChannel.stopListening("customer.deleted");
    provChannel.stopListening("provider.created");
    provChannel.stopListening("provider.deleted");
  });
});
</script>

<style scoped>
.dashboard-content {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.card-icon-box {
  width: 34px;
  height: 34px;
  border: 1.5px solid currentColor;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
  background: transparent;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.currency-symbol {
  font-size: 0.75em;
  font-weight: 500;
  margin-right: 2px;
  opacity: 0.85;
}

.merchant-card {
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-top-width: 3.5px !important;
}

.card-bar-primary {
  border-top-color: #0d6efd !important;
}

.card-bar-info {
  border-top-color: #0dcaf0 !important;
}

.card-bar-success {
  border-top-color: #198754 !important;
}

.card-bar-warning {
  border-top-color: #ffc107 !important;
}

.card-bar-danger {
  border-top-color: #dc3545 !important;
}

.card-bar-secondary {
  border-top-color: #6c757d !important;
}

.merchant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.08) !important;
}

.user-merchant-section {
  padding-top: 4px;
}

@media (max-width: 575.98px) {
  .merchant-card .card-body {
    padding: 0.85rem !important;
  }
}
</style>
