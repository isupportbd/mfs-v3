<template>
  <Pagebar title="ঋণ ও দেনা ম্যানেজমেন্ট" />
  <Toast ref="toastRef" />

  <div class="loans-page w-100" style="min-width: 0; max-width: 100%; overflow-x: hidden;">
    <!-- সারসংক্ষেপ কার্ডসমূহ -->
    <div class="row g-3 mb-4">
      <!-- ১. মোট দেনা (গৃহীত ঋণ বকেয়া) -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-danger">
          <div class="card-body p-3 d-flex align-items-center">
            <div class="card-icon-box text-danger me-3">
              <i class="bi bi-arrow-down-left-circle"></i>
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <span class="text-muted small fw-medium d-block">অবশিষ্ট দেনা (গৃহীত ঋণ)</span>
              <h4 class="mb-0 fw-bold text-danger font-monospace text-truncate">
                <span class="currency-symbol">৳</span>{{ formatMoney(summary.totalPayableDue) }}
              </h4>
              <small class="text-muted" style="font-size: 0.75rem;">মোট নেওয়া: ৳{{ formatMoney(summary.totalPayable) }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- ২. মোট পাওনা (প্রদত্ত ঋণ বকেয়া) -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-success">
          <div class="card-body p-3 d-flex align-items-center">
            <div class="card-icon-box text-success me-3">
              <i class="bi bi-arrow-up-right-circle"></i>
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <span class="text-muted small fw-medium d-block">অবশিষ্ট পাওনা (প্রদত্ত ঋণ)</span>
              <h4 class="mb-0 fw-bold text-success font-monospace text-truncate">
                <span class="currency-symbol">৳</span>{{ formatMoney(summary.totalReceivableDue) }}
              </h4>
              <small class="text-muted" style="font-size: 0.75rem;">মোট দেওয়া: ৳{{ formatMoney(summary.totalReceivable) }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- ৩. সক্রিয় ঋণের সংখ্যা -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-warning">
          <div class="card-body p-3 d-flex align-items-center">
            <div class="card-icon-box text-warning me-3">
              <i class="bi bi-clock-history"></i>
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <span class="text-muted small fw-medium d-block">চলতি বাকি ঋণ</span>
              <h4 class="mb-0 fw-bold text-body text-truncate">
                {{ toBengaliNumber(activeLoansCount) }} টি
              </h4>
              <small class="text-muted" style="font-size: 0.75rem;">পরিশোধিত: {{ toBengaliNumber(paidLoansCount) }} টি</small>
            </div>
          </div>
        </div>
      </div>

      <!-- ৪. দ্রুত অ্যাকশন (নতুন ঋণ যোগ) -->
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border shadow-sm h-100 card-bar-primary">
          <div class="card-body p-3 d-flex flex-column justify-content-between">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-medium">নতুন এন্ট্রি</span>
              <i class="bi bi-plus-circle text-primary fs-5"></i>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-primary w-100 rounded-pill py-2"
              @click="openAddModal">
              <i class="bi bi-plus-lg me-1"></i>ঋণ / দেনা যোগ করুন
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- তালিকা ও ফিল্টার সেকশন -->
    <div class="card border shadow-sm mb-4">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h5 class="mb-0 fs-6 fw-bold theme-text d-flex align-items-center">
            <i class="bi bi-journal-text text-primary me-2"></i>ঋণ ও দেনার খাতা
          </h5>
          <span class="badge bg-secondary-subtle text-secondary border">
            মোট {{ loansList.length }} টি
          </span>
        </div>

        <!-- ফিল্টার ট্যাব -->
        <div class="btn-group btn-group-sm" role="group">
          <button
            type="button"
            class="btn"
            :class="filterTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="filterTab = 'all'">
            সকল
          </button>
          <button
            type="button"
            class="btn"
            :class="filterTab === 'payable' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="filterTab = 'payable'">
            গৃহীত ঋণ (দেনা)
          </button>
          <button
            type="button"
            class="btn"
            :class="filterTab === 'receivable' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="filterTab = 'receivable'">
            প্রদত্ত ঋণ (পাওনা)
          </button>
          <button
            type="button"
            class="btn"
            :class="filterTab === 'active' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="filterTab = 'active'">
            বকেয়া আছে
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- লোডিং -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2">ডাটা লোড হচ্ছে...</p>
        </div>

        <!-- ফাঁকা অবস্থা -->
        <div v-else-if="filteredLoans.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-journal-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
          <p class="mb-0">কোনো ঋণের রেকর্ড পাওয়া যায়নি।</p>
        </div>

        <!-- টেবিল -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr class="table-header-row">
                <th class="ps-3" style="width: 50px;">#</th>
                <th>ধরন</th>
                <th>ব্যক্তি / প্রতিষ্ঠান</th>
                <th>তারিখ ও মাধ্যম</th>
                <th>পরিশোধের মেয়াদ</th>
                <th class="text-end">মোট ঋণ</th>
                <th class="text-end">পরিশোধিত</th>
                <th class="text-end">অবশিষ্ট বাকি</th>
                <th class="text-center">স্ট্যাটাস</th>
                <th class="text-end pe-3" style="width: 140px;">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(loan, idx) in filteredLoans" :key="loan.id">
                <td class="ps-3 small text-muted">{{ toBengaliNumber(idx + 1) }}</td>
                <td>
                  <span
                    class="badge px-2 py-1"
                    :class="loan.type === 'payable' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-success-subtle text-success border border-success-subtle'">
                    {{ loan.type === 'payable' ? 'গৃহীত (দেনা)' : 'প্রদত্ত (পাওনা)' }}
                  </span>
                </td>
                <td>
                  <div class="fw-bold theme-text">{{ loan.personName }}</div>
                  <small v-if="loan.mobile" class="text-muted d-block font-monospace">
                    <i class="bi bi-telephone me-1"></i>{{ loan.mobile }}
                  </small>
                </td>
                <td class="small">
                  <div>{{ formatDate(loan.loanDate) }}</div>
                  <span class="badge bg-secondary-subtle text-secondary" style="font-size: 0.72rem;">
                    {{ loan.paymentMethod || 'ক্যাশ' }}
                  </span>
                </td>
                <td class="small">
                  <span v-if="loan.dueDate" :class="isOverdue(loan) ? 'text-danger fw-bold' : 'text-muted'">
                    {{ formatDate(loan.dueDate) }}
                    <span v-if="isOverdue(loan)" class="badge bg-danger ms-1" style="font-size: 0.65rem;">মেয়াদোত্তীর্ণ</span>
                  </span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td class="text-end fw-bold font-monospace">
                  <span class="currency-symbol">৳</span>{{ formatMoney(loan.amount) }}
                </td>
                <td class="text-end text-success font-monospace small">
                  ৳{{ formatMoney(loan.paidAmount) }}
                </td>
                <td class="text-end fw-bold font-monospace" :class="Number(loan.remainingAmount) > 0 ? 'text-danger' : 'text-muted'">
                  ৳{{ formatMoney(loan.remainingAmount) }}
                </td>
                <td class="text-center">
                  <span
                    class="badge"
                    :class="loan.status === 'paid' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'">
                    {{ loan.status === 'paid' ? 'পরিশোধিত' : 'চলতি' }}
                  </span>
                </td>
                <td class="text-end pe-3">
                  <div class="d-flex justify-content-end gap-1">
                    <button
                      v-if="Number(loan.remainingAmount) > 0"
                      type="button"
                      class="btn btn-sm btn-outline-success px-2 py-0.5 small"
                      title="কিস্তি / পরিশোধ যোগ করুন"
                      @click="openPayModal(loan)">
                      <i class="bi bi-wallet2 me-1"></i>শোধ
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger px-2 py-0.5 small"
                      title="মুছে ফেলুন"
                      @click="deleteLoanItem(loan.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ১. নতুন ঋণ এন্ট্রি মডাল -->
    <div
      v-if="showAddModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow border-0">
          <div class="modal-header py-3 border-bottom">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-plus-circle text-primary me-2"></i>নতুন ঋণ / দেনা রেকর্ড যুক্ত করুন
            </h6>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>
          <form @submit.prevent="submitCreateLoan">
            <div class="modal-body p-3 p-md-4">
              <!-- ঋণের প্রকৃতি নির্বাচন -->
              <div class="mb-3">
                <label class="form-label fw-semibold small mb-1">ঋণের প্রকৃতি <span class="text-danger">*</span></label>
                <div class="row g-2">
                  <div class="col-6">
                    <button
                      type="button"
                      class="btn w-100 py-2 border d-flex align-items-center justify-content-center gap-2"
                      :class="addForm.type === 'payable' ? 'btn-danger text-white fw-bold' : 'btn-outline-secondary'"
                      @click="addForm.type = 'payable'">
                      <i class="bi bi-arrow-down-left-circle"></i>
                      <span>গৃহীত ঋণ (দেনা - নিয়েছি)</span>
                    </button>
                  </div>
                  <div class="col-6">
                    <button
                      type="button"
                      class="btn w-100 py-2 border d-flex align-items-center justify-content-center gap-2"
                      :class="addForm.type === 'receivable' ? 'btn-success text-white fw-bold' : 'btn-outline-secondary'"
                      @click="addForm.type = 'receivable'">
                      <i class="bi bi-arrow-up-right-circle"></i>
                      <span>প্রদত্ত ঋণ (পাওনা - দিয়েছি)</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <!-- ব্যক্তি বা প্রতিষ্ঠানের নাম -->
                <div class="col-12 col-md-6">
                  <Input
                    id="personName"
                    v-model="addForm.personName"
                    label="ব্যক্তি / প্রতিষ্ঠানের নাম"
                    placeholder="যেমন: রহিম সাহেব / এনজিও"
                    must
                    topclass="mb-0" />
                </div>

                <!-- মোবাইল নম্বর -->
                <div class="col-12 col-md-6">
                  <Input
                    id="loanMobile"
                    v-model="addForm.mobile"
                    label="মোবাইল নম্বর"
                    placeholder="01XXXXXXXXX"
                    category="mobile"
                    topclass="mb-0" />
                </div>

                <!-- টাকার পরিমাণ -->
                <div class="col-12 col-md-6">
                  <Input
                    id="loanAmount"
                    v-model="addForm.amount"
                    label="টাকার পরিমাণ (৳)"
                    placeholder="যেমন: 50000"
                    category="decimal"
                    must
                    topclass="mb-0" />
                </div>

                <!-- লেনদেনের মাধ্যম -->
                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold small mb-1">লেনদেনের মাধ্যম <span class="text-danger">*</span></label>
                  <select v-model="addForm.paymentMethod" class="form-select" style="height: 38px;" required>
                    <option value="ক্যাশ">ক্যাশ</option>
                    <option value="ব্যাংক">ব্যাংক ট্রান্সফার / চেক</option>
                    <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                    <option value="নগদ (Nagad)">নগদ (Nagad)</option>
                    <option value="রকেট (Rocket)">রকেট (Rocket)</option>
                  </select>
                </div>

                <!-- ঋণ গ্রহণের তারিখ -->
                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold small mb-1">ঋণ গ্রহণের/প্রদানের তারিখ <span class="text-danger">*</span></label>
                  <input
                    v-model="addForm.loanDate"
                    type="date"
                    class="form-control"
                    style="height: 38px;"
                    required />
                </div>

                <!-- সম্ভাব্য পরিশোধের শেষ তারিখ -->
                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold small mb-1">পরিশোধের মেয়াদ / শেষ তারিখ (ঐচ্ছিক)</label>
                  <input
                    v-model="addForm.dueDate"
                    type="date"
                    class="form-control"
                    style="height: 38px;" />
                </div>

                <!-- ঠিকানা / বিবরণ -->
                <div class="col-12">
                  <Input
                    id="loanAddress"
                    v-model="addForm.address"
                    label="ঠিকানা বা রেফারেন্স বিবরণ"
                    placeholder="ঠিকানা বা জামানত সম্পর্কিত তথ্য থাকলে লিখুন..."
                    topclass="mb-0" />
                </div>

                <!-- নোট -->
                <div class="col-12">
                  <Input
                    id="loanNote"
                    v-model="addForm.note"
                    label="নোট বা মন্তব্য"
                    placeholder="অতিরিক্ত মন্তব্য লিখুন..."
                    topclass="mb-0" />
                </div>
              </div>
            </div>

            <div class="modal-footer py-2 border-top">
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="closeAddModal">বাতিল</button>
              <button type="submit" class="btn btn-sm btn-primary px-3" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ২. কিস্তি বা আংশিক পরিশোধ মডাল -->
    <div
      v-if="showPayModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 500px;">
        <div class="modal-content shadow border-0">
          <div class="modal-header py-3 border-bottom">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-wallet2 text-success me-2"></i>ঋণ পরিশোধ / কিস্তি জমা
            </h6>
            <button type="button" class="btn-close" @click="closePayModal"></button>
          </div>
          <form @submit.prevent="submitRecordPayment">
            <div class="modal-body p-3 p-md-4">
              <!-- ঋণ তথ্য প্রিভিউ -->
              <div class="p-3 theme-box rounded-3 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-muted small">ব্যক্তি/প্রতিষ্ঠান:</span>
                  <span class="fw-bold theme-text">{{ activeLoanForPay?.personName }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-muted small">ধরন:</span>
                  <span :class="activeLoanForPay?.type === 'payable' ? 'text-danger' : 'text-success'" class="small fw-bold">
                    {{ activeLoanForPay?.type === 'payable' ? 'গৃহীত ঋণ (দেনা শোধ)' : 'প্রদত্ত ঋণ (পাওনা আদায়)' }}
                  </span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted small">অবশিষ্ট বকেয়া:</span>
                  <span class="fw-bold fs-6 text-danger font-monospace">৳{{ formatMoney(activeLoanForPay?.remainingAmount) }}</span>
                </div>
              </div>

              <!-- পরিশোধের অংক -->
              <div class="mb-3">
                <Input
                  id="payAmount"
                  v-model="payForm.amount"
                  label="পরিশোধের টাকার পরিমাণ (৳)"
                  :placeholder="'সর্বোচ্চ ৳' + formatMoney(activeLoanForPay?.remainingAmount)"
                  category="decimal"
                  must
                  topclass="mb-0" />
              </div>

              <!-- পরিশোধের তারিখ -->
              <div class="mb-3">
                <label class="form-label fw-semibold small mb-1">পরিশোধের তারিখ <span class="text-danger">*</span></label>
                <input
                  v-model="payForm.paymentDate"
                  type="date"
                  class="form-control"
                  style="height: 38px;"
                  required />
              </div>

              <!-- পরিশোধের মাধ্যম -->
              <div class="mb-3">
                <label class="form-label fw-semibold small mb-1">পরিশোধের মাধ্যম <span class="text-danger">*</span></label>
                <select v-model="payForm.paymentMethod" class="form-select" style="height: 38px;" required>
                  <option value="ক্যাশ">ক্যাশ</option>
                  <option value="ব্যাংক">ব্যাংক ট্রান্সফার</option>
                  <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                  <option value="নগদ (Nagad)">নগদ (Nagad)</option>
                  <option value="রকেট (Rocket)">রকেট (Rocket)</option>
                </select>
              </div>

              <!-- মন্তব্য -->
              <div class="mb-0">
                <Input
                  id="payNote"
                  v-model="payForm.note"
                  label="নোট বা মন্তব্য"
                  placeholder="যেমন: ১ম কিস্তি বা বিশেষ নোট"
                  topclass="mb-0" />
              </div>
            </div>

            <div class="modal-footer py-2 border-top">
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="closePayModal">বাতিল</button>
              <button type="submit" class="btn btn-sm btn-success px-3" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                পরিশোধ নিশ্চিত করুন
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
import Input from "@/components/Input.vue";
import Pagebar from "@/components/Pagebar.vue";
import Toast from "@/components/Toast.vue";
import { toBengaliNumber } from "@/helpers/utils";

useHead({ title: "ঋণ ও দেনা - MFS Ledger" });

const toastRef = ref<any>(null);
const loading = ref(false);
const submitting = ref(false);

const loansList = ref<any[]>([]);
const paymentsList = ref<any[]>([]);
const summary = reactive({
  totalPayable: 0,
  totalPayableDue: 0,
  totalReceivable: 0,
  totalReceivableDue: 0
});

const filterTab = ref("all");

const showAddModal = ref(false);
const showPayModal = ref(false);
const activeLoanForPay = ref<any>(null);

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const addForm = reactive({
  type: "payable",
  personName: "",
  mobile: "",
  address: "",
  amount: "",
  paymentMethod: "ক্যাশ",
  loanDate: getTodayStr(),
  dueDate: "",
  note: ""
});

const payForm = reactive({
  amount: "",
  paymentDate: getTodayStr(),
  paymentMethod: "ক্যাশ",
  note: ""
});

const activeLoansCount = computed(() => {
  return loansList.value.filter(l => l.status === "active").length;
});

const paidLoansCount = computed(() => {
  return loansList.value.filter(l => l.status === "paid").length;
});

const filteredLoans = computed(() => {
  return loansList.value.filter(l => {
    if (filterTab.value === "payable") return l.type === "payable";
    if (filterTab.value === "receivable") return l.type === "receivable";
    if (filterTab.value === "active") return Number(l.remainingAmount) > 0;
    return true;
  });
});

function formatMoney(val: any) {
  const num = Number(val) || 0;
  return toBengaliNumber(num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}

function formatDate(dateStr: any) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });
}

function isOverdue(loan: any) {
  if (!loan.dueDate || loan.status === "paid") return false;
  const due = new Date(loan.dueDate).getTime();
  const now = new Date(getTodayStr()).getTime();
  return due < now && Number(loan.remainingAmount) > 0;
}

async function loadLoansData() {
  loading.value = true;
  try {
    const res: any = await axios.get("/api/loans");
    if (res?.data?.data) {
      loansList.value = res.data.data.loans || [];
      paymentsList.value = res.data.data.payments || [];
      const s = res.data.data.summary || {};
      summary.totalPayable = s.totalPayable || 0;
      summary.totalPayableDue = s.totalPayableDue || 0;
      summary.totalReceivable = s.totalReceivable || 0;
      summary.totalReceivableDue = s.totalReceivableDue || 0;
    }
  } catch (e: any) {
    toastRef.value?.error("ঋণ ডাটা লোড করতে ব্যর্থ হয়েছে");
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  addForm.type = "payable";
  addForm.personName = "";
  addForm.mobile = "";
  addForm.address = "";
  addForm.amount = "";
  addForm.paymentMethod = "ক্যাশ";
  addForm.loanDate = getTodayStr();
  addForm.dueDate = "";
  addForm.note = "";
  showAddModal.value = true;
}

function closeAddModal() {
  showAddModal.value = false;
}

async function submitCreateLoan() {
  submitting.value = true;
  try {
    await axios.post("/api/loans", {
      ...addForm,
      amount: Number(addForm.amount)
    });
    toastRef.value?.success("নতুন ঋণ রেকর্ড সফলভাবে যোগ করা হয়েছে");
    closeAddModal();
    await loadLoansData();
  } catch (e: any) {
    const msg = e?.response?.data?.errors?.[0]?.message || e?.response?.data?.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে";
    toastRef.value?.error(msg);
  } finally {
    submitting.value = false;
  }
}

function openPayModal(loan: any) {
  activeLoanForPay.value = loan;
  payForm.amount = "";
  payForm.paymentDate = getTodayStr();
  payForm.paymentMethod = "ক্যাশ";
  payForm.note = "";
  showPayModal.value = true;
}

function closePayModal() {
  showPayModal.value = false;
  activeLoanForPay.value = null;
}

async function submitRecordPayment() {
  if (!activeLoanForPay.value) return;
  submitting.value = true;
  try {
    await axios.post(`/api/loans/${activeLoanForPay.value.id}/pay`, {
      amount: Number(payForm.amount),
      paymentDate: payForm.paymentDate,
      paymentMethod: payForm.paymentMethod,
      note: payForm.note
    });
    toastRef.value?.success("পরিশোধ রেকর্ড সফলভাবে সংরক্ষণ করা হয়েছে");
    closePayModal();
    await loadLoansData();
  } catch (e: any) {
    const msg = e?.response?.data?.errors?.[0]?.message || e?.response?.data?.message || "পরিশোধ রেকর্ড ব্যর্থ হয়েছে";
    toastRef.value?.error(msg);
  } finally {
    submitting.value = false;
  }
}

async function deleteLoanItem(id: number) {
  if (!confirm("আপনি কি নিশ্চিতভাবে এই ঋণ রেকর্ডটি মুছে ফেলতে চান?")) return;
  try {
    await axios.delete(`/api/loans/${id}`);
    toastRef.value?.success("রেকর্ড মুছে ফেলা হয়েছে");
    await loadLoansData();
  } catch (e: any) {
    toastRef.value?.error("মুছে ফেলতে ব্যর্থ হয়েছে");
  }
}

onMounted(() => {
  loadLoansData();
});
</script>

<style scoped>
.loans-page {
  font-family: inherit;
}

.theme-text {
  color: var(--bs-body-color, #1e293b);
}

.theme-box {
  background-color: var(--bs-tertiary-bg, #f8f9fa);
  border: 1px solid var(--bs-border-color, #e2e8f0);
}

.table-header-row th {
  background-color: var(--bs-tertiary-bg, #f1f5f9) !important;
  color: var(--bs-body-color, #1e293b) !important;
  border-bottom-color: var(--bs-border-color, #e2e8f0) !important;
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
  font-size: 1.25rem;
  background: transparent;
}

.currency-symbol {
  font-size: 0.8em;
  font-weight: 500;
  margin-right: 2px;
  opacity: 0.85;
}

.card-bar-danger {
  border-top-width: 3.5px !important;
  border-top-color: #dc3545 !important;
}

.card-bar-success {
  border-top-width: 3.5px !important;
  border-top-color: #198754 !important;
}

.card-bar-warning {
  border-top-width: 3.5px !important;
  border-top-color: #ffc107 !important;
}

.card-bar-primary {
  border-top-width: 3.5px !important;
  border-top-color: #0d6efd !important;
}

:deep([data-bs-theme="dark"]) .theme-box,
[data-bs-theme="dark"] .theme-box {
  background-color: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep([data-bs-theme="dark"]) .table-header-row th,
[data-bs-theme="dark"] .table-header-row th {
  background-color: rgba(255, 255, 255, 0.06) !important;
  color: #f1f5f9 !important;
  border-bottom-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
