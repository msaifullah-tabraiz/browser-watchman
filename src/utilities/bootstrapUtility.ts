import { Tab, Tooltip } from "bootstrap";

let tooltipList: Tooltip[] = [];

export const initTab = () => {
  const triggerTabList = document.querySelectorAll(".nav-underline a");
  console.log(triggerTabList);

  triggerTabList.forEach((triggerEl) => {
    const tabTrigger = new Tab(triggerEl);

    triggerEl.addEventListener("click", (event) => {
      event.preventDefault();
      tabTrigger.show();
    });
  });
};
export const initTooltip = async () => {
  tooltipList = [];
  setTimeout(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    console.log(tooltipTriggerList);

    for (let index = 0; index < tooltipTriggerList.length; index++) {
      const element = tooltipTriggerList[index];
      const tooltipInstance = new Tooltip(element);
      tooltipList.push(tooltipInstance);
    }
  }, 1000);
};

export const hideTooltip = async () => {
  tooltipList.forEach((tooltipInstance) => {
    tooltipInstance.hide();
  });
};

export default {
  initTab,
  initTooltip,
};
