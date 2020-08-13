// ==UserScript==
// @name         Tower of the Sorcerer Translate
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @match        https://h5mota.com/*
// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      language-translator.watson.cloud.ibm.com
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @require      https://crypto.stanford.edu/sjcl/sjcl.js
// @require      https://cdn.jsdelivr.net/npm/deepcopy@2.1.0/umd/deepcopy.min.js
// ==/UserScript==

'use strict'

let localStorage = window.localStorage,
    textPoints = [],
    currentLogTranslationMenuItem = null,
    currentApiBaseUrlMenuItem = null,
    currentApiKeyMenuItem = null

let logTranslation = GM_getValue('logTranslation', 'true') === 'false'
let apiBaseUrl = GM_getValue('ibmApiBaseUrl', 'https://api.us-south.language-translator.watson.cloud.ibm.com/instances/53857e8f-a931-4c00-8257-a17a4a5e9e17')
let encodeKey = GM_getValue('encodeKey', '')
let apiKey = null

if (!encodeKey) {
    const makeId = (idLength) => {
        let result = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const charactersLength = characters.length
        for (let i = 0; i < idLength; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    }
    encodeKey = makeId(25)
    GM_setValue('encodeKey', encodeKey)
    GM_setValue('ibmApiKey', '')
}

try {
    apiKey = sjcl.decrypt(encodeKey, JSON.parse(GM_getValue('ibmApiKey', '')) )
} catch(err) {
    apiKey = null
}

if (!apiKey) {
    alert('IBM Translate API Key not set. Please go to https://cloud.ibm.com/catalog/services/language-translator, create an account, and get a free tier translate api key.')
    apiKey = prompt('Please enter the IBM Translate API Key:', '')
    alert('You can change the IBM Translate API Key later using the scripts "Change API Key" menu item.')
}
if (apiKey) {
    GM_setValue('ibmApiKey', JSON.stringify(sjcl.encrypt(encodeKey, apiKey)) )
}

const updateScriptMenu = () => {
    if (currentLogTranslationMenuItem) { GM_unregisterMenuCommand(currentLogTranslationMenuItem); }
    if (currentApiKeyMenuItem) { GM_unregisterMenuCommand(currentApiKeyMenuItem); }
    if (currentApiBaseUrlMenuItem) { GM_unregisterMenuCommand(currentApiBaseUrlMenuItem); }

    const logTranslationMessage = logTranslation ? 'Stop Logging Canvas Translation To Console' : 'Log Canvas Translation To Console'
    currentLogTranslationMenuItem = GM_registerMenuCommand(logTranslationMessage, () => {
        logTranslation = !logTranslation
        GM_setValue('logTranslation', logTranslation ? 'true' : 'false')
        GM_unregisterMenuCommand(currentLogTranslationMenuItem)
        updateScriptMenu()
    })

    currentApiKeyMenuItem = GM_registerMenuCommand('Change API Key', () => {
        apiKey = prompt('Please enter the IBM Translate API Key:', '')
        if (apiKey) {
            GM_setValue('ibmApiKey', JSON.stringify(sjcl.encrypt(encodeKey, apiKey)) )
        }
    })

    currentApiBaseUrlMenuItem = GM_registerMenuCommand('Change API Base Url', () => {
        apiBaseUrl = prompt('Please enter the IBM Translate API Base Url (ex: "https://api.us-south.language-translator.watson.cloud.ibm.com/instances/53857e8f-a931-4c00-8257-a17a4a5e9e17"):', '')
        GM_setValue('ibmApiBaseUrl', apiBaseUrl)
    })
}
updateScriptMenu()

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

const checkIfNeedsTranslation = (text) => {
    if (typeof text != 'string') {
        return false
    }

    // check for simple strings
    let cleanedUpText = text.replace(/\\*\w?\[[^\]]*\]|\$\{[^\}]*\}/i, '').trim()
    if (/^[\+\-]?\d+w?$/.test(cleanedUpText)) {
        return false
    } else if (cleanedUpText == '') {
        return false
        // doesn't need to be transalted
    } else if (/^[\wäöüÄÖÜß\d\s !@#$%^&*?？^-_.\\+\:\[\]\(\)\,\'\"\~;\/`\-=<>{}]+$/.test(cleanedUpText)) {
        return false
    }

    return true
}

