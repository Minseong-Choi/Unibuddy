const SIDEBAR_ID = "unibuddy-sidebar";
const WRAPPER_ID = "unibuddy-wrapper";
const SIDEBAR_WIDTH = "20%";
const CONTENT_WIDTH = `calc(100% - ${SIDEBAR_WIDTH})`;

const createSidebar = () => {
  const existingSidebar = document.getElementById(SIDEBAR_ID);
  if (existingSidebar) return;

  let wrapper = document.getElementById(WRAPPER_ID);
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = WRAPPER_ID;
    Object.assign(wrapper.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: CONTENT_WIDTH,
      height: "100%",
      overflowY: "auto",
      boxSizing: "border-box",
    });
    while (document.body.firstChild) {
      wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);
  } else {
    wrapper.style.width = CONTENT_WIDTH;
  }

  const iframe = document.createElement("iframe");
  iframe.id = SIDEBAR_ID;
  iframe.src = chrome.runtime.getURL("client/build/index.html");
  Object.assign(iframe.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: SIDEBAR_WIDTH,
    height: "100%",
    border: "none",
    zIndex: 2147483647,
    backgroundColor: "white",
  });
  document.body.appendChild(iframe);
};

const removeSidebar = () => {
  const existingSidebar = document.getElementById(SIDEBAR_ID);
  const existingWrapper = document.getElementById(WRAPPER_ID);
  if (existingSidebar) {
    existingSidebar.remove();
    if (existingWrapper) {
      while (existingWrapper.firstChild) {
        document.body.appendChild(existingWrapper.firstChild);
      }
      existingWrapper.remove();
    }
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_SIDEBAR") {
    if (message.open) {
      createSidebar();
    } else {
      removeSidebar();
    }
  }
});

window.addEventListener("message", (event) => {
  if (event.data?.type === "CLOSE_SIDEBAR") {
    chrome.storage.local.set({ sidebarOpen: false });
    removeSidebar();
  }
});

chrome.storage.local.get("sidebarOpen", (data) => {
  if (data.sidebarOpen) {
    createSidebar();
  }
});