chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ currentProject: null });
});

const sendToken = (token) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GOOGLE_TOKEN', token });
    }
  });
};

// chrome.action.onClicked.addListener((tab) => {
//   chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" });
// });

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get("sidebarOpen", (data) => {
    const sidebarOpen = !data.sidebarOpen;
    chrome.storage.local.set({ sidebarOpen });
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR", open: sidebarOpen });
  });
});

chrome.runtime.onMessage.addListener((message,sender)=>{
  if(message.type != 'LOGIN_GOOGLE') return;
  const sendError = (errMsg) => {
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'GOOGLE_TOKEN_ERROR',
      error: errMsg,
    });
  };

  chrome.identity.getAuthToken({ interactive: false }, (token) => {
    if (chrome.runtime.lastError || !token) {
      // 2) 실패 시 동의창 팝업
      chrome.identity.getAuthToken({ interactive: true }, (token2) => {
        if (chrome.runtime.lastError || !token2) {
          sendError(chrome.runtime.lastError?.message || 'User cancelled login');
        } else {
          sendToken(token2);
        }
      });
    } else {
      sendToken(token);
    }
  });
});