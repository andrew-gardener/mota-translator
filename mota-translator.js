// ==UserScript==
// @name         Tower of the Sorcerer Translate
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @match        https://h5mota.com/*
// @run-at       document-end
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
        textPoints = [],
        apiKeyMenuItem = null,
        currentTranslationMenuItem = null,
        currentLogTranslationMenuItem = null;

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
        apiKey = prompt('API Key not set for ' + location.hostname + '. Please enter the API Key:', '');
    }
    GM_setValue("apiKey", JSON.stringify(sjcl.encrypt(encodeKey, apiKey)) );

    const updateScriptMenu = function() {
        if (apiKeyMenuItem) { GM_unregisterMenuCommand(apiKeyMenuItem); }
        if (currentTranslationMenuItem) { GM_unregisterMenuCommand(currentTranslationMenuItem); }
        if (currentLogTranslationMenuItem) { GM_unregisterMenuCommand(currentLogTranslationMenuItem); }

        apiKeyMenuItem = GM_registerMenuCommand("Enter new API Key", function() {
			let newApiKey = prompt('Set API Key for ' + location.hostname + '. Please enter a the API Key:', '');
			if (newApiKey) {
				apiKey = newApiKey;
				GM_setValue("apiKey", JSON.stringify(sjcl.encrypt(encodeKey, newApiKey)) );
			}
        });

        currentLogTranslationMenuItem = GM_registerMenuCommand(logTranslation ? "Stop Logging Canvas Translation To Console" : "Log Canvas Translation To Console", function() {
            logTranslation = !logTranslation;
            GM_setValue("logTranslation", logTranslation ? 'true' : 'false');
            GM_unregisterMenuCommand(currentLogTranslationMenuItem);
            updateScriptMenu();
        });
    }

    const generateTranslation = async function(text) {
        console.log("generateTranslation", text)
        if (typeof text != "string") {
            return text;
        }

        // use stored translations if available
        let translatedText = localStorage.getItem("translation_prefix_"+text);
        if (translatedText) {
            if (logTranslation && console && console.log) {
                console.log(translatedText, " | ", text);
            }
            return translatedText;
        }

        // check for simple strings
        let cleanedUpText = text.replace(/\\*\w?\[[^\]]*\]|\$\{[^\}]*\}/i, '').trim();
        if (/^[\+\-]?\d+w?$/.test(cleanedUpText)) {
            return text;
        } else if (cleanedUpText == '???') {
            return text;
        } else if (cleanedUpText == '') {
            return text;
        // doesn't need to be transalted
        } else if (/^[a-zA-Z0-9$@$!%*?&#^-_. \\+\:\[\]\(\)\,\'\"\~]+$/.test(cleanedUpText)) {
            return text;
        }

        // store text flag so they aren't accidently translated
        let textFlags = {};
        let match;
        // \$\{[[^\}]*\} will work for examples: ${5 flag:shop_times}
        while (match = /\$\{[^\}]*\}/i.exec(text)) {
            const key = '$|'+ Object.keys(textFlags).length + '|$';
            textFlags[key] = match[0];
            console.log("match[0]: ", textFlags[key]);
            text = text.replace(textFlags[key], key);
        }

        // translate the text
        let result = await $.get("https://translate.yandex.net/api/v1.5/tr.json/translate?text="+encodeURI(text)+"&lang=zh-en&key="+apiKey);
        translatedText = result.text[0];

        // insert the text flags back
        for (const [key, value] of Object.entries(textFlags)) {
            translatedText = translatedText.replace(key, value);
        }

        // store the transation in localstorage
        localStorage.setItem("translation_prefix_"+text, translatedText);

        if (logTranslation && console && console.log) {
            console.log(translatedText, " | ", text);
        }
        return translatedText;
    }

    updateScriptMenu();

    setTimeout(function(){
        if (main.levelChoose) {
            for (var i = 0; i < main.levelChoose.length; i++) {
                if (main.levelChoose[i][0]) {
                    let text = core.replaceText(main.levelChoose[i][0] || "");
                    main.levelChoose[i][0] = generateTranslation(text);
                }
            }
        }

        ui.prototype._old_drawTip = ui.prototype.drawTip;
        ui.prototype.drawTip = async function(text, id) {
            const translatedText = await generateTranslation(text);
            return this._old_drawTip(translatedText, id);
        };

        ui.prototype._old_drawTextBox = ui.prototype.drawTextBox;
        ui.prototype.drawTextBox = async function(content, showAll) {
            const translatedText = await generateTranslation(content);
            return this._old_drawTextBox(translatedText, showAll);
        }

        ui.prototype._old_drawChoices = ui.prototype.drawChoices;
        ui.prototype.drawChoices = async function(content, choices) {
            const translatedText = await generateTranslation(content);
            choices = core.clone(choices || []);
            if (choices) {
                for (var i = 0; i < choices.length; i++) {
                    if (choices[i].text) {
                        choices[i].text = await generateTranslation(choices[i].text);
                    }
                }
            }
            return this._old_drawChoices(translatedText, choices);
        }

        ui.prototype._old_drawScrollText = ui.prototype.drawScrollText;
        ui.prototype.drawScrollText = async function (content, time, lineHeight, callback) {
            const translatedText = await generateTranslation(content);
            return this._old_drawScrollText(translatedText, time, lineHeight, callback);
        }

        ui.prototype._old_drawConfirmBox = ui.prototype.drawConfirmBox;
        ui.prototype.drawConfirmBox = async function (text, yesCallback, noCallback) {
            const translatedText = await generateTranslation(text);
            return this._old_drawConfirmBox(translatedText, yesCallback, noCallback);

        }

        ui.prototype._old_drawWaiting = ui.prototype.drawWaiting;
        ui.prototype.drawWaiting = async function(text) {
            const translatedText = await generateTranslation(text);
            return this._old_drawWaiting(translatedText);
        }

        ui.prototype._old_fillText = ui.prototype.fillText;
        ui.prototype.fillText = async function (name, text, x, y, style, font, maxWidth) {
            const translatedText = await generateTranslation(text);
            return await this._old_fillText(name, translatedText, x, y, style, font, maxWidth);
        }
    }, 2000);
});
