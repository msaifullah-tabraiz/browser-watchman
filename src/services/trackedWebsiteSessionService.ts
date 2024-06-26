const update = (trackedWebsites: any, activeTrackedWebsiteIndex: number) => {
  const activeTrackedWebsiteCurrentTimingIndex = trackedWebsites[
    activeTrackedWebsiteIndex
  ].timings.findIndex((t: any) => t.end_at == null);

  trackedWebsites[activeTrackedWebsiteIndex].is_active = false;
  trackedWebsites[activeTrackedWebsiteIndex].timings[
    activeTrackedWebsiteCurrentTimingIndex
  ].end_at = new Date();
};

export default {
  update,
};
