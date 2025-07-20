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

chrome.runtime.onMessage.addListener((message,sender)=>{
  if(message.type != 'LOGIN_GOOGLE') return;
  const sendError = (errMsg) => {
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'GOOGLE_TOKEN_ERROR',
      error: errMsg,
    });
  };
  const sendToken = (token) => {
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'GOOGLE_TOKEN',
      token,
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