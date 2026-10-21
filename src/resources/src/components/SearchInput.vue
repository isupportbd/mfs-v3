<template>
  <div class="search-input-wrapper position-relative" :class="props.wrapperClass">
    <div class="input-group">
      <span class="input-group-text bg-transparent border-end-0 text-muted">
        <i v-if="!props.loading" class="bi bi-search"></i>
        <span v-else class="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
      </span>
      <input
        ref="inputRef"
        v-model="internalValue"
        type="text"
        class="form-control border-start-0 border-end-0 ps-0 shadow-none"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        @keyup.enter="handleEnter" />
      <span v-if="internalValue" class="input-group-text bg-transparent border-start-0 p-0 pe-2">
        <button
          type="button"
          class="btn btn-sm btn-link text-muted p-0 border-0 text-decoration-none"
          title="Clear search"
          @click="clear">
          <i class="bi bi-x-circle-fill"></i>
        </button>
      </span>
    </div>
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
.search-input-wrapper .form-control:focus {
  border-color: var(--bs-border-color);
  box-shadow: none;
}
.search-input-wrapper .input-group:focus-within {
  border-radius: 0.375rem;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.15);
}
.search-input-wrapper .input-group:focus-within .input-group-text,
.search-input-wrapper .input-group:focus-within .form-control {
  border-color: var(--bs-primary);
}
</style>
