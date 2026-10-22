<template>
  <div class="search-input-wrapper position-relative" :class="props.wrapperClass">
    <i
      v-if="!props.loading"
      class="bi bi-search search-icon text-muted"
      style="pointer-events: none;"></i>
    <span
      v-else
      class="spinner-border spinner-border-sm text-primary search-icon"
      style="pointer-events: none;"
      role="status"
      aria-hidden="true"></span>

    <input
      ref="inputRef"
      v-model="internalValue"
      type="text"
      class="form-control"
      :class="{ 'pe-5': internalValue }"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      @keyup.enter="handleEnter" />

    <button
      v-if="internalValue"
      type="button"
      class="btn btn-sm btn-link text-muted p-0 border-0 text-decoration-none clear-btn"
      title="Clear search"
      @click="clear">
      <i class="bi bi-x-circle-fill"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { debounce } from "lodash-es";
import { onBeforeUnmount, ref, watch } from "vue";

interface SearchInputProps {
  modelValue?: string;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
  disabled?: boolean;
  wrapperClass?: string;
}

const props = withDefaults(defineProps<SearchInputProps>(), {
  modelValue: "",
  placeholder: "Search...",
  debounceMs: 350,
  loading: false,
  disabled: false,
  wrapperClass: ""
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "search", value: string): void;
  (e: "clear"): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const internalValue = ref(props.modelValue);

const emitSearchDebounced = debounce((val: string) => {
  emit("update:modelValue", val);
  emit("search", val);
}, props.debounceMs);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== internalValue.value) {
      internalValue.value = newVal;
    }
  }
);

watch(internalValue, (val) => {
  emitSearchDebounced(val.trim());
});

function handleEnter() {
  emitSearchDebounced.flush();
}

function clear() {
  internalValue.value = "";
  emit("update:modelValue", "");
  emit("clear");
  emit("search", "");
  inputRef.value?.focus();
}

onBeforeUnmount(() => {
  emitSearchDebounced.cancel();
});
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 0.85rem;
  transform: translateY(-50%);
  z-index: 4;
  font-size: 0.9rem;
  background: transparent !important;
  border: none !important;
  color: var(--app-placeholder, var(--bs-secondary-color)) !important;
}

.search-input-wrapper .form-control {
  padding-left: 2.35rem;
}

.search-input-wrapper .form-control::placeholder {
  color: var(--app-placeholder, #94a3b8) !important;
  opacity: 0.85;
}

.search-input-wrapper .form-control.pe-5 {
  padding-right: 2.35rem;
}

.clear-btn {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  z-index: 4;
  background: transparent;
  border: none;
  font-size: 0.95rem;
}

.clear-btn:hover {
  color: var(--bs-body-color) !important;
}
</style>
