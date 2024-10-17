console.log('Content script loaded');

// Inject pageScript.js into the page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('pageScript.js');
(document.head || document.documentElement).appendChild(script);
script.onload = function () {
  this.remove();
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    console.log('Content script received message:', request.action);

    // Forward the request to the page script
    window.postMessage(
      {
        type: 'AI_SUMMARIZE',
        text: request.text,
      },
      '*'
    );
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