chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if(changeInfo.status === "complete" && /^https?:/.test(tab.url)){
    chrome.scripting.executeScript({
      target: {tabId},
      files: ["scripts/content.js"]
    });
  }
});


chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" });
});