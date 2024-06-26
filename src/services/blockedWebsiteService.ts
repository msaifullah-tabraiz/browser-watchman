interface BlockedWebsite {
  hostname: string;
}

const index = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get("blocked_websites", (items) => {
      const blockedWebsites = items.blocked_websites
        ? JSON.parse(items.blocked_websites)
        : [];
      resolve(blockedWebsites);
    });
  });
};

const store = async (formBody: any) => {
  // blockedWebsite: BlockedWebsite;
  const blockedWebsites: any = await index();
  console.log("blockedWebsite = ");
  console.log(blockedWebsites);
  const blockedWebsitesHostnames = await getBlockedWebsitesHostnames(
    blockedWebsites
  );
  console.log("blockedWebsitesHostnames = ", blockedWebsitesHostnames);

  const blockedWebsiteInputArray = formBody.blocked_websites.split("\n");
  console.log("blockedWebsiteInputArray = ", blockedWebsiteInputArray);

  blockedWebsiteInputArray.forEach((blockedWebsiteInput: any) => {
    console.log();

    if (!blockedWebsitesHostnames.includes(blockedWebsiteInput)) {
      console.log("blockedWebsiteInput = ", blockedWebsiteInput);

      blockedWebsites.push({
        hostname: blockedWebsiteInput,
      });
    }
  });

  const blockedWebsitesString = JSON.stringify(blockedWebsites);
  chrome.storage.sync.set({ blocked_websites: blockedWebsitesString });
};

const reset = () => {
  chrome.storage.sync.set({ blocked_websites: null }, function () {});
};

const getBlockedWebsitesHostnames: any = async (
  blockedWebsites: BlockedWebsite[],
  shouldFetch: boolean = false
) => {
  console.log("blockedWebsites", blockedWebsites);

  let data: any = blockedWebsites;
  if (shouldFetch) {
    console.log("data = ");
    console.log(blockedWebsites);
    data = await index();
  }

  console.log("data ==", data);

  const ar = [];
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    console.log("element =", element);
    ar.push(element.hostname);
  }
  console.log("ar", ar);

  return ar;
};

const getBlockedWebsitesString = (
  blockedWebsites: BlockedWebsite[]
): string => {
  let str = "";
  blockedWebsites.forEach((blockedWebsite) => {
    str += `${blockedWebsite.hostname}\n`;
  });
  console.log("str = " + str);

  str = str.substring(0, str.length - 1);

  console.log(str);

  return str;
};

export default {
  index,
  store,
  reset,
  getBlockedWebsitesHostnames,
  getBlockedWebsitesString,
};

export type { BlockedWebsite };
