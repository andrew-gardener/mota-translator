// ==UserScript==
// @name         Tower of the Sorcerer Translate
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @match        https://h5mota.com/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      http://crypto.stanford.edu/sjcl/sjcl.js
// ==/UserScript==

$(function(){
    'use strict';

    let localStorage = window.localStorage,
        promises = [],
        textPoints = [],
        apiKeyMenuItem = null,
        currentTranslationMenuItem = null,
        currentLogTranslationMenuItem = null;

    let enableTranslation = GM_getValue("enableTranslation", "true") === 'true';
    let logTranslation = GM_getValue("logTranslation", "true") === 'false';
    let encodeKey = GM_getValue("encodeKey", "");
    let apiKey = null;
    while (!encodeKey) {
        encodeKey = prompt('Script key not set for ' + location.hostname + '. Please enter a random string:', '');
        GM_setValue("encodeKey", encodeKey);
    }

    try {
        apiKey = sjcl.decrypt(encodeKey, JSON.parse(GM_getValue("apiKey", "")) );
    } catch(err) {
        apiKey = null;
    }

    while (!apiKey) {
        apiKey = prompt('API Key not set for ' + location.hostname + '. Please enter a the API Key:', '');
    }
    GM_setValue("apiKey", JSON.stringify(sjcl.encrypt(encodeKey, apiKey)) );

    const updateScriptMenu = function() {
        if (apiKeyMenuItem) { GM_unregisterMenuCommand(apiKeyMenuItem); }
        if (currentTranslationMenuItem) { GM_unregisterMenuCommand(currentTranslationMenuItem); }
        if (currentLogTranslationMenuItem) { GM_unregisterMenuCommand(currentLogTranslationMenuItem); }

        apiKeyMenuItem = GM_registerMenuCommand("Enter new API Key", function() {
            do {
                apiKey = prompt('Set API Key for ' + location.hostname + '. Please enter a the API Key:', '');
            } while (!apiKey);
            GM_setValue("apiKey", JSON.stringify(sjcl.encrypt(encodeKey, apiKey)) );
        });

        currentTranslationMenuItem = GM_registerMenuCommand(enableTranslation ? "Disable Canvas Translation" : "Enable Canvas Translation", function() {
            enableTranslation = !enableTranslation;
            GM_setValue("enableTranslation", enableTranslation ? 'true' : 'false');
            GM_unregisterMenuCommand(currentTranslationMenuItem);
            updateScriptMenu();
        });

        if (enableTranslation) {
            currentLogTranslationMenuItem = GM_registerMenuCommand(logTranslation ? "Stop Logging Canvas Translation To Console" : "Log Canvas Translation To Console", function() {
                logTranslation = !logTranslation;
                GM_setValue("logTranslation", logTranslation ? 'true' : 'false');
                GM_unregisterMenuCommand(currentLogTranslationMenuItem);
                updateScriptMenu();
            });
        }
    }

    const generateTranslation = async function(text) {
        const promiseKey = "translation_prefix_"+text;
        if (!promises.hasOwnProperty(promiseKey)) {
            promises[promiseKey] = $.get("https://translate.yandex.net/api/v1.5/tr.json/translate?text="+encodeURI(text)+"&lang=zh-en&key="+apiKey);
        }
        let result = await promises[promiseKey];
        let translationText = result.text[0];
        localStorage.setItem("translation_prefix_"+text, translationText);
        return translationText;
    }

    const getNewFont = function (oldFont) {
        let newFont = oldFont;
        let matches = oldFont.match(/\d+px/g);
        if (matches) {
            matches.forEach(function(match) {
                let newPixels = Math.round(parseFloat(match) * 0.5) + "px";
                newFont = newFont.replace(match, newPixels);
            });
        }
        return newFont;
    }

    const generateTextPointCounter = function (x, y) {
        const index = x+","+y;
        if(!textPoints[index]) {
            textPoints[index] = 0;
        }
        return ++textPoints[index];
    }

    const currentTextPointCounter = function (x, y) {
        const index = x+","+y;
        return textPoints[index];
    }

    CanvasRenderingContext2D.prototype.__oldFillText = CanvasRenderingContext2D.prototype.fillText;

    CanvasRenderingContext2D.prototype.fillText = async function(text, x, y, maxWidth) {
        let _this = this;
        const updateCounter = generateTextPointCounter(x, y);
        let skipTranslation = false;
        if (!enableTranslation) {
            skipTranslation = true;
        } else if (/^[\+\-]?\d+w?$/.test(text)) {
            skipTranslation = true;
        } else if (text == '???') {
            skipTranslation = true;
        }

        if (skipTranslation) {
            _this.__oldFillText(text, x, y, maxWidth);
            return;
        }

        const currentFont = getNewFont(_this.font);
        const currentFillStyle = _this.fillStyle;

        // use stored translations if available
        let translatedText = localStorage.getItem("translation_prefix_"+text);
        // if not available generate it
        if (!translatedText) {
            translatedText = await generateTranslation(text);
            // skip update if there is a more recent change at location
            const currentCounter = currentTextPointCounter(x, y);
            if (currentCounter > updateCounter) {
                return;
            }
        }

        if (logTranslation && console && console.log) {
            console.log(translatedText, " | ", text);
        }

        const oldFont = await _this.font;
        const oldFillStyle = await _this.fillStyle;
        _this.font = currentFont;
        _this.fillStyle = currentFillStyle;
        _this.__oldFillText(translatedText, x, y, maxWidth);
        if (oldFont) { _this.font = oldFont; }
        if (oldFillStyle) { _this.fillStyle = oldFillStyle; }
    }

    updateScriptMenu();
});
