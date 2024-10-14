document.addEventListener('DOMContentLoaded', () => {
    const highlightsContainer = document.getElementById('highlights');
    const clearButton = document.getElementById('clear');
  
    // Load saved highlights from storage
    chrome.storage.local.get({ highlights: [] }, (result) => {
      const highlights = result.highlights;
      if (highlights.length === 0) {
        highlightsContainer.innerHTML = '<p>No highlights saved.</p>';
      } else {
        highlights.forEach((item, index) => {
          const highlightDiv = document.createElement('div');
          highlightDiv.className = 'highlight';
  
          const textPara = document.createElement('p');
          textPara.textContent = item.text;
  
          const link = document.createElement('a');
          link.href = item.url;
          link.textContent = 'Go to page';
          link.target = '_blank';
  
          highlightDiv.appendChild(textPara);
          highlightDiv.appendChild(link);
          highlightsContainer.appendChild(highlightDiv);
        });
      }
    });
  
    // Clear all saved highlights
    clearButton.addEventListener('click', () => {
      chrome.storage.local.set({ highlights: [] }, () => {
        highlightsContainer.innerHTML = '<p>No highlights saved.</p>';
      });
    });
  });
  