const generateTranslation = async (text, funcCallTracker) => {
    const originalText = text
    if (!checkIfNeedsTranslation(text)) {
        return text
    }
    if (logTranslation && console && console.log) {
        console.log(`generateTranslation in: ${funcCallTracker} for: ${text}`)
    }

    // use stored translations if available
    let translatedText = localStorage.getItem(`translation_prefix_${originalText}`)
    if (translatedText) {
        if (logTranslation && console && console.log) {
            console.log(`storage: ${originalText} | ${translatedText}`)
        }
        return translatedText
    }

    // store text flag so they aren't accidently translated
    let textFlagsTemp = {}
    let match
    // \$\{[[^\}]*\}|\[[^\]]*\] will work for examples:
    // `${5 flag:shop_times}` or `\t[`见见`,z1]` or `[v]` or `\t[`见见`]`
    while (match = /\$\{[^\}]*\}|\t*\[[\w\d\s !@#$%^&*?？^-_.\\+\:\(\)\,\'\"\~;\/`\-=<>{}]*\]?|\,?[\w\d\s !@#$%^&*?？^-_.\\+\:\(\)\,\'\"\~;\/`\-=<>{}]*\]|\t+/i.exec(text)) {
        const key = `@${Object.keys(textFlagsTemp).length}`
        textFlagsTemp[key] = match[0]
        if (logTranslation && console && console.log) {
            //console.log(`match[0]: ${key}`)
        }
        text = text.replace(textFlagsTemp[key], key)
    }
    // use ` [1] ` instead of `@1` since it works better in the translator
    let textFlags = {}
    for (const [key, value] of Object.entries(textFlagsTemp)) {
        const newKey = ` [${key.replace('@', '')}] `
        text = text.replace(key, newKey)
        textFlags[newKey] = value
    }

    // translate the text
    const auth = btoa(`apikey:${apiKey}`)
    const ret = await Request(`${apiBaseUrl}/v3/translate?version=2018-05-01`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            text: [text],
            model_id: 'zh-en',
        }),
    })

    const result = JSON.parse(ret.responseText)
    if (logTranslation && console && console.log) {
        console.log(`text ${text} -> result`, result)
    }
    translatedText = result.translations[0].translation

    // insert the text flags back
    for (const [key, value] of Object.entries(textFlags)) {
        translatedText = translatedText.replace(key, value)
    }

    // store the transation in localstorage
    localStorage.setItem(`translation_prefix_${originalText}`, translatedText)

    if (logTranslation && console && console.log) {
        console.log(`translated: ${originalText} | ${translatedText}`)
    }
    return translatedText
}



let libsLoaded = []
main._old_loadJs = main.loadJs
main.loadJs = function (dir, loadList, callback) {
    if ('libs' == dir) {
        libsLoaded = [].concat(libsLoaded, loadList)
    }
    this._old_loadJs(dir, loadList, callback)
}
main._old_loaderJs = main.loaderJs
main.loaderJs = function (dir, loadList, callback) {
    if ('libs' == dir) {
        libsLoaded = [].concat(libsLoaded, loadList)
    }
    this._old_loaderJs(dir, loadList, callback)
}

main._old_loaderFloors = main.loaderFloors
main.loaderFloors = async function (callback) {
    await translateResources()
    this._old_loaderFloors(callback)
}
main._old_loadFloors = main.loadFloors
main.loadFloors = async function (callback) {
    await translateResources()
    this._old_loadFloors(callback)
}

const translateResources = async () => {
    // need to set core.values early to translate in some places
    core.flags = deepcopy(core.data.flags)
    core.values = deepcopy(core.data.values)
    core.firstData = deepcopy(core.data.firstData)

    // no promise because its easier
    translateDifficulty()
    addLibPrototypeOverrides()

    let promises = []
    if (libsLoaded.includes('enemys')) {
        promises.push(translateEnemies())
    }

    return await Promise.all(promises)
}

const translateDifficulty = () => {
    if ($('span.startButton').length > 0) {
        $('span.startButton').each(async (i, span) => {
            const text = $(span).text()
            const transaltedText = await generateTranslation(text, 'startButton')
            $(span).text(transaltedText)
        })
    }
}

