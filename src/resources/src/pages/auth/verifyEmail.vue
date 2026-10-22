<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center py-4 px-3">
    <div class="auth w-100">
      <div class="card card-body border-0 p-0 bg-transparent">
        <div class="d-block mb-3 text-center">
          <img src="@/assets/images/logo.svg" alt="MFS Ledger" style="max-height: 52px; object-fit: contain;" />
        </div>
        <h4 class="text-center">Email Verification</h4>
        <p
          v-if="message"
          class="text-center alert py-2 mt-2"
          :class="isError ? 'alert-danger text-danger' : 'alert-success text-success'">
          {{ message }}
        </p>
        <div class="text-center mt-2">
          <router-link to="/login">
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
import { useRoute } from "vue-router";
import { useGum } from "@/plugins/gum";

useHead({ title: "Verify Email" });

const route = useRoute();

const email = String(route.query.email || "").trim();
const token = String(route.query.token || "").trim();
const message = ref("Verifying your email...");
const isError = ref(false);

const { post } = useGum();

const verify = async () => {
  if (!email || !token) {
    isError.value = true;
    message.value = "Invalid verification link. Please request a new one.";
    return;
  }

  await post(
    "/api/auth/verify-email",
    { email, token },
    {
      onSuccess: () => {
        isError.value = false;
        message.value = "Email verified successfully. You can now login.";
      },
      onError: (_errors, error) => {
        isError.value = true;
        message.value = error instanceof Error ? error.message : "Failed to verify email";
      }
    }
  );
};

void verify();
</script>

<style lang="scss" scoped></style>
