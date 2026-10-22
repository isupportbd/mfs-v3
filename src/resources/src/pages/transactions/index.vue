<template>
  <Pagebar title="লেনদেন ম্যানেজমেন্ট" />
  <Toast ref="toastRef" />

  <div class="transactions-page w-100" style="min-width: 0; max-width: 100%;">
    <!-- ৪টি প্রধান লেনদেন অ্যাকশন কার্ড (ক্যাশ ইন, ক্যাশ আউট, পে-বিল, ট্রান্সফার) -->
    <div class="row g-3 mb-4">
      <!-- ১. ক্যাশ ইন -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div
          class="card border shadow-sm h-100 action-card card-bar-success"
          :class="{ 'active-action': activeType === 'ক্যাশ ইন' }"
          @click="openModal('ক্যাশ ইন')">
          <div class="card-body p-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center min-w-0">
              <div class="card-icon-box text-success me-3">
                <i class="bi bi-box-arrow-in-down"></i>
              </div>
              <div class="text-truncate">
                <h5 class="mb-0 fs-6 fw-bold text-truncate">ক্যাশ ইন</h5>
                <span class="text-muted small">Cash In</span>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-success rounded-pill px-3 py-1 small">
              করুন
            </button>
          </div>
        </div>
      </div>

      <!-- ২. ক্যাশ আউট -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div
          class="card border shadow-sm h-100 action-card card-bar-danger"
          :class="{ 'active-action': activeType === 'ক্যাশ আউট' }"
          @click="openModal('ক্যাশ আউট')">
          <div class="card-body p-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center min-w-0">
              <div class="card-icon-box text-danger me-3">
                <i class="bi bi-box-arrow-up"></i>
              </div>
              <div class="text-truncate">
                <h5 class="mb-0 fs-6 fw-bold text-truncate">ক্যাশ আউট</h5>
                <span class="text-muted small">Cash Out</span>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 small">
              করুন
            </button>
          </div>
        </div>
      </div>

      <!-- ৩. পে-বিল -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div
          class="card border shadow-sm h-100 action-card card-bar-warning"
          :class="{ 'active-action': activeType === 'পে-বিল' }"
          @click="openModal('পে-বিল')">
          <div class="card-body p-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center min-w-0">
              <div class="card-icon-box text-warning me-3">
                <i class="bi bi-receipt"></i>
              </div>
              <div class="text-truncate">
                <h5 class="mb-0 fs-6 fw-bold text-truncate">পে-বিল</h5>
                <span class="text-muted small">Pay Bill</span>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-warning rounded-pill px-3 py-1 small">
              করুন
            </button>
          </div>
        </div>
      </div>

      <!-- ৪. ট্রান্সফার -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div
          class="card border shadow-sm h-100 action-card card-bar-primary"
          :class="{ 'active-action': activeType === 'ট্রান্সফার' }"
          @click="openModal('ট্রান্সফার')">
          <div class="card-body p-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center min-w-0">
              <div class="card-icon-box text-primary me-3">
                <i class="bi bi-arrow-left-right"></i>
              </div>
              <div class="text-truncate">
                <h5 class="mb-0 fs-6 fw-bold text-truncate">ট্রান্সফার</h5>
                <span class="text-muted small">Transfer</span>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 small">
              করুন
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- লেনদেন হিস্ট্রি তালিকা -->
    <div class="card border shadow-sm w-100">
      <div class="card-header bg-transparent py-2.5 px-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 class="mb-0 fw-bold d-flex align-items-center text-nowrap">
          <i class="bi bi-clock-history text-primary me-2 fs-5"></i>লেনদেন রেকর্ড
        </h6>

        <!-- ফিল্টারসমূহ (তারিখ থেকে তারিখ ও টাইপ) - সম্পূর্ণ রেসপন্সিভ -->
        <div class="filter-controls-wrapper d-flex align-items-center flex-wrap gap-2 ms-auto">
          <!-- ডেট টু ডেট ফিল্টার -->
          <div class="date-filter-group d-flex align-items-center gap-1">
            <span class="small text-muted text-nowrap d-none d-sm-inline">তারিখ:</span>
            <input
              v-model="startDate"
              type="date"
              class="form-control form-control-sm date-input"
              title="শুরুর তারিখ" />
            <span class="text-muted small">-</span>
            <input
              v-model="endDate"
              type="date"
              class="form-control form-control-sm date-input"
              title="শেষের তারিখ" />
          </div>

          <!-- টাইপ ও রিসেট ফিল্টার গ্রুপ -->
          <div class="type-reset-group d-flex align-items-center gap-1">
            <select
              id="filterType"
              v-model="filterType"
              class="form-select form-select-sm filter-type-select">
              <option value="all">সকল টাইপ ({{ toBengaliNumber(filteredTransactions.length) }})</option>
              <option value="ক্যাশ ইন">ক্যাশ ইন</option>
              <option value="ক্যাশ আউট">ক্যাশ আউট</option>
              <option value="পে-বিল">পে-বিল</option>
              <option value="ট্রান্সফার">ট্রান্সফার</option>
            </select>

            <!-- ফিল্টার রিসেট বাটন -->
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary px-2.5 py-0.5 small d-inline-flex align-items-center flex-shrink-0"
              style="height: 32px;"
              title="ফিল্টার রিসেট করুন"
              @click="resetToToday">
              <i class="bi bi-arrow-counterclockwise me-1"></i>রিসেট
            </button>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- লোডিং -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <p class="text-muted small mt-2">লেনদেন ডাটা লোড হচ্ছে...</p>
        </div>

        <!-- ফাঁকা স্টেট -->
        <div v-else-if="filteredTransactions.length === 0" class="text-center py-5 px-3">
          <div class="avatar-lg mx-auto mb-3 text-muted" style="font-size: 3rem;">
            <i class="bi bi-arrow-left-right"></i>
          </div>
          <h6 class="fw-bold text-body">কোনো লেনদেন রেকর্ড পাওয়া যায়নি</h6>
          <p class="text-muted small mb-0">উপরের ৪টি অপশন কার্ড থেকে নতুন লেনদেন সম্পন্ন করুন।</p>
        </div>

        <!-- লেনদেন টেবিল -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="min-width: 680px;">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th style="width: 45px;" class="text-center">#</th>
                <th style="width: 15%;">ধরণ</th>
                <th style="width: 22%;">গ্রাহক / বিবরণ</th>
                <th style="width: 22%;">প্রোভাইডার / ওয়ালেট</th>
                <th style="width: 16%;">রেফারেন্স / TrxID</th>
                <th style="width: 15%;" class="text-end">পরিমাণ</th>
                <th style="width: 55px;" class="text-end pe-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, idx) in filteredTransactions" :key="t.id">
                <td class="text-center fw-semibold text-muted small">{{ toBengaliNumber(idx + 1) }}</td>
                <td>
                  <span
                    class="badge px-2 py-1"
                    :class="{
                      'bg-success-subtle text-success border border-success-subtle': t.type === 'ক্যাশ ইন',
                      'bg-danger-subtle text-danger border border-danger-subtle': t.type === 'ক্যাশ আউট',
                      'bg-warning-subtle text-warning-emphasis border border-warning-subtle': t.type === 'পে-বিল',
                      'bg-primary-subtle text-primary border border-primary-subtle': t.type === 'ট্রান্সফার'
                    }">
                    {{ t.type }}
                  </span>
                  <div v-if="t.transferSubtype" class="small text-muted mt-0.5">
                    {{ t.transferSubtype }}
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-body">{{ t.customerMobile || 'সরাসরি' }}</div>
                  <div v-if="t.billerName" class="small text-muted">{{ t.billerName }} ({{ t.billAccountNumber }})</div>
                </td>
                <td>
                  <span class="small text-body">{{ getProviderName(t.fromProviderId) }}</span>
                  <span v-if="t.toProviderId" class="small text-muted"> → {{ getProviderName(t.toProviderId) }}</span>
                </td>
                <td class="font-monospace small text-muted">{{ t.trNumber || '—' }}</td>
                <td class="text-end fw-bold text-body font-monospace">
                  <span class="currency-symbol">৳</span>{{ formatMoney(t.amount) }}
                </td>
                <td class="text-end pe-3">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger btn-action"
                    title="ডিলিট করুন"
                    @click="deleteItem(t.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- লেনদেন এন্ট্রি মডাল -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow border-0">
          <div class="modal-header py-3 border-bottom">
            <h6 class="modal-title fw-bold d-flex align-items-center">
              <span
                class="badge me-2 px-2.5 py-1"
                :class="{
                  'bg-success text-white': form.type === 'ক্যাশ ইন',
                  'bg-danger text-white': form.type === 'ক্যাশ আউট',
                  'bg-warning text-dark': form.type === 'পে-বিল',
                  'bg-primary text-white': form.type === 'ট্রান্সফার'
                }">
                {{ form.type }}
              </span>
              <span>নতুন লেনদেন</span>
            </h6>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <form @submit.prevent="submitTransaction">
            <div class="modal-body p-3 p-md-4">


              <!-- পে-বিল সংক্রান্ত ফিল্ড (পে-বিল হলে বিলারের নাম ও হিসাব নং) -->
              <div v-if="form.type === 'পে-বিল'" class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="d-flex align-items-center mb-1">
                    <div class="position-relative">
                      <span>বিলারের নাম</span>
                      <span class="position-absolute text-danger rounded-circle bg-danger must"></span>
                    </div>
                  </label>
                  <select v-model="form.billerName" class="form-select" style="height: 38px;">
                    <option value="পল্লী বিদ্যুৎ">পল্লী বিদ্যুৎ</option>
                    <option value="নেসকো (NESCO)">নেসকো (NESCO)</option>
                    <option value="ডেসকো (DESCO)">ডেসকো (DESCO)</option>
                    <option value="ওয়াসা (WASA)">ওয়াসা (WASA)</option>
                    <option value="তিতাস গ্যাস">তিতাস গ্যাস</option>
                    <option value="অন্যান্য বিল">অন্যান্য বিল</option>
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <Input
                    id="billAccountNumber"
                    v-model="form.billAccountNumber"
                    label="বিল অ্যাকাউন্ট / মিটার নং"
                    placeholder="হিসাব নং লিখুন..."
                    must
                    topclass="mb-0" />
                </div>
              </div>

              <!-- ইউজার স্ক্র্যাচ অনুযায়ী নিখুঁত ২ কলামের ক্রম - ফ্রেমওয়ার্ক স্ট্যান্ডার্ড Input কম্পোনেন্ট -->
              <div class="row g-3">
                <!-- সারি ১, কলাম ১: ওয়ালেট -->
                <div class="col-12 col-md-6">
                  <label for="fromProviderSelect" class="d-flex align-items-center mb-1">
                    <div class="position-relative">
                      <span>{{ form.type === 'ট্রান্সফার' ? 'উৎস ওয়ালেট / ব্যাংক' : 'ওয়ালেট' }}</span>
                      <span class="position-absolute text-danger rounded-circle bg-danger must"></span>
                    </div>
                  </label>
                  <select
                    id="fromProviderSelect"
                    v-model="form.fromProviderId"
                    class="form-select"
                    style="height: 38px;"
                    required>
                    <option value="">ওয়ালেট নির্বাচন করুন</option>
                    <option v-for="p in fromProviderOptions" :key="p.id" :value="p.id">
                      {{ p.id === 'cash' ? 'ক্যাশ' : `${p.providerName} - ${p.accountNumber}` }}
                    </option>
                  </select>
                </div>

                <!-- সারি ১, কলাম ২: ব্যালেন্স (ফ্রেমওয়ার্কের Input কম্পোনেন্ট) -->
                <div class="col-12 col-md-6">
                  <Input
                    id="currentBalanceInput"
                    :model-value="selectedFromProvider ? (selectedFromProvider.id === 'cash' ? 'দোকানের ক্যাশ' : '৳ ' + formatMoney(selectedFromProvider.balance)) : '৳ ০.০০'"
                    label="ব্যালেন্স"
                    readonly
                    topclass="mb-0" />
                </div>

                <!-- ট্রান্সফার হলে গন্তব্য ওয়ালেট ও ব্যালেন্স সারি -->
                <template v-if="form.type === 'ট্রান্সফার'">
                  <div class="col-12 col-md-6">
                    <label for="toProviderSelect" class="d-flex align-items-center mb-1">
                      <div class="position-relative">
                        <span>গন্তব্য ওয়ালেট / ব্যাংক</span>
                        <span class="position-absolute text-danger rounded-circle bg-danger must"></span>
                      </div>
                    </label>
                    <select
                      id="toProviderSelect"
                      v-model="form.toProviderId"
                      class="form-select"
                      style="height: 38px;"
                      required>
                      <option value="">গন্তব্য ওয়ালেট নির্বাচন করুন</option>
                      <option v-for="p in toProviderOptions" :key="p.id" :value="p.id">
                        {{ p.id === 'cash' ? 'ক্যাশ' : `${p.providerName} - ${p.accountNumber}` }}
                      </option>
                    </select>
                  </div>
                  <div class="col-12 col-md-6">
                    <Input
                      id="destinationBalanceInput"
                      :model-value="selectedToProvider ? (selectedToProvider.id === 'cash' ? 'দোকানের ক্যাশ' : '৳ ' + formatMoney(selectedToProvider.balance)) : '৳ ০.০০'"
                      label="গন্তব্য ব্যালেন্স"
                      readonly
                      topclass="mb-0" />
                  </div>
                </template>

                <!-- ট্রান্সফার না হলে গ্রাহকের মোবাইল দেখাবে -->
                <div v-if="form.type !== 'ট্রান্সফার'" class="col-12 col-md-6">
                  <Input
                    id="customerMobile"
                    v-model="form.customerMobile"
                    label="গ্রাহকের মোবাইল"
                    placeholder="01XXXXXXXXX"
                    category="mobile"
                    must
                    topclass="mb-0" />
                </div>

                <!-- টাকার পরিমান -->
                <div :class="form.type === 'ট্রান্সফার' ? 'col-12' : 'col-12 col-md-6'">
                  <Input
                    id="transactionAmount"
                    v-model="form.amount"
                    label="টাকার পরিমান"
                    placeholder="যেমন: 5000"
                    category="decimal"
                    must
                    topclass="mb-0" />
                </div>

                <!-- কাস্টমার লেনদেনের অতিরিক্ত চার্জ ও ট্রানজেকশন ফিল্ড (ট্রান্সফারের ক্ষেত্রে এগুলো প্রয়োজন নেই) -->
                <template v-if="form.type !== 'ট্রান্সফার'">
                  <!-- ট্রাক্স আইডি (TrxID) -->
                  <div class="col-12 col-md-6">
                    <Input
                      id="trNumber"
                      v-model="form.trNumber"
                      label="TrxID"
                      placeholder="যেমন: BKL89234XX"
                      topclass="mb-0" />
                  </div>

                  <!-- সার্ভিস চার্জ -->
                  <div class="col-12 col-md-6">
                    <Input
                      id="serviceFee"
                      v-model="form.fee"
                      label="সার্ভিস চার্জ (৳)"
                      placeholder="0.00"
                      category="decimal"
                      topclass="mb-0" />
                  </div>

                  <!-- কমিশন -->
                  <div class="col-12 col-md-6">
                    <Input
                      id="commission"
                      v-model="form.commission"
                      label="কমিশন (৳)"
                      placeholder="0.00"
                      category="decimal"
                      topclass="mb-0" />
                  </div>

                  <!-- অন্যান্য ফি -->
                  <div class="col-12 col-md-6">
                    <Input
                      id="otherFee"
                      v-model="form.otherFee"
                      label="অন্যান্য ফি (৳)"
                      placeholder="0.00"
                      category="decimal"
                      topclass="mb-0" />
                  </div>
                </template>

                <!-- সারি: নোট / মন্তব্য (ঐচ্ছিক পূর্ণ প্রস্থ) -->
                <div class="col-12">
                  <Input
                    id="note"
                    v-model="form.note"
                    label="নোট / মন্তব্য"
                    placeholder="অতিরিক্ত মন্তব্য থাকলে লিখুন..."
                    topclass="mb-0" />
                </div>
              </div>
            </div>

            <div class="modal-footer py-2 border-top">
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="closeModal">
                বাতিল
              </button>
              <button
                type="submit"
                class="btn btn-sm btn-primary px-4 d-inline-flex align-items-center"
                :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="bi bi-check-circle-fill me-1"></i>নিশ্চিত করুন
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import Input from "@/components/Input.vue";
import Pagebar from "@/components/Pagebar.vue";
import Toast from "@/components/Toast.vue";
import { pulse } from "@/plugins/pulse";
import { toBengaliNumber } from "@/helpers/utils";

