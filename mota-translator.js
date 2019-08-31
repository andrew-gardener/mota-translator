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
        let cleanedUpText = text.replace(/\\*\w?\[[^\]]*\]/i, '');
        if (/^[\+\-]?\d+w?$/.test(cleanedUpText)) {
            return text;
        } else if (/^[a-zA-Z0-9$@$!%*?&#^-_. +]+$/.test(cleanedUpText)) {
            return text;
        } else if (cleanedUpText == '???') {
            return text;
        } else if (text == '') {
            return text;
        }

        // translate the text
        let result = await $.get("https://translate.yandex.net/api/v1.5/tr.json/translate?text="+encodeURI(text)+"&lang=zh-en&key="+apiKey);
        translatedText = result.text[0];

        // store the transation in localstorage
        localStorage.setItem("translation_prefix_"+text, translatedText);

        if (logTranslation && console && console.log) {
            console.log(translatedText, " | ", text);
        }
        return translatedText;
    }

    updateScriptMenu();
    setTimeout(function(){
        ui.prototype._old_drawTip = ui.prototype.drawTip;
        ui.prototype.drawTip = async function(text, id) {
            const translatedText = await generateTranslation(text);
            return this._old_drawTip(translatedText, id);
        };

        //ui.prototype._old_drawTextBox = ui.prototype.drawTextBox;
        //ui.prototype.drawTextBox = async function(content, showAll) {
        //    console.log("drawTextBox", content);
        //    return this._old_drawTextBox(content, showAll);
        //};
        //ui.prototype._old__getTitleAndIcon = ui.prototype._getTitleAndIcon;
        //ui.prototype._getTitleAndIcon = async function(content) {
        //    let result = this._old__getTitleAndIcon(content);
        //    console.log("_getTitleAndIcon before", result);
        //    if (result.title) {
        //        result.title = await generateTranslation(result.title);
        //    }
        //    if (result.content) {
        //        result.content = await generateTranslation(result.content);
        //    }
        //    console.log("_getTitleAndIcon after", result);
        //    return await result;
        //};

        // must make drawTextBox async
        // https://github.com/ckcz123/mota-js/blob/12cdb8c47a831b2b25ccaaabf397664d1e35d63f/libs/ui.js#L1091
        ui.prototype.drawTextBox = async function(content, showAll) {
            if (core.status.event && core.status.event.id == 'action')
                core.status.event.ui = content;

            this.clearUI();

            content = core.replaceText(content);

            // Step 1: 获得标题信息和位置信息
            var textAttribute = core.status.textAttribute;
            var titleInfo = this._getTitleAndIcon(content);
            if (titleInfo.title) {
                titleInfo.title = await generateTranslation(titleInfo.title);
            }
            if (titleInfo.content) {
                titleInfo.content = await generateTranslation(titleInfo.content);
            }
            var posInfo = this._getPosition(titleInfo.content);
            if (posInfo.position != 'up' && posInfo.position != 'down') posInfo.px = posInfo.py = null;
            if (!posInfo.position) posInfo.position = textAttribute.position;
            content = this._drawTextBox_drawImages(posInfo.content);

            // Step 2: 计算对话框的矩形位置
            var hPos = this._drawTextBox_getHorizontalPosition(content, titleInfo, posInfo);
            var vPos = this._drawTextBox_getVerticalPosition(content, titleInfo, posInfo, hPos.validWidth);

            // Step 3: 绘制背景图
            var pInfo = core.clone(posInfo);
            pInfo.xoffset = hPos.xoffset; pInfo.yoffset = vPos.yoffset - 4;
            var isWindowSkin = this.drawBackground(hPos.left, vPos.top, hPos.right, vPos.bottom, pInfo);
            var alpha = isWindowSkin ? this._drawWindowSkin_getOpacity() : textAttribute.background[3];

            // Step 4: 绘制标题、头像、动画
            var content_top = this._drawTextBox_drawTitleAndIcon(titleInfo, hPos, vPos, alpha);

            // Step 5: 绘制正文
            var config = this.drawTextContent('ui', content, {
                left: hPos.content_left, top: content_top, maxWidth: hPos.validWidth,
                lineHeight: vPos.lineHeight, time: (showAll || textAttribute.time<=0 || core.status.event.id!='action')?0:textAttribute.time
            });

            // Step 6: 绘制光标
            main.dom.next.style.display = 'block';
            main.dom.next.style.borderRightColor = main.dom.next.style.borderBottomColor = core.arrayToRGB(textAttribute.text);
            main.dom.next.style.top = (vPos.bottom - 20) * core.domStyle.scale + "px";
            var left = (hPos.left + hPos.right) / 2;
            if (pInfo.position == 'up' && pInfo.px != null && Math.abs(pInfo.px * 32 + 16 - left) < 50)
                left = hPos.right - 64;
            main.dom.next.style.left = left * core.domStyle.scale + "px";
            return config;
        }

        // must make drawChoices async
        // https://github.com/ckcz123/mota-js/blob/12cdb8c47a831b2b25ccaaabf397664d1e35d63f/libs/ui.js#L1321
        ui.prototype.drawChoices = async function(content, choices) {
            choices = core.clone(choices || []);

            core.status.event.ui = {"text": content, "choices": choices};
            this.clearUI();

            content = core.replaceText(content || "");
            var titleInfo = this._getTitleAndIcon(content);
            if (titleInfo.title) {
                titleInfo.title = await generateTranslation(titleInfo.title);
            }
            if (titleInfo.content) {
                titleInfo.content = await generateTranslation(titleInfo.content);
            }
            for (var i = 0; i < choices.length; i++) {
                if (choices[i].text) {
                    choices[i].text = await generateTranslation(choices[i].text);
                }
            }
            titleInfo.content = this._drawTextBox_drawImages(titleInfo.content);
            var hPos = this._drawChoices_getHorizontalPosition(titleInfo, choices);
            var vPos = this._drawChoices_getVerticalPosition(titleInfo, choices, hPos);
            core.status.event.ui.offset = vPos.offset;

            var isWindowSkin = this.drawBackground(hPos.left, vPos.top, hPos.right, vPos.bottom);
            this._drawChoices_drawTitle(titleInfo, hPos, vPos);
            this._drawChoices_drawChoices(choices, isWindowSkin, hPos, vPos);
        }

        // https://github.com/ckcz123/mota-js/blob/12cdb8c47a831b2b25ccaaabf397664d1e35d63f/libs/ui.js#L1274
        ui.prototype.drawScrollText = async function (content, time, lineHeight, callback) {
            content = core.replaceText(content || "");
            if (content) {
                content = await generateTranslation(content);
            }
            lineHeight = lineHeight || 1.4;
            time = time || 5000;
            this.clearUI();
            var offset = core.status.textAttribute.offset || 15;
            lineHeight *= core.status.textAttribute.textfont;
            var ctx = this._createTextCanvas(content, lineHeight);
            var obj = { align: core.status.textAttribute.align, lineHeight: lineHeight };
            if (obj.align == 'right') obj.left = this.PIXEL - offset;
            else if (obj.align != 'center') obj.left = offset;
            this.drawTextContent(ctx, content, obj);
            this._drawScrollText_animate(ctx, time, callback);
        }

        // https://github.com/ckcz123/mota-js/blob/12cdb8c47a831b2b25ccaaabf397664d1e35d63f/libs/ui.js#L1447
        ui.prototype.drawConfirmBox = async function (text, yesCallback, noCallback) {
            core.lockControl();
            text = core.replaceText(text || "");

            // 处理自定义事件
            if (core.status.event.id != 'action') {
                core.status.event.id = 'confirmBox';
                core.status.event.ui = text;
                core.status.event.data = {'yes': yesCallback, 'no': noCallback};
            }

            if (core.status.event.selection != 0) core.status.event.selection = 1;
            this.clearUI();

            core.setFont('ui', this._buildFont(19, true));
            var contents = text.split("\n");
            for (var i = 0; i < contents.length; i++) {
                if (contents[i]) {
                    contents[i] = await generateTranslation(contents[i]);
                }
            }
            var rect = this._drawConfirmBox_getRect(contents);
            var isWindowSkin = this.drawBackground(rect.left, rect.top, rect.right, rect.bottom);

            core.setTextAlign('ui', 'center');
            core.setFillStyle('ui', core.arrayToRGBA(core.status.textAttribute.text))
            for (var i in contents) {
                core.fillText('ui', contents[i], this.HPIXEL, rect.top + 50 + i*30);
            }

            core.fillText('ui', await generateTranslation("确定"), this.HPIXEL - 38, rect.bottom - 35, null, this._buildFont(17, true));
            core.fillText('ui', await generateTranslation("取消"), this.HPIXEL + 38, rect.bottom - 35);
            var len=core.calWidth('ui', await generateTranslation("确定"));
            var strokeLeft = this.HPIXEL + (76*core.status.event.selection-38) - parseInt(len/2) - 5;

            if (isWindowSkin)
                this.drawWindowSelector(core.status.textAttribute.background, strokeLeft, rect.bottom-35-20, len+10, 28);
            else
                core.strokeRect('ui', strokeLeft, rect.bottom-35-20, len+10, 28, "#FFD700", 2);

        }

        // https://github.com/ckcz123/mota-js/blob/12cdb8c47a831b2b25ccaaabf397664d1e35d63f/libs/ui.js#L1494
        ui.prototype.drawWaiting = async function(text) {
            core.lockControl();
            core.status.event.id = 'waiting';
            core.clearUI();
            text = core.replaceText(text || "");
            if (text) {
                text = await generateTranslation(text);
            }
            var text_length = core.calWidth('ui', text, this._buildFont(19, true));
            var width = Math.max(text_length + 80, 220), left = this.HPIXEL - parseInt(width / 2), right = left + width;
            var top = this.HPIXEL - 48, height = 96, bottom = top + height;
            this.drawBackground(left, top, right, bottom);
            core.setTextAlign('ui', 'center');
            core.fillText('ui', text, this.HPIXEL, top + 56, core.arrayToRGBA(core.status.textAttribute.text));
        }

        // https://github.com/ckcz123/mota-js/blob/12cdb8c47a831b2b25ccaaabf397664d1e35d63f/libs/ui.js#L1629
        ui.prototype.drawBook = async function (index) {
            var floorId = core.floorIds[(core.status.event.ui||{}).index] || core.status.floorId;
            var enemys = core.enemys.getCurrentEnemys(floorId);
            core.clearUI();
            core.clearMap('data');
            // 生成groundPattern
            core.maps.generateGroundPattern(floorId);
            this._drawBook_drawBackground();
            core.setAlpha('ui', 1);

            if (enemys.length == 0) {
                core.setTextAlign('ui', 'center');
                core.fillText('ui', await generateTranslation("本层无怪物"), this.HPIXEL, this.HPIXEL + 14, '#999999', this._buildFont(50, true));
                core.fillText('ui', await generateTranslation('返回游戏'), this.PIXEL - 46, this.PIXEL - 13,'#DDDDDD', this._buildFont(15, true));
                return;
            }

            index = core.clamp(index, 0, enemys.length - 1);
            core.status.event.data = index;
            var pageinfo = this._drawBook_pageinfo();
            var perpage = pageinfo.per_page, page = parseInt(index / perpage) + 1, totalPage = Math.ceil(enemys.length / perpage);

            var start = (page - 1) * perpage;
            enemys = enemys.slice(start, page * perpage);

            for (var i = 0; i < enemys.length; i++)
                this._drawBook_drawOne(floorId, i, enemys[i], pageinfo, index == start + i);

            core.drawBoxAnimate();
            this.drawPagination(page, totalPage);
            core.setTextAlign('ui', 'center');
            core.fillText('ui', await generateTranslation('返回游戏'), this.PIXEL - 46, this.PIXEL - 13,'#DDDDDD', this._buildFont(15, true));
        }

        // https://github.com/ckcz123/mota-js/blob/12cdb8c47a831b2b25ccaaabf397664d1e35d63f/libs/ui.js#L1708
        ui.prototype._drawBook_drawName = async function (index, enemy, top, left, width) {
            // 绘制第零列（名称和特殊属性）
            // 如果需要添加自己的比如怪物的称号等，也可以在这里绘制
            core.setTextAlign('ui', 'center');
            if (enemy.specialText=='') {
                core.fillText('ui', await generateTranslation(enemy.name), left + width / 2,
                              top + 35, '#DDDDDD', this._buildFont(17, true));
            }
            else {
                core.fillText('ui', await generateTranslation(enemy.name), left + width / 2,
                              top + 28, '#DDDDDD', this._buildFont(17, true));
                core.fillText('ui', await generateTranslation(enemy.specialText), left + width / 2,
                              top + 50, '#FF6A6A', this._buildFont(15, true));
            }
        }

        // https://github.com/ckcz123/mota-js/blob/12cdb8c47a831b2b25ccaaabf397664d1e35d63f/libs/ui.js#L1731
        //ui.prototype._drawBook_drawRow1 = async function (index, enemy, top, left, width, position) {
        //    // 绘制第一行
        //    core.setTextAlign('ui', 'left');
        //    var b13 = this._buildFont(13, true), f13 = this._buildFont(13, false);
        //    var col1 = left, col2 = left + width * 9 / 25, col3 = left + width * 17 / 25;
        //    core.fillText('ui', await generateTranslation('生命'), col1, position, '#DDDDDD', f13);
        //    core.fillText('ui', core.formatBigNumber(enemy.hp||0), col1 + 30, position, null, b13);
        //    core.fillText('ui', await generateTranslation('攻击'), col2, position, null, f13);
        //    core.fillText('ui', core.formatBigNumber(enemy.atk||0), col2 + 30, position, null, b13);
        //    core.fillText('ui', await generateTranslation('防御'), col3, position, null, f13);
        //    core.fillText('ui', core.formatBigNumber(enemy.def||0), col3 + 30, position, null, b13);
        //}

        ui.prototype.drawBookDetail = async function (index) {
            var info = await this._drawBookDetail_getInfo(index), enemy = info[0];
            if (!enemy) return;
            var content = info[1].join("\n");
            core.status.event.id = 'book-detail';
            clearInterval(core.interval.tipAnimate);
            core.clearMap('data');

            var left = 10, width = this.PIXEL - 2 * left, right = left + width;
            var content_left = left + 25, validWidth = right - content_left - 13;
            var contents = core.splitLines("data", content, validWidth, this._buildFont(16, false));
            var height = Math.max(24 * contents.length + 55, 80), top = (this.PIXEL - height) / 2, bottom = top + height;

            core.setAlpha('data', 0.9);
            core.fillRect('data', left, top, width, height, '#000000');
            core.setAlpha('data', 1);
            core.strokeRect('data', left - 1, top - 1, width + 1, height + 1,
                            core.status.globalAttribute.borderColor, 2);

            await this._drawBookDetail_drawContent(enemy, contents, {top: top, content_left: content_left, bottom: bottom});
        }

        ui.prototype._drawBookDetail_getInfo = async function (index) {
            var floorId = core.floorIds[(core.status.event.ui||{}).index] || core.status.floorId;
            var enemys = core.enemys.getCurrentEnemys(floorId);
            if (enemys.length==0) return [];
            index = core.clamp(index, 0, enemys.length - 1);
            var enemy = enemys[index], enemyId = enemy.id;
            var texts=core.enemys.getSpecialHint(enemyId);
            if (texts.length == 0) {
                texts.push(await generateTranslation("该怪物无特殊属性。"));
            } else {
                for (var i = 0; i < texts.length; i++) {
                    console.log(texts[i])
                    texts[i] = await generateTranslation(texts[i]);
                }
            }
            texts.push("");
            await this._drawBookDetail_getTexts(enemy, floorId, texts);
            return [enemy, texts];
        }

        ui.prototype._drawBookDetail_getTexts = async function (enemy, floorId, texts) {
            // --- 模仿临界计算器
            this._drawBookDetail_mofang(enemy, texts);
            // --- 吸血怪最低生命值
            this._drawBookDetail_vampire(enemy, texts);
            // --- 仇恨伤害
            this._drawBookDetail_hatred(enemy, texts);
            // --- 战斗回合数，临界表
            await this._drawBookDetail_turnAndCriticals(enemy, floorId, texts);
        }

        ui.prototype._drawBookDetail_turnAndCriticals = async function (enemy, floorId, texts) {
            var damageInfo = core.getDamageInfo(enemy, null, null, null, floorId);
            texts.push(await generateTranslation("战斗回合数")+"："+((damageInfo||{}).turn||0));
            // 临界表
            var criticals = core.enemys.nextCriticals(enemy, 8, null, null, floorId).map(function (v) {
                return core.formatBigNumber(v[0])+":"+core.formatBigNumber(v[1]);
            });
            while (criticals[0]=='0:0') criticals.shift();
            texts.push("临界表："+JSON.stringify(criticals));
            var prevInfo = core.getDamageInfo(enemy, {atk: core.status.hero.atk-1}, null, null, floorId);
            if (prevInfo != null && damageInfo != null) {
                if (damageInfo.damage != null) damageInfo = damageInfo.damage;
                if (prevInfo.damage != null) prevInfo = prevInfo.damage;
                if (prevInfo > damageInfo) {
                    texts.push(await generateTranslation("(当前攻击力正位于临界点上)"));
                }
            }
        }

        ui.prototype._drawBookDetail_drawContent = async function (enemy, contents, pos) {
            // 名称
            core.setTextAlign('data', 'left');
            core.fillText('data', await generateTranslation(enemy.name), pos.content_left, pos.top + 30, '#FFD700', this._buildFont(22, true));
            var content_top = pos.top + 57;

            for (var i=0;i<contents.length;i++) {
                var text=contents[i];
                var index=text.indexOf("：");
                if (index>=0) {
                    var x1 = text.substring(0, index+1);
                    core.fillText('data', x1, pos.content_left, content_top, '#FF6A6A', this._buildFont(16, true));
                    var len=core.calWidth('data', x1);
                    core.fillText('data', text.substring(index+1), pos.content_left+len, content_top, '#FFFFFF', this._buildFont(16, false));
                }
                else {
                    core.fillText('data', contents[i], pos.content_left, content_top, '#FFFFFF', this._buildFont(16, false));
                }
                content_top+=24;
            }
        }

        ui.prototype._drawToolbox_drawDescription = async function (info, max_height) {
            core.setTextAlign('ui', 'left');
            if (!info.selectId) return;
            var item=core.material.items[info.selectId];
            core.fillText('ui', item.name, 10, 32, '#FFD700', this._buildFont(20, true))
            var text = item.text||"该道具暂无描述。";
            try {
                // 检查能否eval
                text = core.replaceText(text);
            } catch (e) {}
            if (text) {
                text = await generateTranslation(text);
            }

            for (var font_size = 17; font_size >= 14; font_size -= 3) {
                var lines = core.splitLines('ui', text, this.PIXEL - 15, this._buildFont(font_size, false));
                var line_height = parseInt(font_size * 1.4), curr = 37 + line_height;
                if (curr + lines.length * line_height < max_height) break;
            }
            core.setFillStyle('ui', '#FFFFFF');
            for (var i=0;i<lines.length;++i) {
                core.fillText('ui', lines[i], 10, curr);
                curr += line_height;
                if (curr>=max_height) break;
            }
            if (curr < max_height) {
                core.fillText('ui', await generateTranslation('<继续点击该道具即可进行使用>'), 10, curr, '#CCCCCC', this._buildFont(14, false));
            }
        }

        ui.prototype.drawToolbox = async function(index) {
            var info = this._drawToolbox_getInfo(index);
            this._drawToolbox_drawBackground();

            // 绘制线
            core.setAlpha('ui', 1);
            core.setStrokeStyle('ui', '#DDDDDD');
            core.canvas.ui.lineWidth = 2;
            core.canvas.ui.strokeWidth = 2;
            core.setTextAlign('ui', 'right');
            var line1 = this.PIXEL - 306;
            this._drawToolbox_drawLine(line1, await generateTranslation("消耗道具"));
            var line2 = this.PIXEL - 146;
            this._drawToolbox_drawLine(line2, await generateTranslation("永久道具"));

            core.setTextAlign('ui', 'left');
            await this._drawToolbox_drawDescription(info, line1);

            this._drawToolbox_drawContent(info, line1, info.tools, info.toolsPage, true);
            this.drawPagination(info.toolsPage, info.toolsTotalPage, this.LAST - 5);
            this._drawToolbox_drawContent(info, line2, info.constants, info.constantsPage);
            this.drawPagination(info.constantsPage, info.constantsTotalPage);

            core.setTextAlign('ui', 'center');
            core.fillText('ui', await generateTranslation("[装备栏]"), this.PIXEL - 46, 25, '#DDDDDD', this._buildFont(15, true));
            core.fillText('ui', await generateTranslation('返回游戏'), this.PIXEL - 46, this.PIXEL - 13);
        }


        ui.prototype._drawToolbox_drawDescription = async function (info, max_height) {
            if (!info.selectId) return;
            var item=core.material.items[info.selectId];
            core.fillText('ui', await generateTranslation(item.name), 10, 32, '#FFD700', this._buildFont(20, true))
            var text = item.text||"该道具暂无描述。";
            try {
                // 检查能否eval
                text = core.replaceText(text);
            } catch (e) {}
            if (text) {
                text = await generateTranslation(text);
            }

            for (var font_size = 17; font_size >= 14; font_size -= 3) {
                var lines = core.splitLines('ui', text, this.PIXEL - 15, this._buildFont(font_size, false));
                var line_height = parseInt(font_size * 1.4), curr = 37 + line_height;
                if (curr + lines.length * line_height < max_height) break;
            }
            core.setFillStyle('ui', '#FFFFFF');
            for (var i=0;i<lines.length;++i) {
                core.fillText('ui', lines[i], 10, curr);
                curr += line_height;
                if (curr>=max_height) break;
            }
            if (curr < max_height) {
                core.fillText('ui', await generateTranslation('<继续点击该道具即可进行使用>'), 10, curr, '#CCCCCC', this._buildFont(14, false));
            }
        }

        ui.prototype.drawEquipbox = async function(index) {
            var info = this._drawEquipbox_getInfo(index);
            this._drawToolbox_drawBackground();

            core.setAlpha('ui', 1);
            core.setStrokeStyle('ui', '#DDDDDD');
            core.canvas.ui.lineWidth = 2;
            core.canvas.ui.strokeWidth = 2;
            core.setTextAlign('ui', 'right');
            var line1 = this.PIXEL - 306;
            this._drawToolbox_drawLine(line1, await generateTranslation("当前装备"));
            var line2 = this.PIXEL - 146;
            this._drawToolbox_drawLine(line2, await generateTranslation("拥有装备"));
            await this._drawEquipbox_description(info, line1);

            this._drawEquipbox_drawEquiped(info, line1);
            this._drawToolbox_drawContent(info, line2, info.ownEquipment, info.page, true);
            this.drawPagination(info.page, info.totalPage);

            core.setTextAlign('ui', 'center');
            core.fillText('ui', await generateTranslation('[道具栏]'), this.PIXEL - 46, 25, '#DDDDDD', this._buildFont(15, true));
            core.fillText('ui', await generateTranslation('返回游戏'), this.PIXEL - 46, this.PIXEL - 13);
        }

        ui.prototype._drawEquipbox_description = async function (info, max_height) {
            core.setTextAlign('ui', 'left');
            if (!info.selectId) return;
            var equip=core.material.items[info.selectId];
            // --- 标题
            if (!equip.equip) equip.equip = {"type": 0};
            var equipType = equip.equip.type, equipString;
            if (typeof equipType === 'string') {
                equipString = await generateTranslation(equipType || "未知部位");
                equipType = core.items.getEquipTypeByName(equipType);
            }
            else equipString = await generateTranslation(info.allEquips[equipType] || "未知部位");
            core.fillText('ui', await generateTranslation(equip.name) + "（" + equipString + "）", 10, 32, '#FFD700', this._buildFont(20, true))
            // --- 描述
            var text = equip.text || "该装备暂无描述。";
            try {
                text = core.replaceText(text);
            } catch (e) {}
            if (text) {
                text = await generateTranslation(text);
            }

            for (var font_size = 17; font_size >= 11; font_size -= 3) {
                var lines = core.splitLines('ui', text, this.PIXEL - 15, this._buildFont(font_size, false));
                var line_height = parseInt(font_size * 1.4), curr = 37 + line_height;
                if (curr + lines.length * line_height < max_height) break;
            }
            core.setFillStyle('ui', '#FFFFFF');
            for (var i = 0; i < lines.length; ++i) {
                core.fillText('ui', lines[i], 10, curr);
                curr += line_height;
                if (curr >= max_height) break;
            }
            // --- 变化值
            if (curr >= max_height) return;
            this._drawEquipbox_drawStatusChanged(info, curr, equip, equipType);
        }

        ui.prototype._drawEquipbox_drawStatusChanged_draw = async function (text, color, obj) {
            text =  await generateTranslation(text);
            var len = core.calWidth('ui', text);
            if (obj.drawOffset + len >= core.__PIXELS__) { // 换行
                obj.y += 19;
                obj.drawOffset = 10;
            }
            core.fillText('ui', text, obj.drawOffset, obj.y, color);
            obj.drawOffset += len;
        }
    }, 3000);
});
