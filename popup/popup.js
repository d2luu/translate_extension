document.addEventListener("DOMContentLoaded", function () {
  const translateButton = document.getElementById("translateButton");
  const languageSelect = document.getElementById("targetLanguage");
  const inputText = document.getElementById("inputText");
  const statusMessage = document.getElementById("statusMessage");
  const translationResult = document.getElementById("translationResult");

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
    if (translationResult) {
      translationResult.textContent = text;
    } else {
      console.error("Translation result element not found");
    }
  }

  function clearTranslation() {
    if (translationResult) {
      translationResult.textContent = "";
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
        updateStatus("Translating...", "blue");
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
              updateStatus("Error translating text. Please try again.", "red");
            } else {
              updateStatus("Translation complete!", "green");
              updateTranslation(response.translation);
              console.log("Translated to:", response.targetLanguage);
            }
            setButtonState(true);
          },
        );
      } else {
        updateStatus("Please enter text to translate.", "red");
      }
    });
  }
});
