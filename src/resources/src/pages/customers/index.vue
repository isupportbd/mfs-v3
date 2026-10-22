<template>
  <Pagebar title="কাস্টমার ম্যানেজমেন্ট" />
  <Toast ref="toastRef" />

  <div class="customers-page w-100" style="min-width: 0; max-width: 100%; overflow-x: hidden;">
    <!-- ১. নতুন কাস্টমার যোগ করার ফর্ম (উপরে) -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 class="mb-0 fw-bold text-primary d-flex align-items-center">
          <i class="bi bi-person-plus-fill me-2 fs-5"></i>নতুন কাস্টমার যোগ করুন
        </h6>
        <span class="badge customer-count-badge px-2.5 py-1">
          কাস্টমার এন্ট্রি ফর্ম
        </span>
      </div>
      <div class="card-body p-3 p-md-4">
        <form @submit.prevent="submitCustomer">
          <div class="row g-3 align-items-end">
            <!-- কাস্টমারের নাম -->
            <div class="col-12 col-sm-6 col-md-4 col-xl-2">
              <Input
                id="custName"
                v-model="form.name"
                type="text"
                label="কাস্টমারের নাম"
                placeholder="যেমন: মোঃ রহিম উদ্দিন"
                topclass="mb-0"
                :err="errors.name"
                must />
            </div>

            <!-- মোবাইল নম্বর -->
            <div class="col-12 col-sm-6 col-md-4 col-xl-2">
              <Input
                id="custMobile"
                v-model="form.mobile"
                type="text"
                category="mobile"
                label="মোবাইল নম্বর"
                placeholder="যেমন: 017XXXXXXXX"
                topclass="mb-0"
                :err="errors.mobile"
                must />
            </div>

            <!-- কাস্টমারের ধরন (ড্রপডাউন) -->
            <div class="col-12 col-sm-6 col-md-4 col-xl-2">
              <label for="custType" class="d-flex align-items-center mb-1">
                <span>কাস্টমারের ধরন</span>
                <span class="text-danger ms-1">*</span>
              </label>
              <select
                id="custType"
                v-model="form.type"
                class="form-select"
                style="height: 38px;">
                <option value="সাধারণ">সাধারণ</option>
                <option value="নিয়মিত">নিয়মিত</option>
              </select>
            </div>

            <!-- প্রতিষ্ঠানের নাম (ঐচ্ছিক) -->
            <div class="col-12 col-sm-6 col-md-4 col-xl-2">
              <Input
                id="custOrg"
                v-model="form.organizationName"
                type="text"
                label="প্রতিষ্ঠানের নাম (ঐচ্ছিক)"
                placeholder="যেমন: ভাই ভাই টেলিকম"
                topclass="mb-0" />
            </div>

            <!-- ঠিকানা (বাধ্যতামূলক) -->
            <div class="col-12 col-sm-6 col-md-4 col-xl-2">
              <Input
                id="custAddress"
                v-model="form.address"
                type="text"
                label="ঠিকানা"
                placeholder="যেমন: চকবাজার, ঢাকা"
                topclass="mb-0"
                :err="errors.address"
                must />
            </div>

            <!-- বাটনসমূহ (একই রো তে) -->
            <div class="col-12 col-sm-6 col-md-4 col-xl-2 d-flex align-items-end gap-2">
              <button
                type="submit"
                class="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center text-nowrap"
                style="height: 38px;"
                :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="bi bi-check-circle-fill me-1"></i>সংরক্ষণ
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary d-flex align-items-center justify-content-center text-nowrap"
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

    <!-- ২. কাস্টমার তালিকা টেবিল (নিচে) -->
    <div class="card border shadow-sm w-100">
      <!-- টেবিল হেডার: স্ক্র্যাচ অনুযায়ী কাস্টমারের তালিকা এবং নিচে ফিল্টার ও সার্চ -->
      <div class="card-header bg-transparent pt-2.5 pb-2 px-3 border-bottom">
        <!-- প্রথম রো: টাইটেল -->
        <h6 class="mb-2 fw-bold d-flex align-items-center">
          <i class="bi bi-people-fill text-primary me-2 fs-5"></i>কাস্টমারের তালিকা
        </h6>

        <!-- দ্বিতীয় রো: ফিল্টার বাটন ও সার্চ বক্স -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <!-- টাইপ ফিল্টার বাটন (স্ক্র্যাচ অনুযায়ী: সকল, সাধারণ, নিয়মিত) -->
          <div class="btn-group btn-group-sm filter-btn-group" role="group">
            <button
              type="button"
              class="btn"
              :class="{ 'active-filter active-filter-all': filterType === 'all' }"
              @click="setFilter('all')">
              সকল ({{ customersList.length }})
            </button>
            <button
              type="button"
              class="btn"
              :class="{ 'active-filter active-filter-general': filterType === 'সাধারণ' }"
              @click="setFilter('সাধারণ')">
              সাধারণ ({{ countGeneral }})
            </button>
            <button
              type="button"
              class="btn"
              :class="{ 'active-filter active-filter-regular': filterType === 'নিয়মিত' }"
              @click="setFilter('নিয়মিত')">
              নিয়মিত ({{ countRegular }})
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
          <p class="text-muted small mt-2">কাস্টমার তালিকা লোড হচ্ছে...</p>
        </div>

        <!-- কাস্টমার না থাকলে এম্পটি স্টেট -->
        <div v-else-if="filteredCustomers.length === 0" class="text-center py-5 px-3">
          <div class="avatar-lg mx-auto mb-3 text-muted" style="font-size: 3rem;">
            <i class="bi bi-people"></i>
          </div>
          <h6 class="fw-bold text-body">কোনো কাস্টমার পাওয়া যায়নি</h6>
          <p class="text-muted small mb-3">
            {{ searchQuery ? 'আপনার সার্চের সাথে মিলে এমন কোনো কাস্টমার নেই।' : 'এখনো কোনো কাস্টমার যোগ করা হয়নি। উপরের ফরম থেকে প্রথম কাস্টমার যোগ করুন।' }}
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
                <th style="width: 50px;" class="text-center">#</th>
                <th>কাস্টমারের নাম</th>
                <th>ধরন</th>
                <th>প্রতিষ্ঠানের নাম</th>
                <th>মোবাইল নম্বর</th>
                <th>ঠিকানা</th>
                <th>যোগ করার তারিখ</th>
                <th class="text-end" style="width: 120px;">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(customer, index) in pagedCustomers" :key="customer.id">
                <td class="text-center text-body fw-semibold small">
                  {{ (currentPage - 1) * perPage + index + 1 }}
                </td>

                <!-- কাস্টমারের নাম -->
                <td>
                  <div class="d-flex align-items-center">
                    <div
                      class="avatar-xs rounded-circle d-flex align-items-center justify-content-center me-2 text-white fw-bold small"
                      :class="customer.type === 'নিয়মিত' ? 'bg-success' : 'bg-primary'"
                      style="width: 34px; height: 34px; font-size: 0.85rem; flex-shrink: 0;">
                      {{ customer.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="fw-bold text-body text-truncate" style="max-width: 180px;">
                        {{ customer.name }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- ধরন (রেগুলার টেক্সট, বাটন স্টাইল ছাড়া) -->
                <td>
                  <span class="fw-medium text-body">
                    {{ customer.type }}
                  </span>
                </td>

                <!-- প্রতিষ্ঠানের নাম -->
                <td>
                  <span v-if="customer.organizationName" class="fw-medium text-body">
                    {{ customer.organizationName }}
                  </span>
                  <span v-else class="text-body-secondary">—</span>
                </td>

                <!-- মোবাইল নম্বর -->
                <td>
                  <a
                    :href="'tel:' + customer.mobile"
                    class="text-decoration-none fw-semibold text-primary d-inline-flex align-items-center">
                    <i class="bi bi-telephone-outbound me-1 opacity-75 small"></i>{{ customer.mobile }}
                  </a>
                </td>

                <!-- ঠিকানা -->
                <td>
                  <span v-if="customer.address" class="text-truncate d-inline-block text-body" style="max-width: 180px;" :title="customer.address">
                    <i class="bi bi-geo-alt opacity-75 me-1"></i>{{ customer.address }}
                  </span>
                  <span v-else class="text-body-secondary">—</span>
                </td>

                <!-- যোগ করার তারিখ -->
                <td class="text-body fw-medium small">
                  {{ formatDate(customer.createdAt) }}
                </td>

                <!-- অ্যাকশন বাটন -->
                <td class="text-end">
                  <div class="d-inline-flex align-items-center gap-1 justify-content-end">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary btn-action"
                      title="তথ্য এডিট করুন"
                      @click="openEditModal(customer)">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger btn-action"
                      title="কাস্টমার মুছে ফেলুন"
                      @click="confirmDelete(customer)">
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
      <div v-if="filteredCustomers.length > perPage" class="card-footer bg-transparent py-2 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span class="text-muted small">
          দেখাচ্ছে {{ (currentPage - 1) * perPage + 1 }} থেকে {{ Math.min(currentPage * perPage, filteredCustomers.length) }} (মোট {{ filteredCustomers.length }} জন)
        </span>
        <Pagination :data="paginationData" />
      </div>
    </div>

    <!-- ৩. এডিট কাস্টমার মডাল (Edit Modal) -->
    <div
      v-if="editingCustomer"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow">
          <div class="modal-header py-3">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-pencil-square text-primary me-2"></i>কাস্টমার তথ্য আপডেট করুন
            </h6>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <form @submit.prevent="updateCustomer">
            <div class="modal-body p-3 p-md-4">
              <!-- ধরন (ড্রপডাউন) -->
              <div class="mb-3">
                <label for="editType" class="form-label fw-semibold mb-1">
                  কাস্টমারের ধরন <span class="text-danger">*</span>
                </label>
                <select id="editType" v-model="editForm.type" class="form-select" style="height: 38px;">
                  <option value="সাধারণ">সাধারণ</option>
                  <option value="নিয়মিত">নিয়মিত</option>
                </select>
              </div>

              <!-- নাম -->
              <div class="mb-3">
                <label class="form-label fw-semibold">কাস্টমারের নাম <span class="text-danger">*</span></label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="form-control"
                  required />
              </div>

              <!-- মোবাইল -->
              <div class="mb-3">
                <label class="form-label fw-semibold">মোবাইল নম্বর <span class="text-danger">*</span></label>
                <input
                  v-model="editForm.mobile"
                  type="tel"
                  class="form-control"
                  required />
              </div>

              <!-- প্রতিষ্ঠানের নাম (ঐচ্ছিক) -->
              <div class="mb-3">
                <label class="form-label fw-semibold">প্রতিষ্ঠানের নাম (ঐচ্ছিক)</label>
                <input
                  v-model="editForm.organizationName"
                  type="text"
                  class="form-control"
                  placeholder="যেমন: ভাই ভাই টেলিকম" />
              </div>

              <!-- ঠিকানা (বাধ্যতামূলক) -->
              <div class="mb-3">
                <label class="form-label fw-semibold">ঠিকানা <span class="text-danger">*</span></label>
                <input
                  v-model="editForm.address"
                  type="text"
                  class="form-control"
                  placeholder="ঠিকানা লিখুন"
                  required />
              </div>

            </div>

            <div class="modal-footer py-2">
              <button type="button" class="btn btn-secondary" :disabled="editSubmitting" @click="closeEditModal">
                বাতিল
              </button>
              <button type="submit" class="btn btn-primary" :disabled="editSubmitting">
                <span v-if="editSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="bi bi-check-lg me-1"></i>সংরক্ষণ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ৪. ডিলিট কনফার্মেশন মডাল -->
    <div
      v-if="deletingCustomer"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content text-center p-3 shadow">
          <div class="text-danger mb-2" style="font-size: 2.5rem;">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <h6 class="fw-bold mb-1">কাস্টমার মুছে ফেলতে চান?</h6>
          <p class="text-muted small mb-3">
            <strong>{{ deletingCustomer.name }}</strong> এর তথ্য মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফিরিয়ে নেওয়া যাবে না।
          </p>
          <div class="d-flex justify-content-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              :disabled="deleteLoading"
              @click="deletingCustomer = null">
              বাতিল
            </button>
            <button
              type="button"
              class="btn btn-sm btn-danger"
              :disabled="deleteLoading"
              @click="executeDelete">
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Pagination from "@/components/datatable/Pagination.vue";
import Input from "@/components/Input.vue";
import Pagebar from "@/components/Pagebar.vue";
import SearchInput from "@/components/SearchInput.vue";
import Toast from "@/components/Toast.vue";
import { pulse } from "@/plugins/pulse";

useHead({ title: "কাস্টমার ম্যানেজমেন্ট - MFS Ledger" });

const route = useRoute();

interface Customer {
  id: number;
  userId: number;
  name: string;
  mobile: string;
  type: string;
  organizationName?: string | null;
  address?: string | null;
  note?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const toastRef = ref<any>(null);
const loading = ref(false);
const submitting = ref(false);
const customersList = ref<Customer[]>([]);

// ফিল্টারিং ও সার্চ
const filterType = ref<"all" | "সাধারণ" | "নিয়মিত">("all");
const searchQuery = ref("");
const perPage = 10;
const currentPage = ref(1);

// নতুন কাস্টমার ফর্ম স্টেট
const form = reactive({
  type: "সাধারণ",
  name: "",
  mobile: "",
  organizationName: "",
  address: ""
});

const errors = reactive({
  name: "",
  mobile: "",
  organizationName: "",
  address: ""
});

// এডিট স্টেট
const editingCustomer = ref<Customer | null>(null);
const editSubmitting = ref(false);
const editForm = reactive({
  id: 0,
  type: "সাধারণ",
  name: "",
  mobile: "",
  organizationName: "",
  address: ""
});

// ডিলিট স্টেট
const deletingCustomer = ref<Customer | null>(null);
const deleteLoading = ref(false);

const countGeneral = computed(() => {
  return customersList.value.filter((c) => c.type === "সাধারণ").length;
});

const countRegular = computed(() => {
  return customersList.value.filter((c) => c.type === "নিয়মিত").length;
});

function setFilter(type: "all" | "সাধারণ" | "নিয়মিত") {
  filterType.value = type;
  currentPage.value = 1;
}

const filteredCustomers = computed(() => {
  let list = customersList.value;

  if (filterType.value !== "all") {
    list = list.filter((c) => c.type === filterType.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(q);
      const mobileMatch = c.mobile?.toLowerCase().includes(q);
      const orgMatch = c.organizationName?.toLowerCase().includes(q);
      const addrMatch = c.address?.toLowerCase().includes(q);
      return nameMatch || mobileMatch || orgMatch || addrMatch;
    });
  }

  return list;
});

const pagedCustomers = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredCustomers.value.slice(start, start + perPage);
});

watch(
  () => route.query.page,
  (val) => {
    currentPage.value = parseInt(String(val), 10) || 1;
  },
  { immediate: true }
);

const paginationData = computed(() => ({
  current_page: currentPage.value,
  last_page: Math.max(1, Math.ceil(filteredCustomers.value.length / perPage)),
  per_page: perPage,
  total: filteredCustomers.value.length,
  path: route.path
}));

function resetForm() {
  form.type = "সাধারণ";
  form.name = "";
  form.mobile = "";
  form.organizationName = "";
  form.address = "";
  errors.name = "";
  errors.mobile = "";
  errors.organizationName = "";
  errors.address = "";
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return dateStr;
  }
}

