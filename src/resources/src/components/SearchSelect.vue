<template>
  <div ref="rootRef" class="search-select-wrapper position-relative" :class="topclass">
    <!-- লেবেল -->
    <label
      v-if="label"
      :for="id"
      class="d-flex align-items-center mb-1">
      <span>{{ label }}</span>
      <span v-if="must" class="text-danger ms-1">*</span>
    </label>

    <!-- ইনপুট ফিল্ড -->
    <div class="search-select-input-container position-relative">
      <!-- সার্চ আইকন (বামে) -->
      <i
        class="bi bi-search search-icon text-muted"
        style="pointer-events: none;"></i>

      <input
        :id="id"
        ref="inputRef"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': !!err }"
        :placeholder="placeholder"
        :value="displayQuery"
        style="height: 38px;"
        autocomplete="off"
        @input="onInput"
        @focus="onFocus"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.enter.prevent="onEnter"
        @keydown.esc.prevent="closeDropdown" />

      <!-- ক্লিয়ার বাটন (ডানে, ভ্যালু থাকলে) -->
      <button
        v-if="displayQuery"
        type="button"
        class="btn-clear text-muted"
        title="মুছে ফেলুন"
        tabindex="-1"
        @click="clearSelection">
        <i class="bi bi-x-circle-fill"></i>
      </button>
    </div>

    <!-- ফিল্টার ড্রপডাউন মেনু (মূল ফিল্ডের বাইরের দিকে ছড়াবে না, একদম ফিল্ডের সমান ১০০% প্রস্থে থাকবে) -->
    <div
      v-if="isOpen && searchQuery.trim().length > 0"
      class="dropdown-menu-list position-absolute start-0 w-100 shadow-sm"
      tabindex="-1">
      <ul v-if="filteredOptions.length > 0" class="list-unstyled mb-0 py-1">
        <li
          v-for="(option, idx) in filteredOptions"
          :key="getOptionKey(option, idx)"
          class="dropdown-item-option d-flex align-items-center px-3 py-2"
          :class="{ 'active-item': hoveredIndex === idx, 'selected-item': isSelected(option) }"
          @mousedown.prevent="selectOption(option)"
          @mouseenter="hoveredIndex = idx">
          <!-- প্রতিটি অপশনের সামনে স্বতন্ত্র বুলেট ডট -->
          <span class="option-bullet" :class="getBulletClass(option)"></span>

          <!-- অপশন টেক্সট (প্রস্থ অনুযায়ী ভেঙে আসবে, ফিল্ডের বাইরে ওভারফ্লো হবে না) -->
          <span class="option-label text-truncate flex-grow-1" :title="getOptionLabel(option)">
            {{ getOptionLabel(option) }}
          </span>

          <!-- সাব-ট্যাগ/ধরন (যদি থাকে) -->
          <span
            v-if="getOptionSub(option)"
            class="badge sub-badge ms-2 flex-shrink-0 small">
            {{ getOptionSub(option) }}
          </span>
        </li>
      </ul>

      <!-- কোনো ফলাফল না থাকলে -->
      <div v-else class="no-results text-center py-3 text-muted small">
        <i class="bi bi-search me-1"></i>কোনো ফলাফল পাওয়া যায়নি
      </div>
    </div>

    <!-- এরর মেসেজ -->
    <div v-if="err" class="invalid-feedback d-block small mt-1">
      {{ err }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

export interface SearchOption {
  id?: number | string;
  name?: string;
  type?: string;
  label?: string;
  value?: any;
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    modelValue?: any;
    options: (SearchOption | string)[];
    label?: string;
    id?: string;
    placeholder?: string;
    must?: boolean;
    err?: string | boolean;
    topclass?: string;
  }>(),
  {
    modelValue: "",
    options: () => [],
    label: "",
    id: "searchSelect",
    placeholder: "ক্লিক করে টাইপ করুন...",
    must: false,
    err: "",
    topclass: "mb-0"
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", val: any): void;
  (e: "change", val: any, option: any): void;
}>();

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const isOpen = ref(false);
const searchQuery = ref("");
const displayQuery = ref("");
const hoveredIndex = ref(-1);

// modelValue পরিবর্তনের সাথে সিঙ্ক
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      displayQuery.value = "";
      searchQuery.value = "";
      isOpen.value = false;
      hoveredIndex.value = -1;
      if (inputRef.value) {
        inputRef.value.value = "";
      }
      return;
    }
    // অপশন লিস্ট থেকে ম্যাচিং লেবেল খোঁজা
    const found = props.options.find(opt => {
      if (typeof opt === "string") return opt === newVal;
      return opt.value === newVal || opt.name === newVal || opt.label === newVal;
    });

    if (found) {
      displayQuery.value = getOptionLabel(found);
    } else {
      displayQuery.value = String(newVal);
    }
  },
  { immediate: true }
);

