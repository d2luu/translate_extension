# Text Translator Chrome Extension

## Overview

Text Translator is a Chrome extension that allows users to translate selected text on web pages or input text directly into the extension popup. It uses the Gemini API to provide accurate translations between multiple languages.

## Features

- Translate selected text on any web page
- Translate text input through the extension popup
- Support for multiple languages: Vietnamese, English, Japanese, and Chinese
- Automatic language detection for source text
- Easy-to-use interface with a tooltip for in-page translations
- Customizable target language selection

## Installation

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

### Translating Selected Text on Web Pages

1. Select text on any web page.
2. For single words, the translation will appear automatically in a tooltip.
3. For multiple words, press the 'T' key to trigger the translation.

### Translating Text via Extension Popup

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Select your desired target language from the dropdown menu.
3. Enter the text you want to translate in the text area.
4. Click the "Translate" button to see the translation result.

## Configuration

- To change the default target language, open the extension popup and select a new language from the dropdown menu. Your selection will be saved for future use.

## Development

This extension is built using:

- HTML, CSS, and JavaScript for the frontend
- Chrome Extension APIs for browser integration
- Gemini API for translation services

To modify or extend the extension:

1. Edit the relevant files:
   - `popup.html` and `popup.css` for popup UI
   - `popup.js` for popup functionality
   - `content.js` for in-page translation features
   - `background.js` for background processes and API calls
2. Update the `manifest.json` file if you add new permissions or scripts.
3. Reload the extension in Chrome to see your changes.

## Credits

This extension was developed by AI in collaboration with [@d2luu](https://www.facebook.com/d2luu).

## License
