document.getElementById("summarizeBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage(
    { from: "sidepanel", action: "summarizeSelection" },
    (response) => {
      if (response && response.result) {
        displaySummary(response.result);
      } else if (response.error) {
        displayError(response.error);
      } else {
        displayError("An error occurred while summarizing.");
      }
    }
  );
});

function displaySummary(summary) {
  const summaryElement = document.getElementById("summary");
  summaryElement.textContent = summary;
  document.getElementById("error").textContent = "";
}

function displayError(message) {
  const errorElement = document.getElementById("error");
  errorElement.textContent = message;
  document.getElementById("summary").textContent = "";
}