// ফিল্টারকৃত অপশনসমূহ (শুধুমাত্র টাইপ শুরু করলে)
const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];

  return props.options.filter(opt => {
    const text = getOptionLabel(opt).toLowerCase();
    const sub = getOptionSub(opt).toLowerCase();
    return text.includes(q) || sub.includes(q);
  });
});

function getOptionLabel(opt: SearchOption | string): string {
  if (typeof opt === "string") return opt;
  return opt.label || opt.name || String(opt.value || "");
}

function getOptionSub(opt: SearchOption | string): string {
  if (typeof opt === "string") return "";
  if (opt.type) {
    return opt.type === "mfs" ? "MFS" : opt.type === "bank" ? "ব্যাংক" : opt.type;
  }
  return "";
}

function getOptionKey(opt: SearchOption | string, idx: number): string | number {
  if (typeof opt === "string") return `${opt}_${idx}`;
  return opt.id ?? `${getOptionLabel(opt)}_${idx}`;
}

function isSelected(opt: SearchOption | string): boolean {
  const val = typeof opt === "string" ? opt : (opt.value ?? opt.name);
  return val === props.modelValue;
}

function getBulletClass(opt: SearchOption | string): string {
  const label = getOptionLabel(opt).toLowerCase();
  if (label.includes("বিকাশ") || label.includes("bkash")) return "bullet-bkash";
  if (label.includes("নগদ") || label.includes("nagad")) return "bullet-nagad";
  if (label.includes("রকেট") || label.includes("rocket")) return "bullet-rocket";
  if (label.includes("উপায়") || label.includes("upay")) return "bullet-upay";
  if (label.includes("ব্যাংক") || label.includes("bank")) return "bullet-bank";
  return "bullet-default";
}

// ইনপুট ইভেন্ট: টাইপ শুরু করলেই কেবল ফিল্টার হয়ে ড্রপডাউন খুলবে
function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  searchQuery.value = target.value;
  displayQuery.value = target.value;

  if (target.value.trim().length > 0) {
    isOpen.value = true;
    hoveredIndex.value = 0;
  } else {
    isOpen.value = false;
    emit("update:modelValue", "");
    emit("change", "", null);
  }
}

// ফোকাস ইভেন্ট: ব্যবহারকারীর নির্দেশনা "সরাসরি ড্রপ ডাউন অপেন হবে না"
function onFocus() {
  // ক্লিক বা ফোকাস করলে সরাসরি ওপেন হবে না, যদি না সার্চ কোয়েরি থাকে
  if (searchQuery.value.trim().length > 0) {
    isOpen.value = true;
  }
}

function selectOption(opt: SearchOption | string) {
  const val = typeof opt === "string" ? opt : (opt.name ?? opt.value ?? opt.label);
  displayQuery.value = getOptionLabel(opt);
  searchQuery.value = "";
  isOpen.value = false;
  hoveredIndex.value = -1;

  emit("update:modelValue", val);
  emit("change", val, opt);
}