useHead({ title: "লেনদেন - MFS Ledger" });

const toastRef = ref<any>(null);
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const activeType = ref("");
const filterType = ref("all");

const transferSubtypes = ["ওয়ালেট টু ওয়ালেট", "ব্যাংক টু ওয়ালেট", "ওয়ালেট টু ব্যাংক", "ব্যাংক টু ব্যাংক"];

const transactions = ref<any[]>([]);
const providerList = ref<any[]>([]);

function isBankProvider(p: any) {
  if (!p) return false;
  if (p.provider && p.provider.type) {
    return p.provider.type === "bank";
  }
  const accType = (p.accountType || "").toLowerCase();
  const name = (p.providerName || "").toLowerCase();
  return accType === "কারেন্ট" || accType === "সেইভিংস" || name.includes("bank") || name.includes("ব্যাংক");
}

// ক্যাশ অবজেক্ট
const cashOption = {
  id: "cash",
  providerName: "ক্যাশ",
  accountNumber: "",
  accountType: "ক্যাশ",
  balance: 0
};

// নির্বাচিত ওয়ালেটের বর্তমান ব্যালেন্স
const selectedFromProvider = computed(() => {
  if (!form.fromProviderId) return null;
  if (form.fromProviderId === "cash") return cashOption;
  return providerList.value.find(p => p.id === Number(form.fromProviderId)) || null;
});