// কাস্টমার তালিকা ফেচ
async function fetchCustomers() {
  loading.value = true;
  try {
    const res = await axios.get("/api/customers");
    customersList.value = res.data?.data || [];
  } catch (e: any) {
    const msg = e.response?.data?.message || "কাস্টমার তালিকা লোড করতে ব্যর্থ হয়েছে";
    toastRef.value?.toastme(msg, "danger");
  } finally {
    loading.value = false;
  }
}

// নতুন কাস্টমার সংরক্ষণ
async function submitCustomer() {
  errors.name = "";
  errors.mobile = "";
  errors.organizationName = "";
  errors.address = "";

  if (!form.name.trim()) {
    errors.name = "কাস্টমারের নাম প্রদান করুন";
    return;
  }
  if (!form.mobile.trim()) {
    errors.mobile = "মোবাইল নম্বর প্রদান করুন";
    return;
  }
  if (!form.address.trim()) {
    errors.address = "ঠিকানা প্রদান করুন";
    return;
  }

  submitting.value = true;
  try {
    const res = await axios.post("/api/customers", {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      type: form.type,
      organizationName: form.organizationName ? form.organizationName.trim() : null,
      address: form.address.trim()
    });

    toastRef.value?.toastme(res.data?.message || "কাস্টমার সফলভাবে সংরক্ষণ করা হয়েছে", "success");
    resetForm();
    // রিয়েলটাইমে সাথে সাথে তালিকায় এসে যাবে, বাড়তি নিরাপত্তার জন্য ৮০০ms পর ফলব্যাক রিফ্রেশ
    setTimeout(() => {
      fetchCustomers();
    }, 800);
  } catch (e: any) {
    const msg = e.response?.data?.message || "কাস্টমার যোগ করতে ব্যর্থ হয়েছে";
    toastRef.value?.toastme(msg, "danger");
  } finally {
    submitting.value = false;
  }
}

