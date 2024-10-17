console.log('Content script loaded');

// Inject pageScript.js into the page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('pageScript.js');
(document.head || document.documentElement).appendChild(script);
script.onload = function () {
  this.remove();
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarizeSelection') {
    console.log('Content script received message:', request.action);
    const selection = window.getSelection().toString();
    if (selection) {
      window.postMessage({ type: 'AI_SUMMARIZE', text: selection }, '*');
      window.addEventListener('message', function handler(event) {
        if (event.source !== window) {
          return;
        }
        if (event.data.type === "AI_SUMMARIZE_RESULT") {
          sendResponse({ result: event.data.result });
          window.removeEventListener('message', handler);
        } else if (event.data.type === "AI_SUMMARIZE_ERROR") {
          sendResponse({ error: event.data.error });
          window.removeEventListener('message', handler);
        }
      });
      return true;
    } else {
      sendResponse({ error: 'No text selected' });
    }
  }
});

window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && event.data.type === 'AI_SUMMARIZE_RESULT') {
    const result = event.data.result;
    console.log('Summary:', result);
    // Optionally, you can display the result in the page
  }

  if (event.data.type && event.data.type === 'AI_SUMMARIZE_ERROR') {
    const error = event.data.error;
    console.error('Error:', error);
  }
  console.log('finally case');
});