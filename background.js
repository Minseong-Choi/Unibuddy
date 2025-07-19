chrome.action.onClicked.addListener(async(tab) => {
    try{
        chrome.tabs.sendMessage(tab.id, {type: "TOGGLE_SIDEBAR"});
    }catch(e){
        console.error("Error executing script:", e);
    }
})