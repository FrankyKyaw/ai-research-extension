console.log("Content script loaded");

// Inject pageScript.js into the page context
const script = document.createElement("script");
script.src = chrome.runtime.getURL("pageScript.js");
(document.head || document.documentElement).appendChild(script);
script.onload = function () {
  this.remove();
};

function getOriginalPdfUrl() {
  const embedElement = document.querySelector("embed#pdf-embed");
  if (embedElement) {
    const originalUrl = embedElement.getAttribute("original-url");
    return originalUrl;
  }
  return null;
}

function isResearchPaper() {
  const url = window.location.href;
  const researchPaperUrlPatterns = [/arxiv\.org\/(?:pdf|html)\//];

  return researchPaperUrlPatterns.some((pattern) => pattern.test(url));
}

(async function () {
  if (isResearchPaper()) {
    console.log("this is a research paper");
    chrome.runtime.sendMessage({ action: "researchPaperDetected" });

    const currentUrl = window.location.href;
    console.log(currentUrl);
    try {
      chrome.runtime.sendMessage(
        { action: "fetchPdf", url: currentUrl },
        async (response) => {
          if (response.success) {
            const pdfData = response.data;
            await extractTextFromPdf(pdfData);
          } else {
            console.error("Error fetching PDF:", response.error);
          }
        }
      );
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  }
})();

async function extractTextFromPdf(pdfData) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
      "lib/pdfjs/pdf.min.worker.js"
    );

    const uint8Array = new Uint8Array(pdfData);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let textContent = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const text = await page.getTextContent();
      const pageText = text.items.map((item) => item.str).join(" ");
      textContent += pageText + "\n\n";
    }

    chrome.runtime.sendMessage({
      action: "pdfTextExtracted",
      text: textContent,
    });
    return textContent;
  } catch (error) {
    console.error("Error extracting PDF text: ", error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeSelection") {
    console.log("Content script received message:", request.action);
    const selection = window.getSelection().toString();
    if (selection) {
      window.postMessage({ type: "AI_SUMMARIZE", text: selection }, "*");
      window.addEventListener("message", function handler(event) {
        if (event.source !== window) {
          return;
        }
        if (event.data.type === "AI_SUMMARIZE_RESULT") {
          sendResponse({ result: event.data.result });
          window.removeEventListener("message", handler);
        } else if (event.data.type === "AI_SUMMARIZE_ERROR") {
          sendResponse({ error: event.data.error });
          window.removeEventListener("message", handler);
        }
      });
      return true;
    } else {
      sendResponse({ error: "No text selected" });
    }
  }
});

window.addEventListener("message", (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && event.data.type === "AI_SUMMARIZE_RESULT") {
    const result = event.data.result;
    console.log("Summary:", result);
    // Optionally, you can display the result in the page
  }

  if (event.data.type && event.data.type === "AI_SUMMARIZE_ERROR") {
    const error = event.data.error;
    console.error("Error:", error);
  }
  console.log("finally case");
});
