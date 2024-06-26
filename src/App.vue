<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { BlockedWebsite } from "./services/blockedWebsiteService";
import blockedWebsiteService from "./services/blockedWebsiteService";
import trackedWebsiteService from "./services/trackedWebsiteService";
import {
  hideTooltip,
  initTab,
  initTooltip,
} from "./utilities/bootstrapUtility";
import { numberToTime } from "./utilities/functionsUtility";
// import fakeTrackedWebsiteService from "./services/fakeTrackedWebsiteService";

const appName = "Browser Watchman";
const isPopupLoading = ref<boolean>(true);
const trackedWebsites = ref<any>([]);
const blockedWebsiteFormBody = ref<any>({
  blocked_websites: "",
});

const handleBlockClick = async (trackedWebsite: any) => {
  if (blockedWebsiteFormBody.value.blocked_websites != "") {
    blockedWebsiteFormBody.value.blocked_websites =
      blockedWebsiteFormBody.value.blocked_websites +
      "\n" +
      trackedWebsite.hostname;
  } else {
    blockedWebsiteFormBody.value.blocked_websites = trackedWebsite.hostname;
  }
  await handleSubmit();

  trackedWebsite.is_blocked = true;
  trackedWebsiteService.update(trackedWebsites.value, trackedWebsite);
  hideTooltip();
};

const handleClick = () => {};

const handleSubmit = async () => {
  await blockedWebsiteService.store(blockedWebsiteFormBody.value);
  chrome.runtime.sendMessage({ type: "onBlockedWebsitesUpdated" });
};

const setBlockedWebsites = async () => {
  const blockedWebsites =
    (await blockedWebsiteService.index()) as BlockedWebsite[];
  blockedWebsiteFormBody.value.blocked_websites =
    blockedWebsiteService.getBlockedWebsitesString(blockedWebsites);
};

const setHistoryContent = async () => {
  // trackedWebsites.value = fakeTrackedWebsiteService.data;

  const ar: any = [];
  const data: any = await trackedWebsiteService.index();
  // const data: any = await fakeTrackedWebsiteService.data;
  let totalTime = 0;

  data.forEach((trackedWebsite: any) => {
    let totalWebsiteTime = 0;
    trackedWebsite.timings.forEach((trackedWebsiteTiming: any) => {
      const endAtObject: any = trackedWebsiteTiming.end_at
        ? new Date(trackedWebsiteTiming.end_at)
        : new Date();
      const startAtObject: any = new Date(trackedWebsiteTiming.start_at);

      const differenceInMilliseconds: any = endAtObject - startAtObject;
      console.log(differenceInMilliseconds);
      totalWebsiteTime += differenceInMilliseconds;
    });
    ar.push({
      ...trackedWebsite,
      time: totalWebsiteTime,
    });

    totalTime += totalWebsiteTime;
  });
  ar.forEach((websiteTiming: any, index: number) => {
    ar[index].proportion = ((websiteTiming.time / totalTime) * 100).toFixed(2);
  });

  trackedWebsites.value = ar;
};

onMounted(async () => {
  initTab();

  await setHistoryContent();
  await setBlockedWebsites();

  isPopupLoading.value = false;

  initTooltip();
});
</script>

