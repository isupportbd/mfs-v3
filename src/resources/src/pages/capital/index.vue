<template>
  <Pagebar title="পুঁজি ও মূলধন ম্যানেজমেন্ট" />
  <Toast ref="toastRef" />

  <div class="capital-page w-100" style="min-width: 0; max-width: 100%; overflow-x: hidden;">
    <!-- সারসংক্ষেপ কার্ডসমূহ (উপরে পরিসংখ্যান) -->
    <div class="row g-3 mb-4">
      <!-- মোট মূলধন -->
      <div class="col-12 col-md-4">
        <div class="card border shadow-sm h-100">
          <div class="card-body p-3 d-flex align-items-center">
            <div class="card-icon-box text-primary me-3">
              <i class="bi bi-cash-stack"></i>
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <span class="text-muted small fw-medium d-block">মোট জমাকৃত মূলধন</span>
              <h4 class="mb-0 fw-bold text-body font-monospace text-truncate">
                <span class="currency-symbol">৳</span>{{ formatMoney(summaryData.totalCapital) }}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <!-- মোট শেয়ারহোল্ডার সংখ্যা -->
      <div class="col-12 col-sm-6 col-md-4">
        <div class="card border shadow-sm h-100">
          <div class="card-body p-3 d-flex align-items-center">
            <div class="card-icon-box text-success me-3">
              <i class="bi bi-people-fill"></i>
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <span class="text-muted small fw-medium d-block">মোট শেয়ারহোল্ডার</span>
              <h4 class="mb-0 fw-bold text-body text-truncate">
                {{ toBengaliNumber(summaryData.shareholders.length) }} জন
              </h4>
            </div>
          </div>
        </div>
      </div>

      <!-- মোট পুঁজি লেনদেন সংখ্যা -->
      <div class="col-12 col-sm-6 col-md-4">
        <div class="card border shadow-sm h-100">
          <div class="card-body p-3 d-flex align-items-center">
            <div class="card-icon-box text-info me-3">
              <i class="bi bi-receipt-cutoff"></i>
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <span class="text-muted small fw-medium d-block">মোট পুঁজি জমা এন্ট্রি</span>
              <h4 class="mb-0 fw-bold text-body text-truncate">
                {{ toBengaliNumber(transactions.length) }} বার
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ১. নতুন পুঁজি যোগ করার ফরম (উপরে) -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 class="mb-0 fw-bold text-primary d-flex align-items-center">
          <i class="bi bi-plus-circle-fill me-2 fs-5"></i>নতুন পুঁজি যোগ করুন
        </h6>
      </div>

      <div class="card-body p-3 p-md-4">
        <form @submit.prevent="submitCapital">
          <div class="row g-3 align-items-end">
            <!-- ১. শেয়ারহোল্ডার / মালিকের নাম -->
            <div class="col-12 col-sm-6 col-md-3">
              <SearchSelect
                id="shareholderSelect"
                v-model="form.shareholderName"
                :options="shareholderOptions"
                label="শেয়ারহোল্ডারের নাম"
                placeholder="শেয়ারহোল্ডার খুঁজুন..."
                :err="errors.shareholderId"
                must
                @change="onShareholderSelectChange" />
            </div>

            <!-- ২. পুঁজির পরিমাণ (৳) -->
            <div class="col-12 col-sm-6 col-md-3">
              <Input
                id="capitalAmount"
                v-model="form.amount"
                type="number"
                step="0.01"
                min="0.01"
                label="পুঁজির পরিমাণ (৳)"
                placeholder="যেমন: 50000"
                topclass="mb-0"
                :err="errors.amount"
                must />
            </div>

            <!-- ৩. জমার তারিখ -->
            <div class="col-12 col-sm-6 col-md-2">
              <Input
                id="depositDate"
                v-model="form.depositDate"
                type="date"
                label="জমার তারিখ"
                topclass="mb-0"
                :err="errors.depositDate"
                must />
            </div>

            <!-- ৪. লেনদেনের মাধ্যম (ক্যাশ / ব্যাংক / এমএফএস) -->
            <div class="col-12 col-sm-6 col-md-2">
              <label for="paymentMethod" class="d-flex align-items-center mb-1">
                <span>লেনদেনের মাধ্যম</span>
                <span class="text-danger ms-1">*</span>
              </label>
              <select
                id="paymentMethod"
                v-model="form.paymentMethod"
                class="form-select"
                style="height: 38px;">
                <option value="ক্যাশ">ক্যাশ (Cash in Hand)</option>
                <option value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার</option>
                <option value="বিকাশ">বিকাশ (bKash)</option>
                <option value="নগদ">নগদ (Nagad)</option>
                <option value="রকেট">রকেট (Rocket)</option>
                <option value="অন্যান্য">অন্যান্য মাধ্যম</option>
              </select>
            </div>

            <!-- সংরক্ষণ ও রিসেট বাটন -->
            <div class="col-12 col-md-2 d-flex align-items-end gap-2">
              <button
                type="submit"
                class="btn btn-primary px-3 flex-grow-1 d-inline-flex align-items-center justify-content-center text-nowrap"
                style="height: 38px;"
                :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="bi bi-check-circle-fill me-1"></i>সংরক্ষণ
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary px-2.5 d-inline-flex align-items-center justify-content-center text-nowrap"
                style="height: 38px;"
                :disabled="submitting"
                @click="resetForm">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ২. শেয়ারের পরিমান ও শতকরা হার কার্ড -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 class="mb-0 fw-bold d-flex align-items-center">
          <i class="bi bi-pie-chart text-success me-2 fs-5"></i>শেয়ারের পরিমান ও শতকরা হার
        </h6>
      </div>

      <div class="card-body p-0">
        <div v-if="summaryData.shareholders.length === 0" class="text-center py-4 text-muted small">
          কোনো শেয়ারহোল্ডার যুক্ত করা হয়নি। অনুগ্রহ করে প্রথমে সেটিংস পেজ থেকে শেয়ারহোল্ডার যোগ করুন।
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th style="width: 5%;" class="text-center">#</th>
                <th style="width: 22%;">শেয়ারহোল্ডারের নাম</th>
                <th style="width: 18%;">পদবি / ভূমিকা</th>
                <th style="width: 18%;">মোবাইল নম্বর</th>
                <th style="width: 18%;" class="text-end">মোট জমাকৃত পুঁজি</th>
                <th style="width: 19%;" class="text-end pe-3">শেয়ারের অনুপাত (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sh, idx) in summaryData.shareholders" :key="sh.shareholderId">
                <td class="text-center fw-semibold text-muted small">{{ toBengaliNumber(idx + 1) }}</td>
                <td class="fw-bold text-body">{{ sh.shareholderName }}</td>
                <td><span class="badge bg-secondary bg-opacity-10 text-body border">{{ sh.role }}</span></td>
                <td class="font-monospace small text-body">{{ sh.mobile || '—' }}</td>
                <td class="text-end fw-bold text-success font-monospace">
                  <span class="currency-symbol">৳</span>{{ formatMoney(sh.totalCapital) }}
                </td>
                <td class="pe-3">
                  <div class="d-flex align-items-center justify-content-end gap-2">
                    <div class="progress flex-grow-1" style="height: 7px; max-width: 90px;">
                      <div
                        class="progress-bar bg-primary"
                        role="progressbar"
                        :style="{ width: Math.min(sh.sharePercentage, 100) + '%' }"
                        :aria-valuenow="sh.sharePercentage"
                        aria-valuemin="0"
                        aria-valuemax="100"></div>
                    </div>
                    <span class="fw-bold font-monospace small text-primary text-end" style="min-width: 48px;">
                      {{ toBengaliNumber(sh.sharePercentage.toFixed(2)) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card border shadow-sm w-100">
      <div class="card-header bg-transparent py-2 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 class="mb-0 fw-bold d-flex align-items-center">
          <i class="bi bi-clock-history text-primary me-2 fs-5"></i>পুঁজি রেকর্ড
        </h6>
        
        <!-- শেয়ারহোল্ডার ফিল্টার ড্রপডাউন -->
        <div class="d-flex align-items-center gap-2">
          <label for="filterShareholder" class="small text-muted text-nowrap d-none d-sm-inline">ফিল্টার:</label>
          <select
            id="filterShareholder"
            v-model="selectedShareholderFilter"
            class="form-select form-select-sm"
            style="min-width: 170px; height: 32px; font-size: 0.85rem;">
            <option value="all">সকল শেয়ারহোল্ডার ({{ toBengaliNumber(transactions.length) }})</option>
            <option
              v-for="sh in summaryData.shareholders"
              :key="sh.shareholderId"
              :value="sh.shareholderId">
              {{ sh.shareholderName }} ({{ sh.role }})
            </option>
          </select>
        </div>
      </div>


      <div class="card-body p-0">
        <!-- লোডিং -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <p class="text-muted small mt-2">পুঁজি লেনদেন লোড হচ্ছে...</p>
        </div>

        <!-- ফাঁকা স্টেট -->
        <div v-else-if="filteredTransactions.length === 0" class="text-center py-5 px-3">
          <div class="avatar-lg mx-auto mb-3 text-muted" style="font-size: 3rem;">
            <i class="bi bi-wallet2"></i>
          </div>
          <h6 class="fw-bold text-body">কোনো পুঁজি জমা লেনদেন পাওয়া যায়নি</h6>
          <p class="text-muted small mb-0">
            {{ selectedShareholderFilter === 'all' ? 'উপরের ফরম থেকে শেয়ারহোল্ডারের পুঁজি জমা এন্ট্রি করুন।' : 'এই শেয়ারহোল্ডারের কোনো পুঁজি রেকর্ড পাওয়া যায়নি।' }}
          </p>
        </div>

        <!-- লেনদেন তালিকা -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th style="width: 55px;" class="text-center">#</th>
                <th>জমার তারিখ</th>
                <th>শেয়ারহোল্ডারের নাম</th>
                <th>লেনদেনের মাধ্যম</th>
                <th class="text-end">পরিমাণ</th>
                <th style="width: 70px;" class="text-end pe-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, index) in filteredTransactions" :key="t.id">
                <td class="text-center text-muted fw-semibold small">{{ toBengaliNumber(index + 1) }}</td>
                <td class="text-body fw-medium small">{{ t.depositDate }}</td>
                <td class="fw-bold text-body">{{ t.shareholderName }}</td>
                <td>
                  <span class="badge bg-secondary bg-opacity-10 text-body border px-2 py-1">
                    {{ t.paymentMethod }}
                  </span>
                </td>
                <td class="text-end fw-bold text-success font-monospace">
                  <span class="currency-symbol">৳</span>{{ formatMoney(t.amount) }}
                </td>
                <td class="text-end pe-3">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger btn-action"
                    title="ডিলিট করুন"
                    @click="confirmDelete(t)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ডিলিট কনফার্মেশন মোডাল -->
    <div
      v-if="deletingItem"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-danger">
          <div class="modal-header py-3 bg-danger-subtle text-danger">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>পুঁজি লেনদেন মুছে ফেলা
            </h6>
            <button type="button" class="btn-close" @click="deletingItem = null"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <h6 class="fw-bold mb-2">আপনি কি নিশ্চিত এই পুঁজি এন্ট্রি মুছে ফেলতে চান?</h6>
            <p class="text-muted small mb-0">
              শেয়ারহোল্ডার: <strong>{{ deletingItem.shareholderName }}</strong><br>
              পরিমাণ: <strong>৳ {{ formatMoney(deletingItem.amount) }}</strong><br>
              তারিখ: <strong>{{ deletingItem.depositDate }}</strong>
            </p>
          </div>
          <div class="modal-footer py-2">
            <button type="button" class="btn btn-secondary" @click="deletingItem = null">
              বাতিল
            </button>
            <button
              type="button"
              class="btn btn-danger"
              :disabled="deleteSubmitting"
              @click="deleteCapital">
              <span v-if="deleteSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              মুছে ফেলুন
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import Input from "@/components/Input.vue";
import Pagebar from "@/components/Pagebar.vue";
import SearchSelect from "@/components/SearchSelect.vue";
import Toast from "@/components/Toast.vue";
import { toBengaliNumber } from "@/helpers/utils";

useHead({ title: "পুঁজি ও মূলধন ম্যানেজমেন্ট - MFS Ledger" });

const toastRef = ref<any>(null);
const loading = ref(false);
const submitting = ref(false);
const deleteSubmitting = ref(false);
const deletingItem = ref<any>(null);

// আজকের তারিখ yyyy-mm-dd
function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const form = reactive({
  shareholderId: 0,
  shareholderName: "",
  amount: "" as any,
  depositDate: getTodayDate(),
  paymentMethod: "ক্যাশ"
});

const errors = reactive<Record<string, string>>({});

interface ShareholderSummary {
  shareholderId: number;
  shareholderName: string;
  mobile?: string;
  role: string;
  totalCapital: number;
  sharePercentage: number;
}

const summaryData = reactive({
  totalCapital: 0,
  shareholders: [] as ShareholderSummary[]
});

// SearchSelect এর জন্য শেয়ারহোল্ডার অপশন
const shareholderOptions = computed(() => {
  return summaryData.shareholders.map(s => ({
    id: s.shareholderId,
    value: s.shareholderId,
    name: s.shareholderName,
    label: `${s.shareholderName} (${s.role})`,
    role: s.role
  }));
});

function onShareholderSelectChange(val: any, opt: any) {
  if (opt && opt.id) {
    form.shareholderId = Number(opt.id);
    form.shareholderName = opt.name || "";
    delete errors.shareholderId;
  } else {
    form.shareholderId = 0;
    form.shareholderName = "";
  }
}

const transactions = ref<any[]>([]);
const selectedShareholderFilter = ref<string | number>("all");

const filteredTransactions = computed(() => {
  if (selectedShareholderFilter.value === "all") {
    return transactions.value;
  }
  const targetId = Number(selectedShareholderFilter.value);
  return transactions.value.filter(t => Number(t.shareholderId) === targetId);
});

function formatMoney(val: any) {
  const num = Number(val) || 0;
  return toBengaliNumber(num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}

function resetForm() {
  form.shareholderId = 0;
  form.shareholderName = "";
  form.amount = "";
  form.depositDate = getTodayDate();
  form.paymentMethod = "ক্যাশ";
  Object.keys(errors).forEach(k => delete errors[k]);
}

async function fetchCapitalData() {
  loading.value = true;
  try {
    const res: any = await axios.get("/api/capital");
    if (res?.data?.data) {
      summaryData.totalCapital = Number(res.data.data.totalCapital) || 0;
      summaryData.shareholders = res.data.data.shareholderSummary || [];
      transactions.value = res.data.data.transactions || [];
    }
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "পুঁজি ডাটা লোড করতে সমস্যা হয়েছে");
  } finally {
    loading.value = false;
  }
}

async function submitCapital() {
  Object.keys(errors).forEach(k => delete errors[k]);

  if (!form.shareholderId || form.shareholderId <= 0) {
    errors.shareholderId = "শেয়ারহোল্ডার নির্বাচন করুন";
  }
  if (!form.amount || Number(form.amount) <= 0) {
    errors.amount = "পুঁজির সঠিক পরিমাণ দিন (০ এর বেশি)";
  }
  if (!form.depositDate) {
    errors.depositDate = "জমার তারিখ দিন";
  }

  if (Object.keys(errors).length > 0) return;

  submitting.value = true;
  try {
    const res: any = await axios.post("/api/capital", {
      shareholderId: form.shareholderId,
      amount: form.amount,
      depositDate: form.depositDate,
      paymentMethod: form.paymentMethod
    });

    toastRef.value?.success(res?.data?.message || "পুঁজি সফলভাবে যোগ করা হয়েছে");
    resetForm();
    await fetchCapitalData();
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "পুঁজি সংরক্ষণ করতে সমস্যা হয়েছে");
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(item: any) {
  deletingItem.value = item;
}

async function deleteCapital() {
  if (!deletingItem.value) return;
  deleteSubmitting.value = true;
  try {
    const res: any = await axios.delete(`/api/capital/${deletingItem.value.id}`);
    toastRef.value?.success(res?.data?.message || "পুঁজি মুছে ফেলা হয়েছে");
    deletingItem.value = null;
    await fetchCapitalData();
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "ডিলিট করতে সমস্যা হয়েছে");
  } finally {
    deleteSubmitting.value = false;
  }
}

onMounted(() => {
  fetchCapitalData();
});
</script>

<style scoped>
.capital-page {
  font-family: inherit;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.card-icon-box {
  width: 38px;
  height: 38px;
  border: 1.5px solid currentColor;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.25rem;
  background: transparent !important;
}

.currency-symbol {
  font-size: 0.72em;
  font-weight: 500;
  margin-right: 3px;
  opacity: 0.85;
  vertical-align: 0.05em;
}

.btn-action {
  width: 32px;
  height: 32px;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem !important;
  font-size: 0.85rem;
}
</style>
