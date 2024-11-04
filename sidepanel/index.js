document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.runtime.sendMessage(
      { action: "getPdfSections", tabId },
      async (response) => {
        if (response.success) {
          const sections = response.sections;

          // // Optionally, generate summaries for each section
          // const summaries = await summarizeSections(sections);

          // Display the summaries
          displaySectionList(headings);
        } else {
          console.error(response.error);
        }
      }
    );
  });
});

function displaySectionList(headings) {
  const headingsDiv = document.getElementById("headings");

  headingsDiv.innerHTML =
    "<ul>" +
    headings.map((heading) => `<li>${heading}</li>`).join("") +
    "</ul>";
}

document.getElementById("summarizeBtn").addEventListener("click", () => {
  displayLoading();
  chrome.runtime.sendMessage(
    { from: "sidepanel", action: "summarizeSelection" },
    (response) => {
      if (response && response.result) {
        displaySummary(response.result);
      } else if (response && response.error) {
        displayError(response.error);
      } else {
        displayError("An error occurred while summarizing.");
      }
      clearLoading();
    }
  );
});

function displayLoading() {
  const loadingElement = document.getElementById("loading");
  loadingElement.textContent = "Loading...";
}

function clearLoading() {
  const loadingElement = document.getElementById("loading");
  loadingElement.textContent = "";
}

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