<template>
  <header class="py-3">
    <div class="container">
      <div class="d-flex align-items-center justify-content-between">
        <div class="img-logo-wrapper">
          <img
            src="./assets/logo.svg"
            :alt="appName"
            srcset=""
            class="img-fluid img-logo"
          />
        </div>
        <div>
          <button
            type="button"
            class="btn btn-secondary btn-flat"
            @click="handleClick"
          >
            Teams(Coming Soon)
          </button>
        </div>
      </div>
    </div>
  </header>
  <div>
    <div class="container">
      <!-- tabs buttons -->
      <div class="d-flex align-items-center justify-content-center mb-3">
        <ul class="nav nav-underline">
          <li class="nav-item">
            <!-- data-bs-target="#nav-home" -->
            <a
              class="nav-link active"
              href="#nav-home"
              data-bs-toggle="tab"
              role="tab"
              aria-controls="nav-home"
              aria-selected="true"
              >Today</a
            >
          </li>
          <li class="nav-item">
            <!-- data-bs-target="#nav-blacklisted" -->
            <a
              class="nav-link"
              href="#nav-blacklisted"
              data-bs-toggle="tab"
              role="tab"
              aria-controls="nav-blacklisted"
              aria-selected="false"
              >Blacklisted</a
            >
          </li>
        </ul>
      </div>

      <Transition name="slide-up" mode="out-in">
        <div
          key="history-loader"
          class="d-flex justify-content-center align-items-center"
          v-if="isPopupLoading"
        >
          <div class="loader"></div>
        </div>

        <!-- tabs -->
        <!-- Tab panes -->
        <div class="tab-content" id="nav-tab-content" v-else>
          <div
            key="history-tab-pane"
            class="tab-pane fade show active"
            id="nav-home"
            role="tabpanel"
            aria-labelledby="nav-home-tab"
            tabindex="0"
          >
            <div class="tab-content-wrapper">
              <!-- right align buttons -->
              <!-- <div
                class="d-flex align-items-center justify-content-end gap-2 mb-3"
              >
                <button type="button" class="btn btn-secondary btn-flat">
                  Show Hidden
                </button>
                <!- <button type="button" class="btn btn-secondary btn-flat">
                  Reset Time
                </button> ->
                <!- <div class="font-weight-bolder"><strong>5:45 PM</strong></div> ->
                <!- <button type="button" class="btn btn-secondary btn-flat">
                  .
                </button> ->
              </div> -->
              <div class="d-flex flex-column gap-2">
                <!-- details -->
                <div
                  class="row align-items-center"
                  v-for="trackedWebsite in trackedWebsites"
                >
                  <div class="col-auto">
                    <img
                      :src="trackedWebsite.favicon"
                      alt=""
                      srcset=""
                      class="img-fluid website-favicon"
                    />
                  </div>
                  <div class="col">
                    <div class="d-flex flex-column">
                      <div
                        class="d-flex align-items-center justify-content-between"
                      >
                        <div class="website-name">
                          {{ trackedWebsite.hostname }}
                        </div>
                        <div>
                          <strong
                            >{{ numberToTime(trackedWebsite.time) }} |
                            {{ trackedWebsite.proportion }}%</strong
                          >
                        </div>
                      </div>
                      <div class="website-progress-bar-wrapper">
                        <div
                          class="progress website-progress"
                          role="progressbar"
                          aria-label="Basic example"
                          :aria-valuenow="trackedWebsite.proportion"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <div
                            class="progress-bar"
                            :style="`width: ${trackedWebsite.proportion}%`"
                          ></div>
                        </div>
                        <!-- <div
                          class="progress website-progress"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="25"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <div
                            class="progress-bar bg-success"
                            style="width: 25%"
                          ></div>
                        </div> -->
                      </div>
                    </div>
                  </div>
                  <div class="col-auto">
                    <!-- <button type="button" class="btn btn-secondary btn-flat">
                      .
                    </button> -->
                    <!-- <div class="img-icon-wrapper">

                    </div> -->
                    <button
                      type="button"
                      class="btn btn-block p-0 d-flex align-items-center justify-content-center"
                      data-bs-toggle="tooltip"
                      data-bs-title="Block"
                      @click="handleBlockClick(trackedWebsite)"
                      v-if="!trackedWebsite.is_blocked"
                    >
                      <img
                        src="./assets/icons/block.svg"
                        class="img-fluid img-icon"
                      />
                    </button>
                    <div v-else style="width: 20px"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="tab-pane fade"
            id="nav-blacklisted"
            role="tabpanel"
            aria-labelledby="nav-blacklisted-tab"
            tabindex="0"
          >
            <form action="" method="post" @submit.prevent="handleSubmit">
              <div
                class="d-flex flex-column align-items-center justify-content-center gap-2"
              >
                <div class="w-100">
                  <textarea
                    class="form-control"
                    id="exampleFormControlTextarea1"
                    rows="7"
                    v-model="blockedWebsiteFormBody.blocked_websites"
                  ></textarea>
                </div>
                <div class="w-100 text-end">
                  <button type="submit" class="btn btn-secondary">
                    Update
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
