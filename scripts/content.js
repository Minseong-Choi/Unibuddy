window.addEventListener("message", (event) =>{
    if(event.data?.type === "CLOSE_SIDEBAR"){
        const SIDEBAR_ID = "unibuddy-sidebar";
        const WRAPPER_ID = "unibuddy-wrapper";
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
            return;
          }
    }
})
// scripts/content.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== "TOGGLE_SIDEBAR") return;
  
    const SIDEBAR_ID = "unibuddy-sidebar";
    const WRAPPER_ID = "unibuddy-wrapper";
    const SIDEBAR_WIDTH = "20%";
    const CONTENT_WIDTH = `calc(100% - ${SIDEBAR_WIDTH})`;
  
    const existingSidebar = document.getElementById(SIDEBAR_ID);
    const existingWrapper = document.getElementById(WRAPPER_ID);
  
    if (existingSidebar) {
      // ──────────────── 사이드바 닫기 ────────────────
      existingSidebar.remove();
  
      // wrapper 복원
      if (existingWrapper) {
        while (existingWrapper.firstChild) {
          document.body.appendChild(existingWrapper.firstChild);
        }
        existingWrapper.remove();
      }
      return;
    }
  
    // ──────────────── 사이드바 열기 ────────────────
  
    // 1) wrapper가 없으면 생성해서 body 콘텐츠를 감싼다
    let wrapper = existingWrapper;
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
      // body의 기존 모든 노드를 wrapper 안으로 이동
      while (document.body.firstChild) {
        wrapper.appendChild(document.body.firstChild);
      }
      document.body.appendChild(wrapper);
    } else {
      // 이미 wrapper가 있다면 width만 재설정
      wrapper.style.width = CONTENT_WIDTH;
    }
  
    // 2) 사이드바 iframe 생성
    const iframe = document.createElement("iframe");
    iframe.id = SIDEBAR_ID;
    iframe.src = chrome.runtime.getURL("client/build/index.html");
    Object.assign(iframe.style, {
      position:        "fixed",
      top:             "0",
      right:           "0",
      width:           SIDEBAR_WIDTH,
      height:          "100%",
      border:          "none",
      zIndex:          2147483647,
      backgroundColor: "white",
    });
    document.body.appendChild(iframe);
  });
  