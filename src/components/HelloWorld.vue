<script setup lang="ts">
import { onMounted, ref } from "vue";

defineProps<{ msg: string }>();

const count = ref(0);

const handleRefresh = () => {
  console.log("handleRefresh");
  const websiteTimings: any = [];
  chrome.storage.sync.get("tracked_websites", (items) => {
    if (items.tracked_websites) {
      const trackedWebsites = JSON.parse(items.tracked_websites);

      console.log(trackedWebsites);

      let totalTime = 0;

      trackedWebsites.forEach((trackedWebsite: any) => {
        let totalWebsiteTime = 0;
        trackedWebsite.timings.forEach((trackedWebsiteTiming: any) => {
          // console.log(
          //   trackedWebsiteTiming,
          //   trackedWebsiteTiming.start_at,
          //   trackedWebsiteTiming.end_at
          // );
          const endAtObject: any = trackedWebsiteTiming.end_at
            ? new Date(trackedWebsiteTiming.end_at)
            : new Date();
          const startAtObject: any = new Date(trackedWebsiteTiming.start_at);

          const differenceInMilliseconds: any = endAtObject - startAtObject;
          console.log(differenceInMilliseconds);
          totalWebsiteTime += differenceInMilliseconds;
        });
        websiteTimings.push({
          hostname: trackedWebsite.hostname,
          time: totalWebsiteTime,
        });
        totalTime += totalWebsiteTime;
      });
      websiteTimings.forEach((websiteTiming: any) => {
        websiteTiming.proportion = (websiteTiming.time / totalTime) * 100;
      });
    }

    console.log(websiteTimings);
  });
};

onMounted(() => {
  console.log("onMounted");
  handleRefresh();
});
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <div class="card">
    <button type="button" @click="handleRefresh">Refresh</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
