<script setup lang="ts">
import { ref } from "vue";

const urlParams = new URLSearchParams(window.location.search);
const hostname = ref<string>(urlParams.get("hostname") ?? "");
const websiteUrl = ref<string>(urlParams.get("url") ?? "");
const favicon = ref<string>(urlParams.get("favicon") ?? "");
</script>

<template>
  <div class="container container-block-page">
    <div
      class="d-flex flex-column align-items-center justify-content-center w-100 h-100"
    >
      <div class="logo-wrapper mb-3">
        <img
          src="./../assets/logo.svg"
          class="img-fluid w-100"
          alt=""
          srcset=""
        />
      </div>
      <p>This website has been blocked.</p>
      <div class="d-flex align-items-center gap-3 justify-content-center mb-3">
        <div class="favicon-wrapper">
          <img
            class="img-fluid website-favicon"
            :src="favicon"
            alt=""
            srcset=""
          />
        </div>
        <h5>{{ hostname }}</h5>
      </div>
      <div class="text-muted">{{ websiteUrl }}</div>
    </div>
  </div>
</template>
