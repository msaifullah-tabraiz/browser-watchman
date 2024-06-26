import backgroundService from "./services/backgroundService";
import blockedWebsiteService from "./services/blockedWebsiteService";
import trackedWebsiteService from "./services/trackedWebsiteService";
import trackedWebsiteSessionService from "./services/trackedWebsiteSessionService";
import {
  getHostnameFromURLObj,
  redirectToBlockPage,
} from "./utilities/functionsUtility";

/* data */
let activeHostname = "";
let blockedWebsitesHostnames: any = [];
let trackedWebsites: any = null;

/* listeners */
chrome.runtime.onMessage.addListener(
  async (message: any, sender: any, sendResponse: Function) => {
    console.log(message.type, sender, sendResponse);

    if (message.type == "onBlockedWebsitesUpdated") {
      blockedWebsitesHostnames =
        await blockedWebsiteService.getBlockedWebsitesHostnames([], true);
      backgroundService.updateBlockedTabs(blockedWebsitesHostnames);
    }
  }
);

chrome.runtime.onInstalled.addListener((details: object) => {
  console.log("onInstalled");
  console.log(details);

  blockedWebsiteService.reset();
  trackedWebsiteService.reset();
});

chrome.tabs.onActivated.addListener((activeInfo: object) => {
  console.log("activated");
  console.log(activeInfo);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // check for a URL in the changeInfo parameter (url is only added when it is changed)
  if (changeInfo.status == "complete") {
    if (tab.url && tab.active) {
      // Create a new URL object
      const urlObj = new URL(tab.url);

      // Extract the hostname (e.g., "www.youtube.com")
      const hostname = getHostnameFromURLObj(urlObj);

      if (activeHostname == hostname) return;

      activeHostname = hostname;
      console.log("onUpdated");
      console.log(tabId, changeInfo, tab);

      console.log("Hostname: " + hostname);

      if (!trackedWebsites) {
        trackedWebsites = await trackedWebsiteService.index();
      }
      if (!blockedWebsitesHostnames)
        blockedWebsitesHostnames = await blockedWebsiteService.index();

      if (blockedWebsitesHostnames.includes(hostname)) {
        redirectToBlockPage(hostname, tab);
      }

      /* get active website if exist. */
      const activeTrackedWebsiteIndex = trackedWebsites.findIndex(
        (tW: any) => tW.is_active == true
      );

      /* check current website  */
      const currentTrackedWebsiteIndex = trackedWebsites.findIndex(
        (tW: any) => tW.hostname == hostname
      );

      /* first time */
      if (activeTrackedWebsiteIndex !== -1) {
        /* check whether current website and active website is different */
        if (currentTrackedWebsiteIndex != activeTrackedWebsiteIndex) {
          /* end activation & time entry in previous active website */
          trackedWebsiteSessionService.update(
            trackedWebsites,
            activeTrackedWebsiteIndex
          );
          if (currentTrackedWebsiteIndex !== -1) {
            /* add new time entry in current website */
            trackedWebsites[currentTrackedWebsiteIndex].timings.push({
              start_at: new Date(),
              end_at: null,
            });
          } else {
            /* add new website tracking entry */

            trackedWebsiteService.store(trackedWebsites, hostname, tab);
            console.log("tracked Websites =");
            console.log(trackedWebsites);

            // chrome.tabs.sendMessage(tabId, {
            //   hostname: hostname,
            //   tab_id: tabId,
            // });
          }
        } else {
          console.log(
            "currentTrackedWebsiteIndex == activeTrackedWebsiteIndex",
            currentTrackedWebsiteIndex,
            activeTrackedWebsiteIndex
          );
        }
      } else {
        trackedWebsiteService.store(trackedWebsites, hostname, tab);
        console.log("tracked Websites =");
        console.log(trackedWebsites);
      }

      const trackedWebsitesString = JSON.stringify(trackedWebsites);

      chrome.storage.sync.set(
        { tracked_websites: trackedWebsitesString },
        function () {
          console.log(trackedWebsitesString);
        }
      );
    }
  }
});

// tabId: number, removeInfo: object
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log("onRemoved");
  console.log(tabId, removeInfo);
});
