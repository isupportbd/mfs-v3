<template>
  <Pagebar title="প্রোভাইডার ম্যানেজমেন্ট" />
  <Toast ref="toastRef" />

  <div class="providers-page w-100" style="min-width: 0; max-width: 100%; overflow-x: hidden;">
    <!-- ১. নতুন প্রোভাইডার যোগ করার ফর্ম (উপরে) -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom">
        <h6 class="mb-0 fw-bold text-primary d-flex align-items-center">
          <i class="bi bi-wallet-fill me-2 fs-5"></i>নতুন প্রোভাইডার যোগ করুন
        </h6>
      </div>
      <div class="card-body p-3 p-md-4">
        <form @submit.prevent="submitProvider">
          <div class="row g-3 align-items-end">
            <!-- প্রোভাইডারের ধরন (টাইপ শুরু করলে ফিল্টার হবে, বুলেটযুক্ত ও ফিল্ডের সমান বাউন্ডেড) -->
            <div class="col-12 col-sm-6 col-md-4 col-xl-4">
              <SearchSelect
                id="providerName"
                v-model="form.providerName"
                :options="globalProviders"
                label="প্রোভাইডারের ধরন"
                placeholder="টাইপ করে প্রোভাইডার খুঁজুন..."
                :err="errors.providerName"
                must
                @change="onProviderSelectChange" />
            </div>

            <!-- একাউন্টের ধরন (ড্রপডাউন: এজেন্ট, পার্সনাল, কারেন্ট, সেইভিংস) -->
            <div class="col-12 col-sm-6 col-md-3 col-xl-2">
              <label for="accountType" class="d-flex align-items-center mb-1">
                <span>একাউন্টের ধরন</span>
                <span class="text-danger ms-1">*</span>
              </label>
              <select
                id="accountType"
                v-model="form.accountType"
                class="form-select"
                style="height: 38px;">
                <option value="এজেন্ট">এজেন্ট</option>
                <option value="পার্সনাল">পার্সনাল</option>
                <option value="বি2বি">বি2বি</option>
                <option value="কারেন্ট">কারেন্ট</option>
                <option value="সেইভিংস">সেইভিংস</option>
              </select>
            </div>

            <!-- একাউন্ট নং (সংক্ষিপ্ত আকার) -->
            <div class="col-12 col-sm-6 col-md-3 col-xl-2">
              <Input
                id="accountNumber"
                v-model="form.accountNumber"
                type="text"
                label="একাউন্ট নং"
                placeholder="যেমন: 017XXXXXXXX"
                topclass="mb-0"
                :err="errors.accountNumber"
                must />
            </div>

            <!-- বর্তমান ব্যালেন্স -->
            <div class="col-12 col-sm-6 col-md-2 col-xl-2">
              <label for="balance" class="d-flex align-items-center mb-1">
                <span>বর্তমান ব্যালেন্স (৳)</span>
              </label>
              <input
                id="balance"
                v-model.number="form.balance"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                style="height: 38px;"
                placeholder="0.00" />
            </div>

            <!-- বাটনসমূহ (পরিমিত ও মার্জিত সাইজ, অতিরিক্ত বড় নয়) -->
            <div class="col-12 col-sm-6 col-md-4 col-xl-2 d-flex align-items-end gap-2">
              <button
                type="submit"
                class="btn btn-primary px-3 d-inline-flex align-items-center justify-content-center text-nowrap"
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
                <i class="bi bi-arrow-counterclockwise me-1"></i>রিসেট
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ২. প্রোভাইডার তালিকা টেবিল (নিচে) -->
    <div class="card border shadow-sm w-100">
      <!-- টেবিল হেডার: স্ক্র্যাচ অনুযায়ী প্রোভাইডারের তালিকা এবং নিচে ফিল্টার ও সার্চ -->
      <div class="card-header bg-transparent pt-2.5 pb-2 px-3 border-bottom">
        <!-- প্রথম রো: টাইটেল -->
        <h6 class="mb-2 fw-bold d-flex align-items-center">
          <i class="bi bi-wallet2 text-primary me-2 fs-5"></i>প্রোভাইডারের তালিকা
        </h6>

        <!-- দ্বিতীয় রো: ফিল্টার বাটন ও সার্চ বক্স -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <!-- একাউন্টের ধরন ফিল্টার বাটন: সকল, এজেন্ট, পার্সনাল, কারেন্ট, সেইভিংস -->
          <div class="btn-group btn-group-sm filter-btn-group flex-wrap" role="group">
            <button
              type="button"
              class="btn"
              :class="{ 'active-filter active-filter-all': filterType === 'all' }"
              @click="setFilter('all')">
              সকল ({{ providersList.length }})
            </button>
            <button
              type="button"
              class="btn"
              :class="{ 'active-filter active-filter-agent': filterType === 'এজেন্ট' }"
              @click="setFilter('এজেন্ট')">
              এজেন্ট ({{ countAgent }})
            </button>
            <button
              type="button"
              class="btn"
              :class="{ 'active-filter active-filter-personal': filterType === 'পার্সনাল' }"
              @click="setFilter('পার্সনাল')">
              পার্সনাল ({{ countPersonal }})
            </button>
            <button
              type="button"
              class="btn"
              :class="{ 'active-filter active-filter-current': filterType === 'কারেন্ট' }"
              @click="setFilter('কারেন্ট')">
              কারেন্ট ({{ countCurrent }})
            </button>
            <button
              type="button"
              class="btn"
              :class="{ 'active-filter active-filter-savings': filterType === 'সেইভিংস' }"
              @click="setFilter('সেইভিংস')">
              সেইভিংস ({{ countSavings }})
            </button>
          </div>

          <!-- সার্চ বক্স -->
          <div style="min-width: 240px; max-width: 320px;" class="flex-grow-1 flex-md-grow-0">
            <SearchInput
              v-model="searchQuery"
              placeholder="সার্চ..." />
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- লোডিং স্পিনার -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <p class="text-muted small mt-2">প্রোভাইডার তালিকা লোড হচ্ছে...</p>
        </div>

        <!-- প্রোভাইডার না থাকলে এম্পটি স্টেট -->
        <div v-else-if="filteredProviders.length === 0" class="text-center py-5 px-3">
          <div class="avatar-lg mx-auto mb-3 text-muted" style="font-size: 3rem;">
            <i class="bi bi-wallet2"></i>
          </div>
          <h6 class="fw-bold text-body">কোনো প্রোভাইডার পাওয়া যায়নি</h6>
          <p class="text-muted small mb-3">
            {{ searchQuery ? 'আপনার সার্চের সাথে মিলে এমন কোনো প্রোভাইডার নেই।' : 'এখনো কোনো প্রোভাইডার যোগ করা হয়নি। উপরের ফরম থেকে প্রথম প্রোভাইডার যোগ করুন।' }}
          </p>
          <button v-if="searchQuery" class="btn btn-sm btn-outline-primary" @click="searchQuery = ''">
            সার্চ ফিল্টার ক্লিয়ার করুন
          </button>
        </div>

        <!-- ডাটা টেবিল -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th style="width: 55px;" class="text-center">#</th>
                <th style="width: 25%;">প্রোভাইডারের নাম</th>
                <th style="width: 17%;">একাউন্টের ধরন</th>
                <th style="width: 18%;">একাউন্ট নং</th>
                <th style="width: 16%;">বর্তমান ব্যালেন্স</th>
                <th style="width: 16%;">যোগ করার তারিখ</th>
                <th style="width: 90px;" class="text-end pe-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(provider, index) in pagedProviders" :key="provider.id">
                <td class="text-center text-body fw-semibold small">
                  {{ (currentPage - 1) * perPage + index + 1 }}
                </td>

                <!-- প্রোভাইডারের নাম ও লোগো ব্যাজ -->
                <td>
                  <div class="d-flex align-items-center">
                    <div
                      class="avatar-xs rounded-circle d-flex align-items-center justify-content-center me-2 text-white fw-bold small"
                      :class="getProviderBadgeClass(provider.providerName)"
                      style="width: 34px; height: 34px; font-size: 0.85rem; flex-shrink: 0;">
                      {{ provider.providerName.charAt(0) }}
                    </div>
                    <div>
                      <div class="fw-bold text-body text-truncate" style="max-width: 200px;">
                        {{ provider.providerName }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- একাউন্টের ধরন (রেগুলার টেক্সট, বাটন স্টাইল ছাড়া) -->
                <td>
                  <span class="fw-medium text-body">
                    {{ provider.accountType }}
                  </span>
                </td>

                <!-- একাউন্ট নং -->
                <td>
                  <span class="font-monospace fw-semibold text-body">
                    <i class="bi bi-hash opacity-75 me-1 small"></i>{{ provider.accountNumber }}
                  </span>
                </td>

                <!-- বর্তমান ব্যালেন্স -->
                <td>
                  <span class="fw-bold text-success font-monospace">
                    ৳ {{ formatMoney(provider.balance) }}
                  </span>
                </td>

                <!-- যোগ করার তারিখ -->
                <td class="text-body fw-medium small">
                  {{ formatDate(provider.createdAt) }}
                </td>

                <!-- অ্যাকশন বাটন -->
                <td class="text-end pe-3">
                  <div class="d-inline-flex align-items-center gap-1 justify-content-end">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary btn-action"
                      title="তথ্য এডিট করুন"
                      @click="openEditModal(provider)">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger btn-action"
                      title="প্রোভাইডার মুছে ফেলুন"
                      @click="confirmDelete(provider)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- পেজিনেশন ফুটার -->
      <div v-if="filteredProviders.length > perPage" class="card-footer bg-transparent py-2 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span class="text-muted small">
          দেখাচ্ছে {{ (currentPage - 1) * perPage + 1 }} থেকে {{ Math.min(currentPage * perPage, filteredProviders.length) }} (মোট {{ filteredProviders.length }} টি)
        </span>
        <Pagination :data="paginationData" />
      </div>
    </div>

    <!-- ৩. এডিট প্রোভাইডার মডাল (Edit Modal) -->
    <div
      v-if="editingProvider"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow">
          <div class="modal-header py-3">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-pencil-square text-primary me-2"></i>প্রোভাইডার তথ্য আপডেট করুন
            </h6>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <form @submit.prevent="updateProvider">
            <div class="modal-body p-3 p-md-4">
              <!-- প্রোভাইডারের ধরন (সার্চ সিলেক্ট) -->
              <div class="mb-3">
                <SearchSelect
                  id="editProviderName"
                  v-model="editForm.providerName"
                  :options="globalProviders"
                  label="প্রোভাইডারের ধরন"
                  placeholder="টাইপ করে প্রোভাইডার খুঁজুন..."
                  must
                  @change="onEditProviderSelectChange" />
              </div>

              <!-- একাউন্টের ধরন -->
              <div class="mb-3">
                <label for="editAccountType" class="form-label fw-semibold mb-1">
                  একাউন্টের ধরন <span class="text-danger">*</span>
                </label>
                <select id="editAccountType" v-model="editForm.accountType" class="form-select" style="height: 38px;">
                  <option value="এজেন্ট">এজেন্ট</option>
                  <option value="পার্সনাল">পার্সনাল</option>
                  <option value="বি2বি">বি2বি</option>
                  <option value="কারেন্ট">কারেন্ট</option>
                  <option value="সেইভিংস">সেইভিংস</option>
                </select>
              </div>

              <!-- একাউন্ট নং -->
              <div class="mb-3">
                <label class="form-label fw-semibold">একাউন্ট নং <span class="text-danger">*</span></label>
                <input
                  v-model="editForm.accountNumber"
                  type="text"
                  class="form-control"
                  required />
              </div>

              <!-- বর্তমান ব্যালেন্স -->
              <div class="mb-3">
                <label class="form-label fw-semibold">বর্তমান ব্যালেন্স (৳)</label>
                <input
                  v-model.number="editForm.balance"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control" />
              </div>

              <!-- নোট -->
              <div class="mb-2">
                <label class="form-label fw-semibold">নোট (ঐচ্ছিক)</label>
                <textarea
                  v-model="editForm.note"
                  rows="2"
                  class="form-control"
                  placeholder="অতিরিক্ত তথ্য বা শাখা নাম..."></textarea>
              </div>
            </div>

            <div class="modal-footer py-2">
              <button type="button" class="btn btn-secondary" @click="closeEditModal">
                বাতিল
              </button>
              <button type="submit" class="btn btn-primary" :disabled="editSubmitting">
                <span v-if="editSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                আপডেট সংরক্ষণ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ৪. মুছে ফেলার কনফার্মেশন মডাল (Delete Confirmation) -->
    <div
      v-if="deletingProvider"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-danger">
          <div class="modal-header py-3 bg-danger-subtle text-danger">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>প্রোভাইডার ডিলিট নিশ্চিতকরণ
            </h6>
            <button type="button" class="btn-close" @click="deletingProvider = null"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <div class="avatar-lg mx-auto mb-3 text-danger" style="font-size: 2.5rem;">
              <i class="bi bi-trash"></i>
            </div>
            <h6 class="fw-bold mb-2">আপনি কি নিশ্চিত এই প্রোভাইডার মুছে ফেলতে চান?</h6>
            <p class="text-muted small mb-0">
              প্রোভাইডার: <strong>{{ deletingProvider.providerName }}</strong> ({{ deletingProvider.accountType }})<br>
              একাউন্ট নং: <strong>{{ deletingProvider.accountNumber }}</strong><br>
              ব্যালেন্স: <strong>৳ {{ formatMoney(deletingProvider.balance) }}</strong>
            </p>
          </div>
          <div class="modal-footer py-2">
            <button type="button" class="btn btn-secondary" @click="deletingProvider = null">
              বাতিল
            </button>
            <button
              type="button"
              class="btn btn-danger"
              :disabled="deleteSubmitting"
              @click="deleteProvider">
              <span v-if="deleteSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              হ্যাঁ, মুছে ফেলুন
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Pagination from "@/components/datatable/Pagination.vue";
import Input from "@/components/Input.vue";
import Pagebar from "@/components/Pagebar.vue";
import SearchInput from "@/components/SearchInput.vue";
import SearchSelect from "@/components/SearchSelect.vue";
import Toast from "@/components/Toast.vue";
import { pulse } from "@/plugins/pulse";

useHead({ title: "প্রোভাইডার ম্যানেজমেন্ট - MFS Ledger" });

interface GlobalProvider {
  id: number;
  type: string;
  name: string;
  isActive: boolean;
}

interface MerchantProviderItem {
  id: number;
  userId: number;
  providerId?: number | null;
  providerName: string;
  accountType: string;
  accountNumber: string;
  balance: string | number;
  note?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const route = useRoute();
const router = useRouter();
const toastRef = ref<any>(null);

// স্টেটসমূহ
const loading = ref(false);
const submitting = ref(false);
const editSubmitting = ref(false);
const deleteSubmitting = ref(false);
const providersList = ref<MerchantProviderItem[]>([]);
const globalProviders = ref<GlobalProvider[]>([]);
const searchQuery = ref("");
const filterType = ref<string>("all");
const perPage = ref(10);

// নতুন প্রোভাইডার ফর্ম
const form = reactive({
  providerId: null as number | null,
  providerName: "",
  accountType: "এজেন্ট",
  accountNumber: "",
  balance: 0,
  note: ""
});

const errors = reactive({
  providerName: "",
  accountNumber: ""
});

// এডিট ও ডিলিট
const editingProvider = ref<MerchantProviderItem | null>(null);
const editForm = reactive({
  providerId: null as number | null,
  providerName: "",
  accountType: "এজেন্ট",
  accountNumber: "",
  balance: 0,
  note: ""
});
const deletingProvider = ref<MerchantProviderItem | null>(null);

// কাউন্টারসমূহ
const countAgent = computed(() => providersList.value.filter(p => p.accountType === "এজেন্ট").length);
const countPersonal = computed(() => providersList.value.filter(p => p.accountType === "পার্সনাল").length);
const countCurrent = computed(() => providersList.value.filter(p => p.accountType === "কারেন্ট").length);
const countSavings = computed(() => providersList.value.filter(p => p.accountType === "সেইভিংস").length);

// ফিল্টারকৃত প্রোভাইডার তালিকা
const filteredProviders = computed(() => {
  return providersList.value.filter((provider) => {
    // ধরন ফিল্টার
    if (filterType.value !== "all" && provider.accountType !== filterType.value) {
      return false;
    }
    // সার্চ ফিল্টার
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchName = provider.providerName.toLowerCase().includes(q);
      const matchType = provider.accountType.toLowerCase().includes(q);
      const matchNumber = provider.accountNumber.toLowerCase().includes(q);
      if (!matchName && !matchType && !matchNumber) {
        return false;
      }
    }
    return true;
  });
});

// পেজিনেশন
const currentPage = computed(() => {
  const p = Number(route.query.page);
  return isNaN(p) || p < 1 ? 1 : p;
});

const pagedProviders = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredProviders.value.slice(start, start + perPage.value);
});

