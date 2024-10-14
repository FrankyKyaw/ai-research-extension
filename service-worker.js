console.log("This is a popup!")

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "summarize",
        title: "Summarize",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarize") {
        const selectedText = info.selectionText.trim();
        if (selectedText) {
            chrome.storage.local.get({ highlights: [] }, (result) => {
                const highlights = result.highlights;
                highlights.push({ text: selectedText, url: info.pageUrl });
                chrome.storage.local.set({ highlights });
              });
            }
        }
    }
);


