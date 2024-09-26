document.addEventListener("DOMContentLoaded", function () {
  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(`${tabName}Tab`).classList.add("active");
    });
  });

  // Theme switching
  const themeToggle = document.getElementById("themeToggle");

  // Load saved theme
  chrome.storage.sync.get("theme", function (data) {
    const savedTheme = data.theme || "light";
    themeToggle.checked = savedTheme === "dark";
    document.body.classList.toggle("dark-mode", savedTheme === "dark");
  });
  themeToggle.addEventListener("change", function () {
    const isDarkMode = themeToggle.checked;
    const newTheme = isDarkMode ? "dark" : "light";
    document.body.classList.toggle("dark-mode", isDarkMode);
    chrome.storage.sync.set({ theme: newTheme });

    // Send message to background script to update theme
    chrome.runtime.sendMessage({ action: "updateTheme", theme: newTheme });
  });

  // API Key Management
  const apiKeyInput = document.getElementById("apiKeyInput");
  const addApiKeyButton = document.getElementById("addApiKeyButton");
  const apiKeyList = document.getElementById("apiKeyList");

  function loadApiKeys() {
    chrome.storage.sync.get("apiKeys", function (data) {
      const apiKeys = data.apiKeys || [];
      updateApiKeyList(apiKeys);
    });
  }
  function updateApiKeyList(apiKeys) {
    apiKeyList.innerHTML = "";
    apiKeys.forEach((key, index) => {
      const item = document.createElement("div");
      item.className = "api-key-item";
      item.draggable = true;
      item.dataset.index = index;
      item.innerHTML = `
        <span class="drag-handle">&#9776;</span>
        <span>API Key ${index + 1}: ${key.substring(0, 5)}...</span>
        <button class="remove-key">Remove</button>
      `;
      item.querySelector(".remove-key").onclick = () => removeApiKey(index);
      item.addEventListener("dragstart", dragStart);
      item.addEventListener("dragover", dragOver);
      item.addEventListener("drop", drop);
      apiKeyList.appendChild(item);
    });
  }

  function addApiKey(key) {
    chrome.storage.sync.get("apiKeys", function (data) {
      const apiKeys = data.apiKeys || [];
      apiKeys.push(key);
      chrome.storage.sync.set({ apiKeys: apiKeys }, function () {
        updateApiKeyList(apiKeys);
        apiKeyInput.value = "";
      });
    });
  }

  function removeApiKey(index) {
    chrome.storage.sync.get("apiKeys", function (data) {
      const apiKeys = data.apiKeys || [];
      apiKeys.splice(index, 1);
      chrome.storage.sync.set({ apiKeys: apiKeys }, function () {
        updateApiKeyList(apiKeys);
      });
    });
  }

  function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.index);
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function drop(e) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const toIndex = Array.from(apiKeyList.children).indexOf(
      e.target.closest(".api-key-item"),
    );
    chrome.storage.sync.get("apiKeys", function (data) {
      const apiKeys = data.apiKeys || [];
      const [removed] = apiKeys.splice(fromIndex, 1);
      apiKeys.splice(toIndex, 0, removed);
      chrome.storage.sync.set({ apiKeys: apiKeys }, function () {
        updateApiKeyList(apiKeys);
      });
    });
  }

  addApiKeyButton.addEventListener("click", function () {
    const key = apiKeyInput.value.trim();
    if (key) {
      addApiKey(key);
    }
  });

  loadApiKeys();

  const translateButton = document.getElementById("translateButton");
  const languageSelect = document.getElementById("targetLanguage");
  const inputText = document.getElementById("inputText");
  const statusMessage = document.getElementById("statusMessage");
  const translationResult = document.getElementById("translationResult");

  // Hide translation result wrapper and copy button initially
  const translationResultWrapper = document.querySelector(
    ".translation-result-wrapper",
  );
  const copyButtonContainer = document.querySelector(".copy-button-container");
  if (translationResultWrapper && copyButtonContainer) {
    translationResultWrapper.style.display = "none";
    copyButtonContainer.style.display = "none";
  }

  // Copy translation to clipboard
  const copyButton = document.getElementById("copyButton");
  copyButton.addEventListener("click", function () {
    const textToCopy = translationResult.textContent;
    navigator.clipboard.writeText(textToCopy).then(
      function () {
        updateStatus("Copied to clipboard!", "#4caf50");
        copyButton.setAttribute("data-tooltip", "Copied to clipboard!");
        setTimeout(() => {
          updateStatus("", "");
          copyButton.setAttribute("data-tooltip", "Copy to clipboard");
        }, 2000);
      },
      function (err) {
        console.error("Could not copy text: ", err);
        updateStatus("Failed to copy. Please try again.", "#f44336");
      },
    );
  });

  const DEFAULT_LANGUAGE = "vi";

  function updateStatus(message, color) {
    if (statusMessage) {
      statusMessage.textContent = message;
      statusMessage.style.color = color;
    } else {
      console.error("Status message element not found");
    }
  }

  function updateTranslation(text) {
    const wrapper = document.querySelector(".translation-result-wrapper");
    const copyButton = document.querySelector(".copy-button-container");
    if (translationResult && wrapper && copyButton) {
      translationResult.textContent = text;
      wrapper.style.display = text ? "block" : "none";
      copyButton.style.display = text ? "block" : "none";
    } else {
      console.error("Translation result elements not found");
    }
  }

  function clearTranslation() {
    const wrapper = document.querySelector(".translation-result-wrapper");
    const copyButton = document.querySelector(".copy-button-container");
    if (translationResult && wrapper && copyButton) {
      translationResult.textContent = "";
      wrapper.style.display = "none";
      copyButton.style.display = "none";
    }
  }

  function setButtonState(isEnabled) {
    if (translateButton) {
      translateButton.disabled = !isEnabled;
    }
  }

  // Load saved settings
  chrome.storage.sync.get("targetLanguage", function (data) {
    if (chrome.runtime.lastError) {
      console.error("Error loading settings:", chrome.runtime.lastError);
      updateStatus("Error loading settings. Please try again.", "red");
      return;
    }
    const savedLanguage = data.targetLanguage || DEFAULT_LANGUAGE;
    if (languageSelect) {
      languageSelect.value = savedLanguage;
    }
    console.log("Loaded target language:", savedLanguage);
  });

  if (languageSelect) {
    languageSelect.addEventListener("change", function () {
      const targetLanguage = languageSelect.value;
      console.log("Changing target language to:", targetLanguage);
      chrome.storage.sync.set({ targetLanguage: targetLanguage }, function () {
        if (chrome.runtime.lastError) {
          console.error("Error saving settings:", chrome.runtime.lastError);
          updateStatus("Error saving settings. Please try again.", "red");
        } else {
          console.log("Settings saved. New target language:", targetLanguage);
          updateStatus("Language updated successfully!", "green");
          setTimeout(() => updateStatus("", ""), 2000);
        }
      });
    });
  }
  if (translateButton && inputText) {
    translateButton.addEventListener("click", function () {
      const textToTranslate = inputText.value.trim();
      const targetLanguage = languageSelect.value || DEFAULT_LANGUAGE;
      console.log("Translating to:", targetLanguage);
      if (textToTranslate) {
        clearTranslation();
        updateStatus("Translating...", "#4285f4");
        setButtonState(false);
        chrome.runtime.sendMessage(
          {
            action: "translateText",
            text: textToTranslate,
            targetLanguage: targetLanguage,
          },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError);
              updateStatus(
                "Error translating text. Please try again.",
                "#f44336",
              );
            } else {
              updateStatus("Translation complete!", "#4caf50");
              updateTranslation(response.translation);
              console.log("Translated to:", response.targetLanguage);
            }
            setButtonState(true);
          },
        );
      } else {
        updateStatus("Please enter text to translate.", "#f44336");
        clearTranslation();
      }
    });
  }
});