const paginationData = computed(() => ({
  current_page: currentPage.value,
  last_page: Math.max(1, Math.ceil(filteredProviders.value.length / perPage.value)),
  per_page: perPage.value,
  total: filteredProviders.value.length,
  path: route.path
}));

// ফিল্টার সেট করা
function setFilter(type: string) {
  filterType.value = type;
  if (currentPage.value !== 1) {
    router.push({ query: { ...route.query, page: 1 } });
  }
}

// গ্লোবাল সেটিংস থেকে আর্থিক প্রোভাইডার লোড করা
async function loadGlobalProviders() {
  try {
    const res: any = await axios.get("/api/settings/providers");
    if (res?.data?.data && Array.isArray(res.data.data)) {
      globalProviders.value = res.data.data;
    }
  } catch (e) {
    console.error("Failed to load global settings providers:", e);
  }
}

function onProviderSelectChange(val: any, opt?: any) {
  if (opt && opt.id) {
    form.providerId = opt.id;
  } else {
    const found = globalProviders.value.find(p => p.name === form.providerName);
    form.providerId = found ? found.id : null;
  }
}

function onEditProviderSelectChange(val: any, opt?: any) {
  if (opt && opt.id) {
    editForm.providerId = opt.id;
  } else {
    const found = globalProviders.value.find(p => p.name === editForm.providerName);
    editForm.providerId = found ? found.id : null;
  }
}