const addLibPrototypeOverrides = () => {
    ui.prototype._old_drawTip = ui.prototype.drawTip
    if (ui.prototype._old_drawTip.length == 3) {
        ui.prototype.drawTip = function(text, id, frame) {
            const translateWrapper = async (_this) => {
                const _text = await generateTranslation(text, 'drawTip')
                _this._old_drawTip(_text, id, frame)
            }
            translateWrapper(this)
        }
    } else {
        ui.prototype.drawTip = function(text, id) {
            const translateWrapper = async (_this) => {
                const _text = await generateTranslation(text, 'drawTip')
                _this._old_drawTip(_text, id)
            }
            translateWrapper(this)
        }
    }

    ui.prototype._old_drawTextBox = ui.prototype.drawTextBox
    ui.prototype.drawTextBox = function(content, showAll) {
        const translateWrapper = async (_this) => {
            const _content = await generateTranslation(content, 'drawTextBox')
            _this._old_drawTextBox(_content, showAll)
        }
        translateWrapper(this)
    }

    ui.prototype._old_drawScrollText = ui.prototype.drawScrollText
    ui.prototype.drawScrollText = function (content, time, lineHeight, callback) {
        const translateWrapper = async (_this) => {
            const _content = await generateTranslation(content, 'drawScrollText')
            _this._old_drawScrollText(_content, time, lineHeight, callback)
        }
        translateWrapper(this)
    }

    ui.prototype._old_drawConfirmBox = ui.prototype.drawConfirmBox
    ui.prototype.drawConfirmBox = function (text, yesCallback, noCallback) {
        const translateWrapper = async (_this) => {
            const _text = await generateTranslation(text, 'drawConfirmBox')
            _this._old_drawConfirmBox(_text, yesCallback, noCallback)
        }
        translateWrapper(this)
    }

    ui.prototype._old_drawWaiting = ui.prototype.drawWaiting
    ui.prototype.drawWaiting = function(text) {
        const translateWrapper = async (_this) => {
            const _text = await generateTranslation(text, 'drawWaiting')
            _this._old_drawWaiting(_text)
        }
        translateWrapper(this)
    }


    ui.prototype._old_textImage = ui.prototype.textImage
    ui.prototype.textImage = function(content, lineHeight) {
        const translateWrapper = async (_this) => {
            const _content = await generateTranslation(content, 'textImage')
            _this._old_textImage(_content, lineHeight)
        }
        translateWrapper(this)
    }


    ui.prototype._old_drawChoices = ui.prototype.drawChoices
    ui.prototype.drawChoices = function(content, choices) {
        const translateWrapper = async (_this) => {
            let _content = await generateTranslation(content, 'drawChoicesTranslate-content')
            let _choices = deepcopy(choices || [])
            if (_choices) {
                for (var i = 0; i < _choices.length; i++) {
                    if (_choices[i].text) {
                        _choices[i].text = await generateTranslation(_choices[i].text, 'drawChoicesTranslate-choice')
                    }
                }
            }
            _this._old_drawChoices(_content, _choices)
        }
        translateWrapper(this)
    }


    ui.prototype._old__drawBook_drawName  = ui.prototype._drawBook_drawName
    ui.prototype._drawBook_drawName = function(index, enemy, top, left, width) {
        const translateWrapper = async (_this) => {
            let _enemy = deepcopy(enemy || [])
            _enemy.name = await generateTranslation(_enemy.name, '_drawBook_drawNameTranslate-name')
            if (Array.isArray(enemy.specialText)) {
                for (var i = 0; i < _enemy.specialText.length; i++) {
                    _enemy.specialText[i] = await generateTranslation(_enemy.specialText[i], '_drawBook_drawNameTranslate-specialText')
                }
            } else if (enemy.specialText) {
                _enemy.specialText = await generateTranslation(_enemy.specialText, '_drawBook_drawNameTranslate-specialText')
            }
            _this._old__drawBook_drawName(index, _enemy, top, left, width)
        }
        translateWrapper(this)
    }


    ui.prototype._old__drawBookDetail_drawContent  = ui.prototype._drawBookDetail_drawContent
    ui.prototype._drawBookDetail_drawContent = function(enemy, content, pos) {
        const translateWrapper = async (_this) => {
            let _enemy = deepcopy(enemy || [])
            _enemy.name = await generateTranslation(_enemy.name, '_drawBook_drawNameTranslate-name')
            let _content = content
            // skip last 2
            for (var i = 0; i < _content.length - 2; i++) {
                _content[i] = await generateTranslation(_content[i], '_drawBook_drawNameTranslate-content')
            }
            _this._old__drawBookDetail_drawContent(_enemy, _content, pos)
        }
        translateWrapper(this)
    }


    control.prototype._old_getStatusLabel = control.prototype.getStatusLabel
    control.prototype.getStatusLabel = function (name) {
        if (this.controldata.getStatusLabel) {
            return this.controldata.getStatusLabel(name) || name
        }
        return {
            name: 'name', lv: 'lvl', hpmax: 'MxHP', hp: 'HP', manamax: 'MxMana', mana: 'Mana',
            atk: 'atk', def: 'def', mdef: 'mdef', money: '$', exp: 'exp', point: 'point', steps: 'step'
        }[name] || name
    }

    // more customized (skill tree that appears every here and there?)
    if (typeof Scene_Skill !== 'undefined') {
        let _old_Scene_Skill = Scene_Skill
        Scene_Skill = function() {
            this._Scene_Skill = new _old_Scene_Skill()

            this._Scene_Skill._old_drawText = this._Scene_Skill.drawText
            this._Scene_Skill.drawText = function(g, j, k, e, d, a, f) {
                if (g !== undefined) {
                    const translateWrapper = async (_this) => {
                        const _g = await generateTranslation(g, 'Scene_Skill-_old_drawText')
                        _this._old_drawText(_g, j, k, e, d, a, f)
                    }
                    translateWrapper(this)
                }
            }
            return this._Scene_Skill
        }
    }
}