function clearSelection() {
  displayQuery.value = "";
  searchQuery.value = "";
  isOpen.value = false;
  emit("update:modelValue", "");
  emit("change", "", null);
  inputRef.value?.focus();
}

function closeDropdown() {
  isOpen.value = false;
  hoveredIndex.value = -1;
}

function onArrowDown() {
  if (!isOpen.value && searchQuery.value.trim().length > 0) {
    isOpen.value = true;
    hoveredIndex.value = 0;
    return;
  }
  if (filteredOptions.value.length > 0) {
    hoveredIndex.value = (hoveredIndex.value + 1) % filteredOptions.value.length;
  }
}

function onArrowUp() {
  if (filteredOptions.value.length > 0) {
    hoveredIndex.value =
      (hoveredIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length;
  }
}

function onEnter() {
  if (isOpen.value && hoveredIndex.value >= 0 && hoveredIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[hoveredIndex.value]);
  }
}

// বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হওয়া
function handleOutsideClick(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    closeDropdown();
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<style scoped>
.search-select-wrapper {
  width: 100%;
}

.search-select-input-container {
  position: relative;
  width: 100%;
}

.search-select-input-container .search-icon {
  position: absolute;
  top: 50%;
  left: 0.85rem;
  transform: translateY(-50%);
  z-index: 4;
  font-size: 0.85rem;
  color: var(--bs-secondary-color, #64748b) !important;
  pointer-events: none;
}

.search-select-input-container .form-control {
  padding-left: 2.35rem !important;
  padding-right: 2.35rem !important;
}

.btn-clear {
  position: absolute;
  top: 50%;
  right: 0.85rem;
  transform: translateY(-50%);
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 1;
  font-size: 0.95rem;
  opacity: 0.6;
  transition: opacity 0.15s ease;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-clear:hover {
  opacity: 1;
}

/* ড্রপ ডাউন লিস্ট: মূল ফিল্ডের সমান ১০০% প্রস্থে থাকবে, কোনোভাবেই বাইরে প্রসারিত হবে না */
.dropdown-menu-list {
  top: calc(100% + 4px);
  max-width: 100% !important;
  box-sizing: border-box !important;
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1060;
  background-color: var(--bs-card-bg, #ffffff);
  border: 1px solid var(--bs-border-color, #cbd5e1);
  border-radius: 0.375rem;
  box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.12);
}

.dropdown-item-option {
  cursor: pointer;
  color: var(--bs-body-color);
  font-size: 0.875rem;
  transition: background-color 0.1s ease;
  user-select: none;
  width: 100%;
  box-sizing: border-box;
}

.dropdown-item-option:hover,
.dropdown-item-option.active-item {
  background-color: var(--app-hover, rgba(125, 125, 125, 0.08));
}

.dropdown-item-option.selected-item {
  background-color: rgba(13, 110, 253, 0.08);
  font-weight: 600;
}

/* প্রতিটি অপশনের সামনে স্বতন্ত্র বুলেট ডট */
.option-bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.65rem;
  flex-shrink: 0;
}

.bullet-bkash {
  background-color: #e11471;
  box-shadow: 0 0 0 2px rgba(225, 20, 113, 0.2);
}

.bullet-nagad {
  background-color: #f7941d;
  box-shadow: 0 0 0 2px rgba(247, 148, 29, 0.2);
}

.bullet-rocket {
  background-color: #8c3494;
  box-shadow: 0 0 0 2px rgba(140, 52, 148, 0.2);
}

.bullet-upay {
  background-color: #0099ff;
  box-shadow: 0 0 0 2px rgba(0, 153, 255, 0.2);
}

.bullet-bank {
  background-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
}

.bullet-default {
  background-color: #64748b;
  box-shadow: 0 0 0 2px rgba(100, 116, 139, 0.2);
}

.option-label {
  line-height: 1.35;
}

.sub-badge {
  background-color: rgba(125, 125, 125, 0.12);
  color: var(--bs-body-color);
  font-size: 0.75rem;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
}
</style>