// প্রোভাইডার তালিকা ফেচ করা
async function fetchProviders() {
  loading.value = true;
  try {
    const res: any = await axios.get("/api/providers");
    if (res?.data?.data) {
      providersList.value = res.data.data;
    }
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "প্রোভাইডার তালিকা লোড করতে সমস্যা হয়েছে");
  } finally {
    loading.value = false;
  }
}

// ফর্ম রিসেট
function resetForm() {
  form.providerId = null;
  form.providerName = "";
  form.accountType = "এজেন্ট";
  form.accountNumber = "";
  form.balance = "" as any;
  form.note = "";
  errors.providerName = "";
  errors.accountNumber = "";
}

// নতুন প্রোভাইডার সাবমিট
async function submitProvider() {
  errors.providerName = "";
  errors.accountNumber = "";

  if (!form.providerName.trim()) {
    errors.providerName = "প্রোভাইডারের নাম নির্বাচন করুন";
    return;
  }
  if (!form.accountNumber.trim()) {
    errors.accountNumber = "একাউন্ট নম্বর আবশ্যক";
    return;
  }

  // একই প্রোভাইডারে একই একাউন্ট নম্বর একাধিকবার এন্ট্রি রোধ
  const isDuplicate = providersList.value.some(p =>
    p.providerName.trim().toLowerCase() === form.providerName.trim().toLowerCase() &&
    p.accountNumber.trim() === form.accountNumber.trim()
  );

  if (isDuplicate) {
    errors.accountNumber = "এই প্রোভাইডারে এই একাউন্ট নম্বরটি ইতিমধ্যে যুক্ত আছে";
    toastRef.value?.error("এই প্রোভাইডারে এই একাউন্ট নম্বরটি ইতিমধ্যে যুক্ত আছে");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      providerId: form.providerId,
      providerName: form.providerName.trim(),
      accountType: form.accountType,
      accountNumber: form.accountNumber.trim(),
      balance: Number(form.balance) || 0,
      note: form.note || null
    };

    const res: any = await axios.post("/api/providers", payload);
    const msg = res?.data?.queued
      ? "প্রোভাইডার সংরক্ষণের জন্য কিউতে পাঠানো হয়েছে!"
      : "প্রোভাইডার সফলভাবে সংরক্ষণ করা হয়েছে!";
    toastRef.value?.success(msg);

    // অপটিমিস্টিক পুশ যদি সাথে সাথে ডাটাবেজ রিটার্ন করে
    if (res?.data?.data && !res.data.queued) {
      upsertProviderInList(res.data.data);
    }

    resetForm();
  } catch (e: any) {
    const errorMsg = e?.response?.data?.message || "প্রোভাইডার সংরক্ষণ করতে সমস্যা হয়েছে";
    toastRef.value?.error(errorMsg);
    if (e?.response?.status === 409 || errorMsg.includes("ইতিমধ্যে যুক্ত আছে")) {
      errors.accountNumber = errorMsg;
    }
  } finally {
    submitting.value = false;
  }
}

