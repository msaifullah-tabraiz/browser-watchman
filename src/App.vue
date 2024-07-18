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
import {
  getHostnameFromURLObj,
  numberToTime,
} from "./utilities/functionsUtility";
// import fakeTrackedWebsiteService from "./services/fakeTrackedWebsiteService";
// import fakeBlockedWebsiteService from "./services/fakeBlockedWebsiteService";

const appName = "Browser Watchman";
const isPopupLoading = ref<boolean>(true);
const trackedWebsites = ref<any>([]);
const blockedWebsites = ref<BlockedWebsite[]>([]);
// const blockedWebsiteFormBody = ref<any>({
//   blocked_websites: "",
// });
const blockedWebsiteFormBody = ref<any>({
  blocked_website: "",
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

const handleBlockWebsiteRemoveClick = (
  blockedWebsite: BlockedWebsite
): void => {
  blockedWebsites.value = blockedWebsites.value.filter(
    (bW) => bW.hostname != blockedWebsite.hostname
  );
  /* sync data */
};

const handleClick = () => {};

const handleSubmit = async () => {
  const urlObj = new URL(blockedWebsiteFormBody.value.blocked_website);
  const blockWebsiteHostname = getHostnameFromURLObj(urlObj);
  const response = await blockedWebsiteService.store(blockWebsiteHostname);
  if (response.data) {
    blockedWebsites.value.push({ hostname: response.data });
  }

  blockedWebsiteFormBody.value.blocked_website = "";
  chrome.runtime.sendMessage({ type: "onBlockedWebsitesUpdated" });
};

const setBlockedWebsites = async () => {
  const blockedWebsitesList =
    (await blockedWebsiteService.index()) as BlockedWebsite[];
  //   // blockedWebsites.value =
  //   //   (await fakeBlockedWebsiteService.data) as BlockedWebsite[];

  blockedWebsites.value = blockedWebsitesList;
  //   // console.log("blockedWebsites=");
  //   // console.log(blockedWebsites);

  //   // blockedWebsiteFormBody.value.blocked_websites =
  //   //   blockedWebsiteService.getBlockedWebsitesString(blockedWebsitesList);
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

      <Transition name="slide-up" mode="out-in">
        <div
          key="history-loader"
          class="d-flex justify-content-center align-items-center"
          v-if="isPopupLoading"
        >
          <div class="loader"></div>
        </div>

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
          <div class="d-flex flex-column gap-2 mb-3">
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
          <div class="d-flex flex-wrap gap-3">
            <!-- <span
                  class="badge badge-add-block-website rounded-pill text-bg-theme d-flex align-items-center justify-content-center gap-2"
                >
                  <div
                    class="btn-close-wrapper d-flex align-items-center justify-content-center rounded-circle p-1"
                  >
                    <img
                      src="./assets/icons/plus.svg"
                      class="img-add-block-website rounded-circle"
                      alt=""
                      srcset=""
                    />
                  </div>
                </span> -->

            <form class="d-flex gap-2" @submit.prevent="handleSubmit">
              <input
                type="url"
                class="form-control input-add-block-website"
                placeholder="Block website"
                v-model="blockedWebsiteFormBody.blocked_website"
              />
              <!-- <button class="btn btn-add-block-website" type="submit">
                    Submit
                  </button> -->
            </form>

            <span
              class="badge rounded-pill badge-block-website d-flex align-items-center justify-content-center gap-2"
              v-for="blockedWebsite in blockedWebsites"
              >{{ blockedWebsite.hostname }}
              <div class="btn-close-wrapper rounded-circle p-1">
                <button
                  type="button"
                  class="btn-close rounded-circle"
                  aria-label="Close"
                  @click="handleBlockWebsiteRemoveClick(blockedWebsite)"
                ></button>
              </div>
            </span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
