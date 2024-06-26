import { getFaviconUrl } from "../utilities/functionsUtility";

const index = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get("tracked_websites", (items) => {
      const trackedWebsites = items.tracked_websites
        ? JSON.parse(items.tracked_websites)
        : [];
      resolve(trackedWebsites);
    });
  });
};

const store = async (
  trackedWebsites: any,
  hostname: string,
  tab: chrome.tabs.Tab
) => {
  const faviconUrl = getFaviconUrl(tab);

  const row = {
    hostname: hostname,
    favicon: faviconUrl,
    is_active: tab.active,
    is_blocked: false,
    timings: [
      {
        start_at: new Date(),
        end_at: null,
      },
    ],
  };

  trackedWebsites.push(row);
  return trackedWebsites;
};

const update = (trackedWebsites: any, trackedWebsite: any) => {
  const index = trackedWebsites.findIndex(
    (tW: any) => tW.hostname == trackedWebsite.hostname
  );
  trackedWebsites[index].is_blocked = true;

  const trackedWebsitesString = JSON.stringify(trackedWebsites);

  chrome.storage.sync.set(
    { tracked_websites: trackedWebsitesString },
    function () {
      console.log(trackedWebsitesString);
    }
  );
};

const reset = () => {
  chrome.storage.sync.set({ tracked_websites: null }, function () {});
};

export default {
  index,
  store,
  update,
  reset,
};