// এডিট মডাল ওপেন
function openEditModal(provider: MerchantProviderItem) {
  editingProvider.value = provider;
  editForm.providerId = provider.providerId || null;
  editForm.providerName = provider.providerName;
  editForm.accountType = provider.accountType;
  editForm.accountNumber = provider.accountNumber;
  editForm.balance = Number(provider.balance) || 0;
  editForm.note = provider.note || "";
}

function closeEditModal() {
  editingProvider.value = null;
}

// প্রোভাইডার আপডেট
async function updateProvider() {
  if (!editingProvider.value) return;

  if (!editForm.providerName.trim() || !editForm.accountNumber.trim()) {
    toastRef.value?.error("প্রোভাইডারের নাম এবং একাউন্ট নম্বর আবশ্যক");
    return;
  }

  // অন্য কোনো রেকর্ডে একই প্রোভাইডারে একই একাউন্ট আছে কি না চেক
  const isDuplicate = providersList.value.some(p =>
    p.id !== editingProvider.value?.id &&
    p.providerName.trim().toLowerCase() === editForm.providerName.trim().toLowerCase() &&
    p.accountNumber.trim() === editForm.accountNumber.trim()
  );

  if (isDuplicate) {
    toastRef.value?.error("এই প্রোভাইডারে এই একাউন্ট নম্বরটি ইতিমধ্যে যুক্ত আছে");
    return;
  }

  editSubmitting.value = true;
  try {
    const payload = {
      providerId: editForm.providerId,
      providerName: editForm.providerName.trim(),
      accountType: editForm.accountType,
      accountNumber: editForm.accountNumber.trim(),
      balance: editForm.balance,
      note: editForm.note || null
    };

    const res: any = await axios.put(`/api/providers/${editingProvider.value.id}`, payload);
    toastRef.value?.success("প্রোভাইডার তথ্য সফলভাবে আপডেট হয়েছে");

    if (res?.data?.data) {
      upsertProviderInList(res.data.data);
    }
    closeEditModal();
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "প্রোভাইডার আপডেট করতে ব্যর্থ হয়েছে");
  } finally {
    editSubmitting.value = false;
  }
}