const selectedToProvider = computed(() => {
  if (!form.toProviderId) return null;
  if (form.toProviderId === "cash") return cashOption;
  return providerList.value.find(p => p.id === Number(form.toProviderId)) || null;
});

// ফিল্টারিং: টাইপ অনুযায়ী উৎস ওয়ালেট/ব্যাংক
const fromProviderOptions = computed(() => {
  if (form.type === "ক্যাশ ইন" || form.type === "ক্যাশ আউট" || form.type === "পে-বিল") {
    // ক্যাশ ইন, ক্যাশ আউট, পে-বিল শুধুমাত্র MFS ওয়ালেট
    return providerList.value.filter(p => !isBankProvider(p));
  }
  // ট্রান্সফারের ক্ষেত্রে ক্যাশ ইন হ্যান্ড, যেকোনো ওয়ালেট বা ব্যাংক অ্যাকাউন্ট উৎস হতে পারে
  return [cashOption, ...providerList.value];
});

const toProviderOptions = computed(() => {
  // গন্তব্যে উৎস ছাড়া ক্যাশ ইন হ্যান্ড এবং যেকোনো ওয়ালেট বা ব্যাংক অ্যাকাউন্ট
  const all = [cashOption, ...providerList.value];
  return all.filter(p => String(p.id) !== String(form.fromProviderId));
});

