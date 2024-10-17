chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "summarizeSelection" && message.from === "sidepanel") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "summarizeSelection", tabId: tabs[0].id },
        sendResponse
      );
    });
    return true;
  }
});

// const welcomePage = "sidepanel/welcome.htlm";
// const mainPage = "sidepanel/index.html";

// Set the side panel to welcome page when the extension is installed
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.sidePanel.setOptions({
//     path: welcomePage,
//   })
// })

// Set the side panel to be enabled when the user is on a wikipedia page
// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   if (!tab.url) return;
//   const url = new URL(tab.url);
//   if (url.hostname.includes("wikipedia.org")) {
//     await chrome.sidePanel.setOptions({
//       tabId,
//       path: "sidepanel/index.html",
//       enabled: true,
//     });
//   } else {
//     await chrome.sidePanel.setOptions({
//       tabId,
//       enabled: false,
//     });
//   }
// });