// মুছে ফেলা কনফার্মেশন
function confirmDelete(provider: MerchantProviderItem) {
  deletingProvider.value = provider;
}

async function deleteProvider() {
  if (!deletingProvider.value) return;

  deleteSubmitting.value = true;
  try {
    await axios.delete(`/api/providers/${deletingProvider.value.id}`);
    toastRef.value?.success("প্রোভাইডার সফলভাবে মুছে ফেলা হয়েছে");
    removeProviderFromList(deletingProvider.value.id);
    deletingProvider.value = null;
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "প্রোভাইডার মুছে ফেলতে ব্যর্থ হয়েছে");
  } finally {
    deleteSubmitting.value = false;
  }
}

// রিয়েলটাইম হেল্পার
function upsertProviderInList(item: MerchantProviderItem) {
  const idx = providersList.value.findIndex(p => p.id === item.id);
  if (idx !== -1) {
    providersList.value[idx] = { ...providersList.value[idx], ...item };
  } else {
    providersList.value.unshift(item);
  }
}

function removeProviderFromList(id: number) {
  providersList.value = providersList.value.filter(p => p.id !== id);
}

// রিয়েলটাইম লিসেনার
let unsubChannel: any = null;
function setupRealtimeListeners() {
  try {
    const channel = pulse.channel("providers");
    channel.listen("provider.created", (e: any) => {
      const item = e?.data || e;
      if (item && item.id) {
        upsertProviderInList(item);
      }
    });
    channel.listen("provider.updated", (e: any) => {
      const item = e?.data || e;
      if (item && item.id) {
        upsertProviderInList(item);
      }
    });
    channel.listen("provider.deleted", (e: any) => {
      const id = e?.data?.id || e?.id;
      if (id) {
        removeProviderFromList(Number(id));
      }
    });
    unsubChannel = channel;
  } catch (err) {
    console.error("Pulse setup failed:", err);
  }
}

