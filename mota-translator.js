// ==UserScript==
// @name         Tower of the Sorcerer Translate
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @match        https://h5mota.com/*
// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      language-translator.watson.cloud.ibm.com
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      http://crypto.stanford.edu/sjcl/sjcl.js
// ==/UserScript==

$(function(){
    'use strict';

    let localStorage = window.localStorage,
        textPoints = [],
        currentLogTranslationMenuItem = null,
        currentApiBaseUrlMenuItem = null,
        currentApiKeyMenuItem = null;

    let logTranslation = GM_getValue("logTranslation", "true") === 'false';
    let apiBaseUrl = GM_getValue("ibmApiBaseUrl", "https://api.us-south.language-translator.watson.cloud.ibm.com/instances/53857e8f-a931-4c00-8257-a17a4a5e9e17");
    let encodeKey = GM_getValue("encodeKey", '');
    let apiKey = null;

    if (!encodeKey) {
        const makeId = (length) => {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        };
        encodeKey = makeId(25);
        GM_setValue("encodeKey", encodeKey);
        GM_setValue("ibmApiKey", '');
    }

    try {
        apiKey = sjcl.decrypt(encodeKey, JSON.parse(GM_getValue("ibmApiKey", "")) );
    } catch(err) {
        apiKey = null;
    }

    if (!apiKey) {
        alert('IBM Translate API Key not set. Please go to https://cloud.ibm.com/catalog/services/language-translator , create an account, and get a free tier translate api key.');
        apiKey = prompt('Please enter the IBM Translate API Key:', '');
        alert('You can change the IBM Translate API Key later using the scripts "Change API Key" menu item.');
    }
    if (apiKey) {
        GM_setValue("ibmApiKey", JSON.stringify(sjcl.encrypt(encodeKey, apiKey)) );
    }

    const updateScriptMenu = function() {
        if (currentLogTranslationMenuItem) { GM_unregisterMenuCommand(currentLogTranslationMenuItem); }
        if (currentApiKeyMenuItem) { GM_unregisterMenuCommand(currentApiKeyMenuItem); }
        if (currentApiBaseUrlMenuItem) { GM_unregisterMenuCommand(currentApiBaseUrlMenuItem); }

        currentLogTranslationMenuItem = GM_registerMenuCommand(logTranslation ? "Stop Logging Canvas Translation To Console" : "Log Canvas Translation To Console", function() {
            logTranslation = !logTranslation;
            GM_setValue("logTranslation", logTranslation ? 'true' : 'false');
            GM_unregisterMenuCommand(currentLogTranslationMenuItem);
            updateScriptMenu();
        });

        currentApiKeyMenuItem = GM_registerMenuCommand("Change API Key", function() {
            apiKey = prompt('Please enter the IBM Translate API Key:', '');
            if (apiKey) {
                GM_setValue("ibmApiKey", JSON.stringify(sjcl.encrypt(encodeKey, apiKey)) );
            }
        });

        currentApiBaseUrlMenuItem = GM_registerMenuCommand("Change API Base Url", function() {
            apiBaseUrl = prompt('Please enter the IBM Translate API Base Url (ex: "https://api.us-south.language-translator.watson.cloud.ibm.com/instances/53857e8f-a931-4c00-8257-a17a4a5e9e17"):', '');
            GM_setValue("ibmApiBaseUrl", apiBaseUrl);
        });
    }

    // GM_xmlhttpRequest
    const Request = (url, opt={}) => {
        Object.assign(opt, {
            fetch: true,
            url: url,
            timeout: 2000
        })

        return new Promise((resolve, reject) => {
            opt.onerror = opt.ontimeout = reject
            opt.onload = resolve

            GM_xmlhttpRequest(opt)
        })
    }

    const checkIfNeedsTranslation = function (text) {
        if (typeof text != "string") {
            return false;
        }

        // check for simple strings
        let cleanedUpText = text.replace(/\\*\w?\[[^\]]*\]|\$\{[^\}]*\}/i, '').trim();
        if (/^[\+\-]?\d+w?$/.test(cleanedUpText)) {
            return false;
        } else if (cleanedUpText == '???') {
            return false;
        } else if (cleanedUpText == '') {
            return false;
        // doesn't need to be transalted
        } else if (/^[a-zA-Z0-9$@$!%*?&#^-_. \\+\:\[\]\(\)\,\'\"\~]+$/.test(cleanedUpText)) {
            return false;
        }

        return true;
    }

    const generateTranslation = async function(text, funcCallTracker) {
        if (logTranslation && console && console.log) {
            console.log("generateTranslation for function: ", funcCallTracker, " on: ", text);
        }
        if (!checkIfNeedsTranslation(text)) {
            return text;
        }

        // use stored translations if available
        let translatedText = localStorage.getItem("translation_prefix_"+text);
        if (translatedText) {
            if (logTranslation && console && console.log) {
                console.log(text, " | ", translatedText);
            }
            return translatedText;
        }

        // store text flag so they aren't accidently translated
        let textFlags = {};
        let match;
        // \$\{[[^\}]*\}|\[[^\]]*\] will work for examples:
        // `${5 flag:shop_times}` or `\t[`见见`,z1]` or `[v]`
        while (match = /\$\{[^\}]*\}|\t+\[|\,[^\]]*\]|\[[a-zA-Z]+\]/i.exec(text)) {
            const key = '@'+ Object.keys(textFlags).length;
            textFlags[key] = match[0];
            // console.log("match[0]: ", textFlags[key]);
            text = text.replace(textFlags[key], key);
        }

        // translate the text
        const ret = await Request(`${apiBaseUrl}/v3/translate?version=2018-05-01`, {
            method: "POST",
            headers: {
                'Authorization': 'Basic '+ btoa('apikey:'+apiKey),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                text: [text],
                model_id: 'zh-en',
            }),
        })
        const result = JSON.parse(ret.responseText);
        if (logTranslation && console && console.log) {
           console.log("result", result);
        }
        translatedText = result.translations[0].translation;

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
        /*
        if (main.levelChoose) {
            for (var i = 0; i < main.levelChoose.length; i++) {
                if (main.levelChoose[i][0]) {
                    let text = core.replaceText(main.levelChoose[i][0] || "");
                    main.levelChoose[i][0] = generateTranslation(text);
                }
            }
        }
        */

        ui.prototype._old_drawTip = ui.prototype.drawTip;
        if (ui.prototype._old_drawTip.length == 3) {
            ui.prototype.drawTip = function(text, id, frame) {
                if (checkIfNeedsTranslation(text)) {
                    return asyncWaitWrapper(this, this._old_drawTip, [text, id, frame], 0, 'drawTip');
                }
                return this._old_drawTip(text, id, frame);
            };
        } else {
            ui.prototype.drawTip = function(text, id) {
                if (checkIfNeedsTranslation(text)) {
                    return asyncWaitWrapper(this, this._old_drawTip, [text, id], 0, 'drawTip');
                }
                return this._old_drawTip(text, id);
            };
        }

        ui.prototype._old_drawTextBox = ui.prototype.drawTextBox;
        ui.prototype.drawTextBox = function(content, showAll) {
            if (checkIfNeedsTranslation(content)) {
                return asyncWaitWrapper(this, this._old_drawTextBox, [content, showAll], 0, 'drawTextBox');
            }
            return this._old_drawTextBox(content, showAll);
        }

        ui.prototype._old_drawScrollText = ui.prototype.drawScrollText;
        ui.prototype.drawScrollText = function (content, time, lineHeight, callback) {
            if (checkIfNeedsTranslation(content)) {
                return asyncWaitWrapper(this, this._old_drawScrollText, [content, time, lineHeight, callback], 0, 'drawScrollText');
            }
            return this._old_drawScrollText(content, time, lineHeight, callback);
        }

        ui.prototype._old_drawConfirmBox = ui.prototype.drawConfirmBox;
        ui.prototype.drawConfirmBox = function (text, yesCallback, noCallback) {
            if (checkIfNeedsTranslation(text)) {
                return asyncWaitWrapper(this, this._old_drawConfirmBox, [text, yesCallback, noCallback], 0, 'drawConfirmBox');
            }
            return this._old_drawConfirmBox(text, yesCallback, noCallback);
        }

        ui.prototype._old_drawWaiting = ui.prototype.drawWaiting;
        ui.prototype.drawWaiting = function(text) {
            if (checkIfNeedsTranslation(text)) {
                return asyncWaitWrapper(this, this._old_drawWaiting, [text], 0, 'drawWaiting');
            }
            return this._old_drawWaiting(text);
        }

        /*
        ui.prototype._old_drawTextContent = ui.prototype.drawTextContent;
        ui.prototype.drawTextContent = function (ctx, content, config) {
            if (checkIfNeedsTranslation(content)) {
                return asyncWaitWrapper(this, this._old_drawTextContent, [ctx, content, config], 1, 'drawTextContent');
            }
            return this._old_drawTextContent(ctx, content, config);
        }*/

