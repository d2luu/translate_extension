let tooltip = null;
let loadingIndicator = null;
let translationInProgress = false;

function createTooltip() {
  tooltip = document.createElement("div");
  tooltip.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        display: none;
        max-width: 300px;
        overflow-wrap: break-word;
    `;
  document.body.appendChild(tooltip);

  loadingIndicator = document.createElement("div");
  loadingIndicator.textContent = "Translating...";
  loadingIndicator.style.cssText = `
        color: #666;
        font-style: italic;
    `;
  tooltip.appendChild(loadingIndicator);
}

function adjustTooltipWidth() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width > 300) {
      tooltip.style.width = `${rect.width}px`;
      tooltip.style.maxWidth = "none";
    } else {
      tooltip.style.width = "auto";
      tooltip.style.maxWidth = "300px";
    }
  }
}

function showTooltip(x, y) {
  if (tooltip) {
    adjustTooltipWidth();
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.display = "block";
  }
}

function hideTooltip() {
  if (tooltip) {
    tooltip.style.display = "none";
  }
  translationInProgress = false;
}

function updateTooltipContent(text) {
  if (loadingIndicator && tooltip) {
    loadingIndicator.style.display = "none";
    tooltip.innerHTML = text.replace(/\n/g, "<br>");
  }
}

function showLoadingIndicator() {
  if (!tooltip) createTooltip();
  if (loadingIndicator) {
    loadingIndicator.style.display = "block";
    tooltip.innerHTML = ""; // Clear previous content
    tooltip.appendChild(loadingIndicator);
  }
}

function updateTranslation(text) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!tooltip) createTooltip();
    showTooltip(rect.left + window.scrollX, rect.bottom + window.scrollY);
    updateTooltipContent(text);
  }
  translationInProgress = false;
}

function translateSelectedText() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0 && !translationInProgress) {
    translationInProgress = true;
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!tooltip) createTooltip();
    showTooltip(rect.left + window.scrollX, rect.bottom + window.scrollY);
    showLoadingIndicator();
    chrome.storage.sync.get("targetLanguage", function (data) {
      const targetLanguage = data.targetLanguage || "vi"; // Default to Vietnamese if not set
      chrome.runtime.sendMessage(
        {
          action: "translateText",
          text: selectedText,
          targetLanguage: targetLanguage,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError);
            hideTooltip();
            translationInProgress = false;
            return;
          }
          if (response && response.translation) {
            updateTranslation(response.translation);
          }
        },
      );
    });
  }
}

function checkSelection() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length === 0) {
    hideTooltip();
    translationInProgress = false; // Reset the translation state
  }
}

function initializeContentScript() {
  document.addEventListener("selectionchange", checkSelection);

  document.addEventListener("mouseup", function (event) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      if (selectedText.split(/\s+/).length === 1) {
        // Immediately translate single words
        translateSelectedText();
      } else {
        // For multiple words, show "Press 'T' to translate" message
        if (!tooltip) createTooltip();
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        showTooltip(rect.left + window.scrollX, rect.bottom + window.scrollY);
        updateTooltipContent("Press 'T' or 'Shift' to translate");
      }
    } else {
      hideTooltip();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (
      (event.key === "T" || event.key === "t" || event.key === "Shift") &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText.length > 0) {
        translateSelectedText();
        event.preventDefault();
      }
    }
  });

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError);
        return;
      }
      if (request.action === "showTranslation") {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 0) {
          updateTranslation(request.translation);
        } else {
          hideTooltip();
        }
      }
    },
  );

  document.addEventListener("mousedown", function (event) {
    if (tooltip && !tooltip.contains(event.target)) {
      hideTooltip();
    }
  });
}

function checkExtensionStatus() {
  if (chrome.runtime && chrome.runtime.id) {
    initializeContentScript();
  } else {
    console.log("Extension context invalidated. Reloading page...");
    window.location.reload();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkExtensionStatus);
} else {
  checkExtensionStatus();
}
