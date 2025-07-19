window.addEventListener("message", (event) =>{
    if(event.data?.type === "CLOSE_SIDEBAR"){
        const existing = document.getElementById("unibuddy-sidebar");
        if(existing){
            existing.remove();
            document.body.style.marginRight = "0px";
        }
    }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type == "TOGGLE_SIDEBAR"){
        const existing = document.getElementById("unibuddy-sidebar");

        if(existing){
            existing.remove();
            document.body.style.marginRight = "0px";
        }else{
            const iframe = document.createElement("iframe");
            iframe.src = chrome.runtime.getURL("client/build/index.html");
            iframe.id = "unibuddy-sidebar";
            iframe.style.position = "fixed";
            iframe.style.top = "0";
            iframe.style.right = "0";
            iframe.style.width = "400px";
            iframe.style.height = "100vh";
            iframe.style.border = "none";
            iframe.style.zIndex = "2147483647";
            iframe.style.backgroundColor = "white";

            document.body.appendChild(iframe);
            document.body.style.marginRight = "400px";
        }
    }
})