/*
        ui.prototype._old_fillText = ui.prototype.fillText;
        ui.prototype.fillText = function (name, text, x, y, style, font, maxWidth) {
            if (checkIfNeedsTranslation(text)) {
                return asyncWaitWrapper(this, this._old_fillText, [name, text, x, y, style, font, maxWidth], 1, 'fillText');
            }
            return this._old_fillText(name, text, x, y, style, font, maxWidth);
        }

        ui.prototype._old_fillBoldText = ui.prototype.fillBoldText;
        ui.prototype.fillBoldText = function (name, text, x, y, style, font) {
            if (checkIfNeedsTranslation(text)) {
                return asyncWaitWrapper(this, this._old_fillBoldText, [name, text, x, y, style, font], 1, 'fillBoldText');
            }
            return this._old_fillBoldText(name, text, x, y, style, font);
        }


        ui.prototype._old__uievent_fillText  = ui.prototype._uievent_fillText;
        ui.prototype._uievent_fillText = function(data) {
            if (checkIfNeedsTranslation(data.text)) {
                return this._uievent_fillTextTranslate(data);
            }
            return this._old__uievent_fillText(data);
        }
        ui.prototype._uievent_fillTextTranslate = async function (data) {
            let _data = core.clone(data || []);
            _data.text = await generateTranslation(_data.text, '_uievent_fillTextTranslate-data-text');
            return this._old__drawBookDetail_drawContent(_data);
        }

*/
        const asyncWaitWrapper = async function(_this, func, funcArgs, textIndex, funcName) {
            funcArgs[textIndex] = await generateTranslation(funcArgs[textIndex], funcName);
            return func.apply(_this, funcArgs);
        }



        ui.prototype._old_drawChoices = ui.prototype.drawChoices;
        ui.prototype.drawChoices = function(content, choices) {
            let needsTranslation = false;
            if (checkIfNeedsTranslation(content)) {
                needsTranslation = true;
            }
            if (choices) {
                for (var i = 0; i < choices.length; i++) {
                    if (choices[i].text && checkIfNeedsTranslation(choices[i].text)) {
                        needsTranslation = true;
                    }
                }
            }
            if (needsTranslation) {
                return this.drawChoicesTranslate(content, choices);
            }
            return this._old_drawChoices(content, choices);
        }
        ui.prototype.drawChoicesTranslate = async function (content, choices) {
            const _content = await generateTranslation(content, 'drawChoicesTranslate-content');
            let _choices = core.clone(choices || []);
            if (_choices) {
                for (var i = 0; i < _choices.length; i++) {
                    if (_choices[i].text && checkIfNeedsTranslation(_choices[i].text)) {
                        _choices[i].text = await generateTranslation(_choices[i].text, 'drawChoicesTranslate-choice');
                    }
                }
            }
            return this._old_drawChoices(_content, _choices);
        }



        ui.prototype._old__drawBook_drawName  = ui.prototype._drawBook_drawName;
        ui.prototype._drawBook_drawName = function(index, enemy, top, left, width) {
            let needsTranslation = false;
            if (checkIfNeedsTranslation(enemy.name)) {
                needsTranslation = true;
            }
            if (Array.isArray(enemy.specialText)) {
                for (var i = 0; i < enemy.specialText.length; i++) {
                    if (checkIfNeedsTranslation(enemy.specialText[i])) {
                        needsTranslation = true;
                    }
                }
            } else if (enemy.specialText && checkIfNeedsTranslation(enemy.specialText)) {
                needsTranslation = true;
            }
            if (needsTranslation) {
                return this._drawBook_drawNameTranslate(index, enemy, top, left, width);
            }
            return this._old__drawBook_drawName(index, enemy, top, left, width);
        }
        ui.prototype._drawBook_drawNameTranslate = async function (index, enemy, top, left, width) {
            let _enemy = core.clone(enemy || []);
            _enemy.name = await generateTranslation(_enemy.name, '_drawBook_drawNameTranslate-name');
            if (Array.isArray(enemy.specialText)) {
                for (var i = 0; i < _enemy.specialText.length; i++) {
                    _enemy.specialText[i] = await generateTranslation(_enemy.specialText[i], '_drawBook_drawNameTranslate-specialText');
                }
            } else if (enemy.specialText) {
                _enemy.specialText = await generateTranslation(_enemy.specialText, '_drawBook_drawNameTranslate-specialText');
            }
            return this._old__drawBook_drawName(index, _enemy, top, left, width);
        }


        ui.prototype._old__drawBookDetail_drawContent  = ui.prototype._drawBookDetail_drawContent;
        ui.prototype._drawBookDetail_drawContent = function(enemy, content, pos) {
            let needsTranslation = false;
            if (checkIfNeedsTranslation(enemy.name)) {
                needsTranslation = true;
            }
            // skip last 2
            for (var i = 0; i < content.length - 2; i++) {
                if (checkIfNeedsTranslation(content[i])) {
                    needsTranslation = true;
                }
            }
            if (needsTranslation) {
                return this._drawBookDetail_drawContentTranslate(enemy, content, pos);
            }
            return this._old__drawBookDetail_drawContent(enemy, content, pos);
        }
        ui.prototype._drawBookDetail_drawContentTranslate = async function (enemy, content, pos) {
            let _enemy = core.clone(enemy || []);
            _enemy.name = await generateTranslation(_enemy.name, '_drawBook_drawNameTranslate-name');
            let _content = content;
            // skip last 2
            for (var i = 0; i < _content.length - 2; i++) {
                _content[i] = await generateTranslation(_content[i], '_drawBook_drawNameTranslate-content');
            }
            return this._old__drawBookDetail_drawContent(_enemy, _content, pos);
        }


        control.prototype._old_getStatusLabel = control.prototype.getStatusLabel;
        control.prototype.getStatusLabel = function (name) {
            if (this.controldata.getStatusLabel) {
                return this.controldata.getStatusLabel(name) || name;
            }
            return {
                name: "name", lv: "lvl", hpmax: "MxHP", hp: "HP", manamax: "MxMana", mana: "Mana",
                atk: "atk", def: "def", mdef: "mdef", money: "$", exp: "exp", point: "point", steps: "step"
            }[name] || name;
        }

        // more customized (skill tree that appears every here and there?)
        if (Scene_Skill) {
            let _old_Scene_Skill = Scene_Skill;
            Scene_Skill = function() {
                this._Scene_Skill = new _old_Scene_Skill();

                this._Scene_Skill._old_drawText = this._Scene_Skill.drawText;
                this._Scene_Skill.drawText = function(g, j, k, e, d, a, f) {
                    if (g !== undefined) {
                        if (checkIfNeedsTranslation(g)) {
                            return asyncWaitWrapper(this, this._old_drawText, [g, j, k, e, d, a, f], 0, 'Scene_Skill-_old_drawText');
                        }
                        return this._old_drawText(g, j, k, e, d, a, f);
                    }
                }
                return this._Scene_Skill;
            }
        }
    }, 3000);
});