function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const startDate = ref(getTodayDateStr());
const endDate = ref(getTodayDateStr());

function resetToToday() {
  startDate.value = getTodayDateStr();
  endDate.value = getTodayDateStr();
  filterType.value = "all";
}

const form = reactive({
  type: "ক্যাশ ইন",
  transferSubtype: "বি2বি ট্রান্সফার",
  customerId: null as number | null,
  customerMobile: "",
  fromProviderId: "" as any,
  toProviderId: "" as any,
  amount: "",
  fee: "0",
  commission: "0",
  otherFee: "0",
  trNumber: "",
  billerName: "পল্লী বিদ্যুৎ",
  billAccountNumber: "",
  note: ""
});

const filteredTransactions = computed(() => {
  return transactions.value.filter(t => {
    // ১. টাইপ ফিল্টার
    if (filterType.value !== "all" && t.type !== filterType.value) {
      return false;
    }
    // ২. তারিখ ফিল্টার (লোকাল টাইমজোন অনুযায়ী সঠিক ক্যালকুলেশন)
    if (t.createdAt) {
      const d = new Date(t.createdAt);
      const itemDate = d.toLocaleDateString("en-CA");
      if (startDate.value && itemDate < startDate.value) return false;
      if (endDate.value && itemDate > endDate.value) return false;
    }
    return true;
  });
});

