chrome.action.onClicked.addListener(async (tab) => {
    try {
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" }, async () => {
        if (chrome.runtime.lastError) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });

          chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" });
        }
      });
    } catch (e) {
      console.error("Error executing content script:", e);
    }
  });