// এডিট মডাল ওপেন
function openEditModal(customer: Customer) {
  editingCustomer.value = customer;
  editForm.id = customer.id;
  editForm.type = customer.type || "সাধারণ";
  editForm.name = customer.name;
  editForm.mobile = customer.mobile;
  editForm.organizationName = customer.organizationName || "";
  editForm.address = customer.address || "";
}

function closeEditModal() {
  editingCustomer.value = null;
}

// এডিট আপডেট সাবমিট
async function updateCustomer() {
  if (!editForm.name.trim() || !editForm.mobile.trim() || !editForm.address.trim()) {
    toastRef.value?.toastme("নাম, মোবাইল নম্বর এবং ঠিকানা আবশ্যক", "danger");
    return;
  }

  editSubmitting.value = true;
  try {
    const res = await axios.put(`/api/customers/${editForm.id}`, {
      name: editForm.name.trim(),
      mobile: editForm.mobile.trim(),
      type: editForm.type,
      organizationName: editForm.organizationName ? editForm.organizationName.trim() : null,
      address: editForm.address.trim()
    });

    toastRef.value?.toastme(res.data?.message || "কাস্টমার তথ্য আপডেট হয়েছে", "success");
    closeEditModal();
    await fetchCustomers();
  } catch (e: any) {
    const msg = e.response?.data?.message || "কাস্টমার আপডেট করতে ব্যর্থ হয়েছে";
    toastRef.value?.toastme(msg, "danger");
  } finally {
    editSubmitting.value = false;
  }
}