function formatMoney(val: any) {
  const num = Number(val) || 0;
  return toBengaliNumber(num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}

function getProviderName(id: any) {
  if (!id) return "ক্যাশ";
  if (id === "cash") return "ক্যাশ";
  const p = providerList.value.find(item => item.id === Number(id));
  return p ? `${p.providerName} (${p.accountNumber})` : `ID: ${id}`;
}

// ওয়ালেট অপশন পরিবর্তন হলে অবৈধ সিলেকশন স্বয়ংক্রিয়ভাবে ক্লিয়ার
watch([fromProviderOptions, toProviderOptions], () => {
  if (form.fromProviderId) {
    const valid = fromProviderOptions.value.some(p => String(p.id) === String(form.fromProviderId));
    if (!valid) form.fromProviderId = "";
  }
  if (form.toProviderId) {
    const valid = toProviderOptions.value.some(p => String(p.id) === String(form.toProviderId));
    if (!valid) form.toProviderId = "";
  }
});

const customerFeeRules = ref<any[]>([]);

async function fetchCustomerFeeRules() {
  try {
    const res = await axios.get("/api/settings/customer-fees");
    customerFeeRules.value = (res.data.data || []).filter((r: any) => r.isActive);
  } catch (e) {
    customerFeeRules.value = [];
  }
}

function calculateSuggestedFee() {
  const amt = Number(form.amount) || 0;
  if (amt <= 0) return;

  const matchedRule = customerFeeRules.value.find((r: any) => {
    if (r.transactionType !== form.type) return false;
    if (form.type === "পে-বিল" && r.billerName && r.billerName !== "সকল" && r.billerName !== form.billerName) {
      return false;
    }
    return true;
  });

  if (!matchedRule) return;

  if (matchedRule.feeType === "flat") {
    form.fee = String(Number(matchedRule.flatFee) || 0);
  } else if (matchedRule.feeType === "percentage") {
    const pct = Number(matchedRule.percentageFee) || 0;
    form.fee = String(((amt * pct) / 100).toFixed(2));
  } else if (matchedRule.feeType === "slab" && matchedRule.slabsJson) {
    const slabs = Array.isArray(matchedRule.slabsJson) ? matchedRule.slabsJson : [];
    const matchedSlab = slabs.find((s: any) => amt >= Number(s.min) && amt <= Number(s.max));
    if (matchedSlab) {
      form.fee = String(Number(matchedSlab.fee) || 0);
    }
  }
}

watch([() => form.amount, () => form.type, () => form.billerName], () => {
  calculateSuggestedFee();
});

function openModal(type: string) {
  activeType.value = type;
  form.type = type;
  form.transferSubtype = "ওয়ালেট টু ওয়ালেট";
  form.fromProviderId = "";
  form.toProviderId = "";
  form.amount = "";
  form.fee = "0";
  form.commission = "0";
  form.otherFee = "0";
  form.trNumber = "";
  form.customerMobile = "";
  form.billAccountNumber = "";
  form.note = "";
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  activeType.value = "";
}

async function fetchTransactions() {
  loading.value = true;
  try {
    const res: any = await axios.get("/api/transactions");
    if (res?.data?.data?.transactions) {
      transactions.value = res.data.data.transactions;
    }
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "লেনদেন ডাটা লোড করতে ব্যর্থ হয়েছে");
  } finally {
    loading.value = false;
  }
}

