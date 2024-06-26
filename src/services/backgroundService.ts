import {
  getHostnameFromURLObj,
  redirectToBlockPage,
} from "../utilities/functionsUtility";

const updateBlockedTabs = (blockedWebsitesHostnames: Array<string>) => {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.url && tab.id) {
        const urlObj = new URL(tab.url);
        const hostname = getHostnameFromURLObj(urlObj);
        if (blockedWebsitesHostnames.includes(hostname)) {
          redirectToBlockPage(hostname, tab);
        }
      }
    });
  });
};

export default {
  updateBlockedTabs,
};
