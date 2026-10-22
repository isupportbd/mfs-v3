<template>
  <Pagebar title="Settings" />
  <Toast ref="toastRef" />

  <div class="settings-page w-100" style="min-width: 0; max-width: 100%; overflow-x: hidden;">
    <!-- ১. ব্যাংক ও এমএফএস এড করার ফর্ম (উপরে) -->
    <div class="card border shadow-sm mb-4 w-100" style="min-width: 0; max-width: 100%;">
      <div class="card-header py-3 border-bottom">
        <h6 class="mb-0 fw-semibold">
          <i class="bi bi-plus-circle me-1 text-primary"></i>Add Bank or MFS Provider
        </h6>
      </div>
      <div class="card-body py-3">
        <form @submit.prevent="submitProvider">
          <div class="row g-3 align-items-end">
            <!-- Type (Bank or MFS) -->
            <div class="col-12 col-md-3">
              <label class="d-flex align-items-center mb-1" for="providerType">
                <span class="text-capitalize">Type</span>
                <span class="text-danger ms-1">*</span>
              </label>
              <select
                id="providerType"
                v-model="form.type"
                class="form-select"
                style="height: 38px;"
                required>
                <option value="mfs">MFS</option>
                <option value="bank">Bank</option>
              </select>
            </div>

            <!-- Provider Name -->
            <div class="col-12 col-md-6">
              <Input
                id="providerName"
                v-model="form.name"
                type="text"
                label="Provider / Institution Name"
                placeholder="e.g. bKash, Nagad, Rocket, Dutch-Bangla Bank, City Bank"
                topclass="mb-0"
                :err="errors.name"
                must />
            </div>

            <!-- Submit Button -->
            <div class="col-12 col-md-3">
              <button
                type="submit"
                class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                style="height: 38px;"
                :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="bi bi-plus-lg me-1"></i>Add Provider
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ২. ব্যাংক ও এমএফএস তালিকা টেবিল (নিচে) -->
    <div class="card border shadow-sm w-100" style="min-width: 0; max-width: 100%;">
      <div class="card-header py-2 py-md-3 border-bottom">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2">
          <!-- Title & Total Badge -->
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h6 class="mb-0 fw-semibold">
              <i class="bi bi-list-check me-1 text-primary"></i>Bank & MFS Provider
            </h6>
            <span class="badge bg-light text-secondary border flex-shrink-0">Total {{ filteredProviders.length }}</span>
          </div>

          <!-- মাঝখানে সার্চ ইনপুট ফিল্ড -->
          <div class="w-100 flex-grow-1 mx-md-2" style="max-width: 360px;">
            <SearchInput
              v-model="searchQuery"
              placeholder="Search bank or MFS..." />
          </div>

          <!-- Filter buttons -->
          <div class="d-flex gap-1 justify-content-start justify-content-md-end flex-wrap">
            <button
              class="btn btn-sm"
              :class="filterType === 'all' ? 'btn-outline-primary active' : 'btn-outline-secondary'"
              @click="setFilter('all')">
              All
            </button>
            <button
              class="btn btn-sm"
              :class="filterType === 'mfs' ? 'btn-outline-primary active' : 'btn-outline-secondary'"
              @click="setFilter('mfs')">
              MFS
            </button>
            <button
              class="btn btn-sm"
              :class="filterType === 'bank' ? 'btn-outline-primary active' : 'btn-outline-secondary'"
              @click="setFilter('bank')">
              Bank
            </button>
          </div>
        </div>
      </div>

      <div class="card-body p-0" style="max-width: 100%;">
        <div v-if="loading" class="text-center py-4">
          <span class="spinner-border spinner-border-sm text-primary" role="status"></span>
          <p class="small text-muted mt-2 mb-0">Loading providers list...</p>
        </div>

        <div v-else-if="filteredProviders.length === 0" class="text-center py-4 text-muted small">
          No providers found. Add your first MFS or Bank above.
        </div>

        <div v-else class="table-responsive w-100" style="max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;">
          <table class="table table-hover align-middle mb-0" style="min-width: 480px;">
            <thead class="table-light small text-muted">
              <tr>
                <th scope="col" class="ps-2 ps-md-3" style="width: 45px;">#</th>
                <th scope="col" style="width: 75px;">Type</th>
                <th scope="col">Provider / Bank Name</th>
                <th scope="col" class="text-center" style="width: 85px;">Status</th>
                <th scope="col" class="text-end pe-2 pe-md-3" style="width: 50px;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(provider, index) in pagedProviders" :key="provider.id">
                <td class="ps-2 ps-md-3 text-muted small">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                <td>
                  <span
                    class="badge"
                    :class="provider.type === 'mfs' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-info-subtle text-info-emphasis border border-info-subtle'">
                    {{ provider.type === 'mfs' ? 'MFS' : 'Bank' }}
                  </span>
                </td>
                <td class="fw-semibold text-break">{{ provider.name }}</td>
                <td class="text-center">
                  <span
                    class="badge"
                    :class="provider.isActive ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-muted'">
                    {{ provider.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end pe-2 pe-md-3">
                  <button
                    class="btn btn-sm"
                    :class="provider.isActive ? 'btn-outline-warning' : 'btn-outline-success'"
                    :title="provider.isActive ? 'Deactivate' : 'Activate'"
                    :aria-label="provider.isActive ? 'Deactivate' : 'Activate'"
                    @click="toggleProvider(provider.id)">
                    <i :class="provider.isActive ? 'bi bi-pause-circle' : 'bi bi-play-circle'"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- কার্ড ফুটার: প্রতি ১০টি করে পেজিনেশন -->
      <div v-if="filteredProviders.length > 0" class="card-footer py-2 py-md-3 border-top" style="max-width: 100%; overflow-x: auto;">
        <Pagination :data="paginationData" variant="primary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import axios from "axios";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Pagination from "@/components/datatable/Pagination.vue";
import Input from "@/components/Input.vue";
import Pagebar from "@/components/Pagebar.vue";
import SearchInput from "@/components/SearchInput.vue";
import Toast from "@/components/Toast.vue";

useHead({ title: "Settings - MFS Ledger" });

interface Provider {
  id: number;
  type: "bank" | "mfs";
  name: string;
  isActive: boolean;
  createdAt?: string;
}

const route = useRoute();
const toastRef = ref<any>(null);
const loading = ref(false);
const submitting = ref(false);
const providersList = ref<Provider[]>([]);
const filterType = ref<"all" | "mfs" | "bank">("all");
const searchQuery = ref("");

const perPage = 10;
const currentPage = ref(1);

const form = reactive({
  type: "mfs" as "bank" | "mfs",
  name: ""
});

const errors = reactive({
  name: ""
});

function setFilter(type: "all" | "mfs" | "bank") {
  filterType.value = type;
  currentPage.value = 1;
}

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(
  () => route.query.page,
  (val) => {
    currentPage.value = parseInt(String(val), 10) || 1;
  },
  { immediate: true }
);

const filteredProviders = computed(() => {
  let list = providersList.value;
  if (filterType.value !== "all") {
    list = list.filter((p) => p.type === filterType.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  return list;
});

const paginationData = computed(() => ({
  current_page: currentPage.value,
  last_page: Math.max(1, Math.ceil(filteredProviders.value.length / perPage)),
  per_page: perPage,
  total: filteredProviders.value.length,
  path: route.path
}));

const pagedProviders = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredProviders.value.slice(start, start + perPage);
});

async function fetchProviders() {
  loading.value = true;
  try {
    const res = await axios.get("/api/settings/providers?all=true");
    providersList.value = res.data?.data || [];
  } catch (e: any) {
    console.error("Failed to load providers", e);
  } finally {
    loading.value = false;
  }
}

async function submitProvider() {
  errors.name = "";
  if (!form.name.trim()) {
    errors.name = "Provider name is required";
    return;
  }

  submitting.value = true;
  try {
    const res = await axios.post("/api/settings/providers", {
      type: form.type,
      name: form.name.trim()
    });

    toastRef.value?.toastme(res.data?.message || "Provider added successfully", "success");
    form.name = "";
    await fetchProviders();
  } catch (e: any) {
    const msg = e.response?.data?.message || "Failed to add provider";
    toastRef.value?.toastme(msg, "danger");
  } finally {
    submitting.value = false;
  }
}

async function toggleProvider(id: number) {
  try {
    const res = await axios.patch(`/api/settings/providers/${id}/toggle`);
    toastRef.value?.toastme(res.data?.message || "Provider status updated", "success");
    await fetchProviders();
  } catch (e: any) {
    const msg = e.response?.data?.message || "Failed to update provider status";
    toastRef.value?.toastme(msg, "danger");
  }
}

onMounted(() => {
  fetchProviders();
});
</script>