// ডিলিট কনফার্ম
function confirmDelete(customer: Customer) {
  deletingCustomer.value = customer;
}

async function executeDelete() {
  if (!deletingCustomer.value) return;
  deleteLoading.value = true;
  try {
    const res = await axios.delete(`/api/customers/${deletingCustomer.value.id}`);
    toastRef.value?.toastme(res.data?.message || "কাস্টমার মুছে ফেলা হয়েছে", "success");
    deletingCustomer.value = null;
    await fetchCustomers();
  } catch (e: any) {
    const msg = e.response?.data?.message || "কাস্টমার মুছতে ব্যর্থ হয়েছে";
    toastRef.value?.toastme(msg, "danger");
  } finally {
    deleteLoading.value = false;
  }
}

onMounted(() => {
  fetchCustomers();

  // রিয়েলটাইম Pulse / WebSocket চ্যানেল সাবস্ক্রিপশন
  const channel = pulse.channel("customers");

  // নতুন কাস্টমার কিউ থেকে সেভ হওয়া মাত্রই রিয়েলটাইমে টেবিলে শীর্ষে যোগ হবে
  channel.listen("customer.created", (newCustomer: Customer) => {
    if (!newCustomer || !newCustomer.id) return;
    const exists = customersList.value.some((c) => c.id === newCustomer.id);
    if (!exists) {
      customersList.value.unshift(newCustomer);
      toastRef.value?.toastme(`রিয়েলটাইম আপডেট: "${newCustomer.name}" কাস্টমার তালিকায় যুক্ত হয়েছেন`, "info");
    }
  });

  // কাস্টমার তথ্য এডিট রিয়েলটাইমে টেবিলে রিফ্লেক্ট হবে
  channel.listen("customer.updated", (updated: Customer) => {
    if (!updated || !updated.id) return;
    const idx = customersList.value.findIndex((c) => c.id === updated.id);
    if (idx !== -1) {
      customersList.value[idx] = { ...customersList.value[idx], ...updated };
    }
  });

  // কাস্টমার ডিলিট রিয়েলটাইমে টেবিলে রিফ্লেক্ট হবে
  channel.listen("customer.deleted", (data: { id: number }) => {
    if (!data || !data.id) return;
    customersList.value = customersList.value.filter((c) => c.id !== data.id);
  });
});