async function fetchProviders() {
  try {
    const res: any = await axios.get("/api/providers");
    providerList.value = res?.data?.data || [];
  } catch {
    providerList.value = [];
  }
}

async function submitTransaction() {
  submitting.value = true;
  try {
    let dynamicSubtype = form.transferSubtype;
    if (form.type === "ট্রান্সফার") {
      const fromIsCash = form.fromProviderId === "cash";
      const toIsCash = form.toProviderId === "cash";
      const fromIsBank = isBankProvider(selectedFromProvider.value);
      const toIsBank = isBankProvider(selectedToProvider.value);

      if (fromIsCash && !toIsBank) {
        dynamicSubtype = "ব্যালেন্স রিচার্জ (ক্যাশ দিয়ে)";
      } else if (fromIsCash && toIsBank) {
        dynamicSubtype = "ক্যাশ ব্যাংকে জমা";
      } else if (fromIsBank && toIsCash) {
        dynamicSubtype = "ব্যাংক থেকে ক্যাশ উত্তোলন";
      } else if (fromIsBank && !toIsBank) {
        dynamicSubtype = "ব্যাংক থেকে ব্যালেন্স আনা";
      } else if (!fromIsBank && toIsBank) {
        dynamicSubtype = "ওয়ালেট টু ব্যাংক";
      } else if (!fromIsBank && toIsCash) {
        dynamicSubtype = "ওয়ালেট থেকে ক্যাশ উত্তোলন";
      } else if (fromIsBank && toIsBank) {
        dynamicSubtype = "ব্যাংক টু ব্যাংক";
      } else {
        dynamicSubtype = "ওয়ালেট টু ওয়ালেট (B2B)";
      }
    }

    const res: any = await axios.post("/api/transactions", {
      ...form,
      transferSubtype: form.type === "ট্রান্সফার" ? dynamicSubtype : null,
      fromProviderId: form.fromProviderId && form.fromProviderId !== "cash" ? Number(form.fromProviderId) : null,
      toProviderId: form.toProviderId && form.toProviderId !== "cash" ? Number(form.toProviderId) : null,
      amount: Number(form.amount),
      fee: Number(form.fee || 0),
      commission: Number(form.commission || 0),
      otherFee: Number(form.otherFee || 0)
    });

    toastRef.value?.success(res?.data?.message || "লেনদেন সফলভাবে সম্পন্ন হয়েছে");
    closeModal();
    await fetchTransactions();
  } catch (e: any) {
    const msg = e?.response?.data?.errors?.[0]?.message || e?.response?.data?.message || "লেনদেন সম্পন্ন করতে সমস্যা হয়েছে";
    toastRef.value?.error(msg);
  } finally {
    submitting.value = false;
  }
}