const translateEnemies = async () => {
    const promises = []
    const enemys = core.enemys.enemys
    const enemydata = core.enemys.enemydata

    const enemyArray = Object.entries(enemys)
    for (let i=0; i < enemyArray.length; i++) {
        let [key, enemy] = enemyArray[i]
        if (enemy.name) {
            const translateWrapper = async () => {
                const text = await generateTranslation(enemy.name, 'enemys.name')
                enemy.name = text
            }
            promises.push(translateWrapper())
        }
    }

    const specials = enemydata.getSpecials()
    for (let i=0; i < specials.length; i++) {
        let special = specials[i]
        if (typeof special[1] === 'string') {
            const translateWrapper = async () => {
                const text = await generateTranslation(special[1], 'enemydata-special-name')
                special[1] = text
            }
            promises.push(translateWrapper())
        }
        if (typeof special[2] === 'string') {
            const translateWrapper = async () => {
                const text = await generateTranslation(special[2], 'enemydata-special-desc')
                special[2] = text
            }
            promises.push(translateWrapper())
        }
    }
    enemydata.getSpecials = function() {
        return specials
    }
    return await Promise.all(promises)
}

// in case I need it again
/*
        ui.prototype._old_drawTextContent = ui.prototype.drawTextContent
        ui.prototype.drawTextContent = async function (ctx, content, config) {
            let _content = await generateTranslation(content, 'drawTextContent')
            return this._old_drawTextContent(ctx, _content, config)
        }

        ui.prototype._old_fillText = ui.prototype.fillText
        ui.prototype.fillText = async function (name, text, x, y, style, font, maxWidth) {
            let _text = await generateTranslation(text, 'fillText')
            return this._old_fillText(name, _text, x, y, style, font, maxWidth)
        }

        ui.prototype._old_fillBoldText = ui.prototype.fillBoldText
        ui.prototype.fillBoldText = async function (name, text, x, y, style, font) {
            let _text = await generateTranslation(text, 'fillBoldText')
            return this._old_fillBoldText(name, _text, x, y, style, font)
        }


        ui.prototype._old__uievent_fillText  = ui.prototype._uievent_fillText
        ui.prototype._uievent_fillText = async function(data) {
            let _data = deepcopy(data || [])
            _data.text = await generateTranslation(_data.text, '_uievent_fillTextTranslate-data-text')
            return this._old__uievent_fillText(_data)
        }
*/