// ইউটিলিটি
function formatDate(val: any) {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return String(val);
  }
}

function formatMoney(val: any) {
  const num = Number(val) || 0;
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getProviderBadgeClass(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("বিকাশ") || lower.includes("bkash")) return "bg-danger";
  if (lower.includes("নগদ") || lower.includes("nagad")) return "bg-warning text-dark";
  if (lower.includes("রকেট") || lower.includes("rocket")) return "bg-primary";
  if (lower.includes("উপায়") || lower.includes("upay")) return "bg-info";
  if (lower.includes("ব্যাংক") || lower.includes("bank")) return "bg-success";
  return "bg-secondary";
}

function getAccountTypeBadgeClass(type: string) {
  switch (type) {
    case "এজেন্ট":
      return "badge-type-agent";
    case "পার্সনাল":
      return "badge-type-personal";
    case "কারেন্ট":
      return "badge-type-current";
    case "সেইভিংস":
      return "badge-type-savings";
    default:
      return "badge-type-general";
  }
}

onMounted(async () => {
  await Promise.all([loadGlobalProviders(), fetchProviders()]);
  setupRealtimeListeners();
});

onUnmounted(() => {
  if (unsubChannel && typeof unsubChannel.unsubscribe === "function") {
    unsubChannel.unsubscribe();
  }
});
</script>

