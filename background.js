importScripts("lib/pdfjs/pdf.min.js");

pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
  "lib/pdfjs/pdf.worker.min.js"
);

let pdfSectionsCache = {};
let pdfProcessingStatus = {};

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getPdfSections") {
    const status = pdfProcessingStatus[message.tabId];
    const sections = pdfSectionsCache[message.tabId];
    if (status === 'processing') {
      sendResponse({ success: false, error: "PDF is still being processed." });
    } else if (status === 'complete' && sections) {
      sendResponse({ success: true, sections });
    } else if (status === 'error') {
      sendResponse({ success: false, error: "Error processing PDF." });
    } else {
      // If no processing has started yet, start it
      const tab = { id: message.tabId, url: message.url };
      processPdfInTab(tab);
      sendResponse({ success: false, error: "Started PDF processing." });
    }
    return true;
}});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.endsWith(".pdf") || tab.url.includes(".pdf?")) {
    // The current tab is a PDF
    console.log("PDF detected in tab:", tab.id);
    await processPdfInTab(tab);
  } else {
    console.log("Not a PDF tab.");
  }
});

async function processPdfInTab(tab) {
  try {
    const response = await fetch(tab.url);
    const arrayBuffer = await response.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);

    const sections = await extractSectionsFromPdfData(pdfData);

    pdfSectionsCache[tab.id] = sections;
  } catch (error) {
    console.log("Error processing pdf", error);
  }
}

async function extractSectionsFromPdfData(pdfData) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;

    let textItems = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      textContent.items.forEach((item) => {
        textItems.push({
          str: item.str,
          height: item.height,
          dir: item.dir,
          fontName: item.fontName,
          hasEOL: item.hasEOL,
          transform: item.transform,
          width: item.width,
        });
      });
    }

    console.log("Before identifying headings");
    const headings = identifyHeadings(textItems);

    console.log(headings);
    console.log("after headings");
    return headings;
  } catch (error) {
    console.error("Error extracting sections from PDF data:", error);
    throw error;
  }
}

function identifyHeadings(textItems) {
  const headingThreshold = 10;
  let headings = [];
  let isFirstLargeText = true;

  textItems.forEach((item, index) => {
    if (item.height >= headingThreshold && item.str.trim().length > 0) {
      if (isFirstLargeText) {
        isFirstLargeText = false;
        return;
      }
      headings.push({ text: item.str.trim() });
    }
  });
  return headings;
}

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
    return true;
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
