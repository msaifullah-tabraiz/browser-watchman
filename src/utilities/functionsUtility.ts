export const getFaviconUrl = (tab: chrome.tabs.Tab) => {
  let faviconUrl;
  if (tab.favIconUrl) faviconUrl = tab.favIconUrl;
  else {
    faviconUrl = "/assets/default-favicon.png";
  }
  return faviconUrl;
};

export const getHostnameFromURLObj = (urlObj: URL) => {
  let hostname = urlObj.hostname;
  if (hostname.startsWith("www.")) {
    hostname = hostname.substring(4); // Remove the 'www.' prefix
  }
  return hostname;
};

export const numberToTime = (value: number) => {
  const valueInSeconds = value / 1000;

  let formattedTime;
  if (valueInSeconds < 60) {
    formattedTime = `${Math.round(valueInSeconds)}s`;
  } else if (valueInSeconds < 3600) {
    const minutesCount = Math.floor(valueInSeconds / 60);
    const secondsCount = Math.round(valueInSeconds % 60);
    formattedTime = `${minutesCount}m ${secondsCount}s`;
  } else if (valueInSeconds < 86400) {
    const hoursCount = Math.floor(valueInSeconds / 3600);
    const minutesCount = Math.floor((valueInSeconds % 3600) / 60);
    const secondsCount = Math.round(valueInSeconds % 60);
    formattedTime = `${hoursCount}h ${minutesCount}m ${secondsCount}s`;
  }
  return formattedTime;
};

export const redirectToBlockPage = (hostname: string, tab: chrome.tabs.Tab) => {
  console.log(tab.url);
  console.log(getFaviconUrl(tab));
  console.log(hostname);

  const faviconUrl = getFaviconUrl(tab);

  let blockPageUrl = chrome.runtime.getURL("block.html");
  blockPageUrl += `?url=${tab.url}&hostname=${hostname}&favicon=${faviconUrl}`;

  if (tab.id !== undefined) {
    chrome.tabs.update(tab.id, {
      url: blockPageUrl,
    });
  }
};
