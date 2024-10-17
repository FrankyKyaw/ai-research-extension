chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'summarize-selection',
    title: 'Summarize Selection',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarize-selection') {
    // Send a message to the content script with the selected text
    chrome.tabs.sendMessage(tab.id, {
      action: 'summarize',
      text: info.selectionText,
    });
  }
});