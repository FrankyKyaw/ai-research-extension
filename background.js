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

let pdfTextCache = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchPdf") {
    try {
      (async () => {
        const response = await fetch(message.url);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        console.log("PDF fetched successfully:", {
          size: arrayBuffer.byteLength,
          url: message.url,
        });
        sendResponse({ success: true, data: Array.from(uint8Array) });
    })();
    } catch (error) {
      console.error("Error fetching PDF:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Indicates that sendResponse will be called asynchronously
  } else if (message.action === "pdfTextExtracted") {
    pdfTextCache[sender.tab.id] = message.text;
    console.log(message.text);
  } else if (message.action === "getPdfText") {
    const text = pdfTextCache[sender.tab.id];
    if (text) {
      sendResponse({ success: true, text });
    } else {
      sendResponse({ success: false, error: "PDF text not available." });
    }
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