<style scoped>
.providers-page {
  font-family: inherit;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}


/* ফিল্টার বাটনসমূহ (লাইট ও ডার্ক উভয় মোডেই স্বয়ংক্রিয়ভাবে ১০০% স্পষ্ট ও পাঠযোগ্য) */
.filter-btn-group .btn {
  font-size: 0.825rem;
  font-weight: 500;
  padding: 0.35rem 0.85rem;
  background-color: transparent !important;
  color: var(--bs-body-color) !important;
  border: 1px solid var(--bs-border-color) !important;
  transition: all 0.15s ease-in-out;
}

.filter-btn-group .btn:not(.active-filter):hover {
  background-color: var(--app-hover, rgba(125, 125, 125, 0.12)) !important;
  color: var(--bs-body-color) !important;
}

.filter-btn-group .btn.active-filter-all {
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
  color: #ffffff !important;
}

.filter-btn-group .btn.active-filter-agent {
  background-color: #0891b2 !important;
  border-color: #0891b2 !important;
  color: #ffffff !important;
}

.filter-btn-group .btn.active-filter-personal {
  background-color: #475569 !important;
  border-color: #475569 !important;
  color: #ffffff !important;
}

.filter-btn-group .btn.active-filter-current {
  background-color: #7c3aed !important;
  border-color: #7c3aed !important;
  color: #ffffff !important;
}

.filter-btn-group .btn.active-filter-savings {
  background-color: #16a34a !important;
  border-color: #16a34a !important;
  color: #ffffff !important;
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
