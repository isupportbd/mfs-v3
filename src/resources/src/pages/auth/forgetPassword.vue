<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center py-4 px-3">
    <div class="auth w-100">
      <div class="card card-body border-0 p-0 bg-transparent">
        <div class="d-block mb-3 text-center">
          <img src="@/assets/images/logo.svg" alt="MFS Ledger" style="max-height: 52px; object-fit: contain;" />
        </div>
        <h4 class="text-center">Forget Password</h4>
        <p
          v-if="message"
          class="text-center alert py-1 mt-2"
          :class="isError ? 'alert-danger text-danger' : 'alert-success text-success'">
          {{ message }}
        </p>
        <form id="formAuthentication" @submit.prevent="onSubmit">
          <div class="mb-4">
            <Input
              id="email"
              v-model="form.data.email"
              type="email"
              label="email"
              placeholder="Enter your email..."
              :err="form.errors.email"
              focus
              must />
          </div>
          <Button
            type="submit"
            label="Send Reset Link"
            class="btn btn-primary w-100"
            icon="bi bi-send ms-2"
            :disabled="processing" />
        </form>
        <div class="text-center mt-2">
          <router-link to="/login">
            <i class="bx bx-chevron-left scaleX-n1-rtl me-1"></i>
            <span>Back to login</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { ref } from "vue";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import { useGumForm } from "@/plugins/gum";

useHead({ title: "Forget Password" });

const form = useGumForm({ email: "" });
const processing = form.processing;
const message = ref("");
const isError = ref(false);

const onSubmit = async () => {
  message.value = "";
  isError.value = false;
  await form.post(
    "/api/auth/forgot-password",
    {
      email: String(form.data.email || "").trim()
    },
    {
      onSuccess: (res) => {
        isError.value = false;
        message.value = res.data.message;
        form.reset();
      },
      onError: (_errors, error) => {
        isError.value = true;
        message.value = error instanceof Error ? error.message : "Failed to process request";
      }
    }
  );
};
</script>

<style lang="scss" scoped></style>