async function deleteItem(id: number) {
  if (!confirm("আপনি কি নিশ্চিতভাবে এই লেনদেন রেকর্ডটি মুছে ফেলতে চান?")) return;
  try {
    const res: any = await axios.delete(`/api/transactions/${id}`);
    toastRef.value?.success(res?.data?.message || "লেনদেন মুছে ফেলা হয়েছে");
    await fetchTransactions();
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "ডিলিট করতে ব্যর্থ হয়েছে");
  }
}

// রিয়েলটাইমে নতুন লেনদেন ও ডিলিট আপডেট
let currentChannel: any = null;
function setupRealtimeListeners() {
  try {
    const channel = pulse.channel("transactions");
    channel.listen("transaction.created", onTransactionCreated);
    channel.listen("transaction.deleted", onTransactionDeleted);
    currentChannel = channel;
  } catch (err) {
    console.error("Transactions realtime listener setup failed:", err);
  }
}

function onTransactionCreated(e: any) {
  const item = e?.data || e;
  if (item && item.id) {
    const exists = transactions.value.some(t => t.id === item.id);
    if (!exists) {
      transactions.value.unshift(item);
    }
  }
}

function onTransactionDeleted(e: any) {
  const id = e?.data?.id || e?.id;
  if (id) {
    transactions.value = transactions.value.filter(t => t.id !== Number(id));
  }
}