onUnmounted(() => {
  const channel = pulse.channel("customers");
  channel.stopListening("customer.created");
  channel.stopListening("customer.updated");
  channel.stopListening("customer.deleted");
});
</script>

<style scoped>
.customers-page {
  font-family: inherit;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

/* কাউন্ট ও এন্ট্রি ফর্ম ব্যাজ */
.customer-count-badge {
  background-color: rgba(59, 142, 237, 0.16) !important;
  color: #60a5fa !important;
  border: 1px solid rgba(59, 142, 237, 0.35) !important;
  font-weight: 600;
  font-size: 0.8125rem;
}
:global(html.theme-light .customer-count-badge) {
  background-color: rgba(13, 110, 253, 0.1) !important;
  color: #0d6efd !important;
  border: 1px solid rgba(13, 110, 253, 0.25) !important;
}

/* টেবিল ফিল্টার বার */
.table-filter-bar {
  background: transparent !important;
  border-bottom: 1px solid var(--app-border, rgba(255, 255, 255, 0.1));
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

.filter-btn-group .btn.active-filter-general {
  background-color: #475569 !important;
  border-color: #475569 !important;
  color: #ffffff !important;
}

.filter-btn-group .btn.active-filter-regular {
  background-color: #198754 !important;
  border-color: #198754 !important;
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

.cursor-pointer {
  cursor: pointer;
}
</style>
