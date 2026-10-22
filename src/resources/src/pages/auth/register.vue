<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center py-4 px-3">
    <div class="auth w-100">
      <div class="card card-body border-0 p-0 bg-transparent">
        <div class="d-flex align-items-center justify-content-center mb-3">
          <img src="@/assets/images/logo.svg" alt="MFS Ledger Logo" class="me-2" style="width: 32px; height: 42px; object-fit: contain;" />
          <span class="fs-4 fw-bold" style="color: inherit;">MFS Ledger</span>
        </div>
        <h4 class="text-center">Create Account</h4>
        <p
          v-if="message"
          class="text-center alert py-1 mt-2"
          :class="isError ? 'alert-danger text-danger' : 'alert-success text-success'">
          {{ message }}
        </p>
        <form @submit.prevent="onSubmit">
          <div class="mb-3">
            <Input
              id="name"
              v-model="form.data.name"
              type="text"
              label="your name"
              placeholder="Enter your full name..."
              :err="form.errors.name"
              focus
              must />
          </div>
          <div class="mb-3">
            <Input
              id="companyName"
              v-model="form.data.companyName"
              type="text"
              label="company / business name"
              placeholder="Enter company or shop name..."
              :err="form.errors.companyName"
              must />
          </div>
          <div class="mb-3">
            <Input
              id="mobile"
              v-model="form.data.mobile"
              type="text"
              label="mobile number"
              placeholder="e.g. 01700000000"
              :err="form.errors.mobile"
              must />
          </div>
          <div class="mb-3">
            <Input
              id="address"
              v-model="form.data.address"
              type="text"
              label="business address"
              placeholder="Enter address..."
              :err="form.errors.address"
              must />
          </div>
          <div class="mb-3">
            <Input
              id="email"
              v-model="form.data.email"
              type="email"
              label="email"
              placeholder="Enter your email..."
              :err="form.errors.email"
              must />
          </div>
          <div class="mb-4">
            <InputPasswordToggle
              id="password"
              v-model="form.data.password"
              label="password"
              placeholder="Create a password..."
              :err="form.errors.password"
              must />
          </div>
          <div class="mb-4">
            <InputPasswordToggle
              id="password_confirmation"
              v-model="form.data.password_confirmation"
              label="confirm password"
              placeholder="Confirm your password..."
              :err="form.errors.password_confirmation"
              must />
          </div>
          <Button type="submit" class="btn btn-primary w-100" label="Create Account"
            icon="bi bi-person-plus" :disabled="processing" />
        </form>
        <div class="text-center mt-3">
          <span class="text-muted">Already have an account?</span>
          <router-link to="/login" class="ms-1 text-decoration-none">Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { ref } from "vue";
import { useRouter } from "vue-router";
import Input from "@/components/Input.vue";
import InputPasswordToggle from "@/components/InputPasswordToggle.vue";
import Button from "@/components/Button.vue";
import { useGumForm } from "@/plugins/gum";
import { useAuthStore } from "@/stores/auth";

useHead({ title: "Register" });

const router = useRouter();
const auth = useAuthStore();

const form = useGumForm({
  name: "",
  companyName: "",
  mobile: "",
  address: "",
  email: "",
  password: "",
  password_confirmation: ""
});

const processing = form.processing;
const message = ref("");
const isError = ref(false);

const onSubmit = async () => {
  message.value = "";
  isError.value = false;

  if (form.data.password !== form.data.password_confirmation) {
    isError.value = true;
    message.value = "Password confirmation does not match";
    return;
  }

  await form.post(
    "/api/auth/register",
    {
      name: String(form.data.name || "").trim(),
      companyName: String(form.data.companyName || "").trim(),
      mobile: String(form.data.mobile || "").trim(),
      address: String(form.data.address || "").trim(),
      email: String(form.data.email || "").trim(),
      password: form.data.password,
      password_confirmation: form.data.password_confirmation
    },
    {
      onSuccess: async () => {
        auth.initialized = false;
        await auth.bootstrap();

        if (auth.isAuthenticated) {
          await router.push("/");
          return;
        }

        message.value = "Registration successful. Please verify your email.";
        form.reset();
      },
      onError: (_errors, error) => {
        isError.value = true;
        message.value = error instanceof Error ? error.message : "Unable to register right now";
      }
    }
  );
};
</script>

<style lang="scss" scoped></style>
