console.log("Background script loaded");

const LANGUAGE_MAPPING = {
  vi: "Vietnamese",
  en: "English",
  ja: "Japanese",
  zh: "Chinese",
};

const DEFAULT_API_KEY = "AIzaSyAxu7PUuiANAPvpJkRC0Fgfvl4RhrXIVXE";

let currentApiKeyIndex = 0;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "translateText") {
    console.log(
      "Received translation request. Target language code:",
      request.targetLanguage,
    );
    const targetLanguage =
      LANGUAGE_MAPPING[request.targetLanguage] || "Vietnamese";
    console.log("Mapped target language:", targetLanguage);
    chrome.storage.sync.get("apiKeys", function (data) {
      const userApiKeys = data.apiKeys || [];
      const apiKeys =
        userApiKeys.length > 0
          ? userApiKeys.map((keyObj) => keyObj.key)
          : [DEFAULT_API_KEY];
      translateTextWithRetry(
        request.text,
        targetLanguage,
        apiKeys,
        sender.tab ? sender.tab.id : null,
        sendResponse,
        0,
      );
    });
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

async function translateTextWithRetry(
  text,
  targetLanguage,
  apiKeys,
  tabId,
  sendResponse,
  retryCount = 0,
) {
  if (retryCount > apiKeys.length) {
    const errorMessage =
      "Error: Rate limit reached for all API keys. Please wait a minute and try again or add more API keys to extend the limit.";
    sendTranslationResponse(errorMessage, targetLanguage, tabId, sendResponse);
    return;
  }

  const apiKey = apiKeys[currentApiKeyIndex];
  try {
    const translatedText = await fetchTranslation(text, targetLanguage, apiKey);
    // Reset retryCount and currentApiKeyIndex on successful translation
    currentApiKeyIndex = 0;
    sendTranslationResponse(
      translatedText,
      targetLanguage,
      tabId,
      sendResponse,
    );
  } catch (error) {
    if (error.message.includes("429")) {
      console.log("Rate limit reached for API key. Trying next key.");
      currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
      // If we've cycled through all keys, try the first one again
      if (currentApiKeyIndex === 0 && retryCount === apiKeys.length - 1) {
        console.log("Trying first key one more time before giving up.");
      }
      await translateTextWithRetry(
        text,
        targetLanguage,
        apiKeys,
        tabId,
        sendResponse,
        retryCount + 1,
      );
    } else {
      sendTranslationResponse(
        `Error: ${error.message}`,
        targetLanguage,
        tabId,
        sendResponse,
      );
    }
  }
}

async function fetchTranslation(text, targetLanguage, apiKey) {
  const safetySettings = [
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_NONE",
    },
  ];
  const prompt = `You are an expert translator and a helpful assistant that translates text to ${targetLanguage}.
  Only translate, no more, and carefully check the translation for any grammatical errors.
  Additionally, use translation style that is appropriate for the ${targetLanguage}.
  Finally, verify the translation again before give it to the user.
  Translate the following text: ${text}`;

  const model = "gemini-1.5-flash";
  const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models";

  const response = await fetch(
    `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`,
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
                text: prompt,
              },
            ],
          },
        ],
        safetySettings: safetySettings,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.candidates[0].content.parts[0].text;
}

function sendTranslationResponse(
  translatedText,
  targetLanguage,
  tabId,
  sendResponse,
) {
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
}
