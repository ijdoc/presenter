chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "setZoomLevel") {
    // Get window tabs
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      // Only apply zoom if the window contains exactly 1 tab
      if (tabs.length === 1) {
        chrome.tabs.setZoom(tabs[0].id, request.zoomLevel);
      }
    });
  }
});