onMounted(() => {
  fetchTransactions();
  fetchProviders();
  fetchCustomerFeeRules();
  setupRealtimeListeners();
});

onUnmounted(() => {
  if (currentChannel) {
    currentChannel.stopListening("transaction.created", onTransactionCreated);
    currentChannel.stopListening("transaction.deleted", onTransactionDeleted);
  }
  pulse.leave("transactions");
});
</script>

<style scoped>
.transactions-page {
  font-family: inherit;
  width: 100%;
  max-width: 100%;
}

.action-card {
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-top-width: 3.5px !important;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.08) !important;
}

.card-bar-primary {
  border-top-color: #0d6efd !important;
}

.card-bar-success {
  border-top-color: #198754 !important;
}

.card-bar-danger {
  border-top-color: #dc3545 !important;
}

.card-bar-warning {
  border-top-color: #ffc107 !important;
}

.card-icon-box {
  width: 40px;
  height: 40px;
  border: 1.5px solid currentColor;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.2rem;
  background: transparent;
}

.currency-symbol {
  font-size: 0.8em;
  font-weight: 500;
  margin-right: 2px;
  opacity: 0.85;
}

.date-input {
  width: 130px;
  height: 32px;
  font-size: 0.85rem;
}

.filter-type-select {
  min-width: 135px;
  height: 32px;
  font-size: 0.85rem;
}

.btn-action {
  width: 30px;
  height: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

/* মোবাইল ও ছোট স্ক্রিন রেসপন্সিভ অপটিমাইজেশন */
@media (max-width: 767.98px) {
  .filter-controls-wrapper {
    width: 100%;
    margin-left: 0 !important;
    justify-content: space-between;
  }
}

@media (max-width: 575.98px) {
  .action-card .card-body {
    padding: 0.75rem !important;
  }

  .card-icon-box {
    width: 34px;
    height: 34px;
    font-size: 1rem;
    margin-right: 0.5rem !important;
  }

  .action-card h5 {
    font-size: 0.875rem !important;
  }

  .filter-controls-wrapper {
    flex-direction: column;
    align-items: stretch !important;
    gap: 0.5rem !important;
  }

  .date-filter-group {
    width: 100%;
    justify-content: space-between;
  }

  .date-filter-group .date-input {
    flex: 1;
    width: auto;
    font-size: 0.8rem;
  }

  .type-reset-group {
    width: 100%;
  }

  .type-reset-group .filter-type-select {
    flex: 1;
    min-width: 0;
  }
}

.transfer-type-btn {
  font-size: 0.8rem !important;
  transition: all 0.15s ease-in-out;
}

:deep([data-bs-theme="dark"]) .transfer-type-btn:not(.active-type-btn),
[data-bs-theme="dark"] .transfer-type-btn:not(.active-type-btn) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: var(--bs-body-color, #e2e8f0) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

:deep([data-bs-theme="dark"]) .transfer-type-btn:not(.active-type-btn):hover,
[data-bs-theme="dark"] .transfer-type-btn:not(.active-type-btn):hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}
</style>
