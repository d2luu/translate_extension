console.log("Background script loaded");

const LANGUAGE_MAPPING = {
  vi: "Vietnamese",
  en: "English",
  ja: "Japanese",
  zh: "Chinese",
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "translateText") {
    console.log(
      "Received translation request. Target language code:",
      request.targetLanguage,
    );
    const targetLanguage =
      LANGUAGE_MAPPING[request.targetLanguage] || "Vietnamese";
    console.log("Mapped target language:", targetLanguage);
    translateText(
      request.text,
      targetLanguage,
      sender.tab ? sender.tab.id : null,
      sendResponse,
    );
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === "updateTheme") {
    // Propagate theme change to all tabs
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: "themeChanged",
          theme: request.theme,
        });
      });
    });
  }
});

async function translateText(text, targetLanguage, tabId, sendResponse) {
  try {
    console.log("Starting translation process for text:", text);
    console.log("Target language:", targetLanguage);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAxu7PUuiANAPvpJkRC0Fgfvl4RhrXIVXE",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are an expert translator and a helpful assistant that translates text to ${targetLanguage}.
                  Only translate, no more, and carefully check the translation for any grammatical errors.
                  Additionally, use translation style that is appropriate for the ${targetLanguage}.
                  Finally, verify the translation again before give it to the user.
                  Translate the following text: ${text}`,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const translatedText = result.candidates[0].content.parts[0].text;
    console.log("Translated text:", translatedText);
    console.log(
      "Translation completed successfully for target language:",
      targetLanguage,
    );

    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: "showTranslation",
        translation: translatedText,
        targetLanguage: targetLanguage,
      });
    } else {
      sendResponse({
        translation: translatedText,
        targetLanguage: targetLanguage,
      });
    }
  } catch (error) {
    console.error("Error in translation:", error);
    console.error("Failed to translate to target language:", targetLanguage);
    const errorMessage = `Error: ${error.message}`;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: "showTranslation",
        translation: errorMessage,
        targetLanguage: targetLanguage,
      });
    } else {
      sendResponse({
        translation: errorMessage,
        targetLanguage: targetLanguage,
      });
    }
  }
}
