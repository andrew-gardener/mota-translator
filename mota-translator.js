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
// @require      https://cdn.jsdelivr.net/npm/translate@1/translate.js
// ==/UserScript==

// browserify version of https://github.com/cjrsgu/google-translate-api-browser along with setup code
// const google_translate_api_browser = require("google-translate-api-browser");
// window.translate = google_translate_api_browser.setCORS("https://cors-anywhere.herokuapp.com/");
!function(){var e,t,n=(e=function(e,t){"use strict";e.exports=d.isStandardBrowserEnv()?{write:function(e,t,n,r,o,a){var i=[];i.push(e+"="+encodeURIComponent(t)),d.isNumber(n)&&i.push("expires="+new Date(n).toGMTString()),d.isString(r)&&i.push("path="+r),d.isString(o)&&i.push("domain="+o),!0===a&&i.push("secure"),document.cookie=i.join("; ")},read:function(e){var t=document.cookie.match(new RegExp("(^|;\\s*)("+e+")=([^;]*)"));return t?decodeURIComponent(t[3]):null},remove:function(e){this.write(e,"",Date.now()-864e5)}}:{write:function(){},read:function(){return null},remove:function(){}}},function(n){return t||e(t={exports:{},parent:n},t.exports),t.exports});Array.isArray;var r=function(e){switch(typeof e){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return""}},o=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};function a(e,t){if(e.map)return e.map(t);for(var n=[],r=0;r<e.length;r++)n.push(t(e[r],r));return n}var i=Object.keys||function(e){var t=[];for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.push(n);return t},s={stringify:function(e,t,n,s){return t=t||"&",n=n||"=",null===e&&(e=void 0),"object"==typeof e?a(i(e),(function(i){var s=encodeURIComponent(r(i))+n;return o(e[i])?a(e[i],(function(e){return s+encodeURIComponent(r(e))})).join(t):s+encodeURIComponent(r(e[i]))})).join(t):s?encodeURIComponent(r(s))+n+encodeURIComponent(r(e)):""}},u=function(e,t){return function(){for(var n=new Array(arguments.length),r=0;r<n.length;r++)n[r]=arguments[r];return e.apply(t,n)}},c=Object.prototype.toString;function f(e){return"[object Array]"===c.call(e)}function l(e){return null!==e&&"object"==typeof e}function h(e,t){if(null!=e)if("object"!=typeof e&&(e=[e]),f(e))for(var n=0,r=e.length;n<r;n++)t.call(null,e[n],n,e);else for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.call(null,e[o],o,e)}var d={isArray:f,isArrayBuffer:function(e){return"[object ArrayBuffer]"===c.call(e)},isBuffer:function(e){return null!=e&&null!=e.constructor&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)},isFormData:function(e){return"undefined"!=typeof FormData&&e instanceof FormData},isArrayBufferView:function(e){return"undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&e.buffer instanceof ArrayBuffer},isString:function(e){return"string"==typeof e},isNumber:function(e){return"number"==typeof e},isObject:l,isUndefined:function(e){return void 0===e},isDate:function(e){return"[object Date]"===c.call(e)},isFile:function(e){return"[object File]"===c.call(e)},isBlob:function(e){return"[object Blob]"===c.call(e)},isStream:function(e){return l(e)&&function(e){return"[object Function]"===c.call(e)}(e.pipe)},isURLSearchParams:function(e){return"undefined"!=typeof URLSearchParams&&e instanceof URLSearchParams},isStandardBrowserEnv:function(){return("undefined"==typeof navigator||"ReactNative"!==navigator.product)&&"undefined"!=typeof window&&"undefined"!=typeof document},forEach:h,merge:function e(){var t={};function n(n,r){"object"==typeof t[r]&&"object"==typeof n?t[r]=e(t[r],n):t[r]=n}for(var r=0,o=arguments.length;r<o;r++)h(arguments[r],n);return t},extend:function(e,t,n){return h(t,(function(t,r){e[r]=n&&"function"==typeof t?u(t,n):t})),e},trim:function(e){return e.replace(/^\s*/,"").replace(/\s*$/,"")}},p=function(e,t,n,r,o){return function(e,t,n,r,o){return e.config=t,n&&(e.code=n),e.request=r,e.response=o,e}(new Error(e),t,n,r,o)};function m(e){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}var g,y,v,w=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"],b=d.isStandardBrowserEnv()?function(){var e,t=/(msie|trident)/i.test(navigator.userAgent),n=document.createElement("a");function r(e){var r=e;return t&&(n.setAttribute("href",r),r=n.href),n.setAttribute("href",r),{href:n.href,protocol:n.protocol?n.protocol.replace(/:$/,""):"",host:n.host,search:n.search?n.search.replace(/^\?/,""):"",hash:n.hash?n.hash.replace(/^#/,""):"",hostname:n.hostname,port:n.port,pathname:"/"===n.pathname.charAt(0)?n.pathname:"/"+n.pathname}}return e=r(window.location.href),function(t){var n=d.isString(t)?r(t):t;return n.protocol===e.protocol&&n.host===e.host}}():function(){return!0},C=function(e){return new Promise((function(r,o){var a=e.data,i=e.headers;d.isFormData(a)&&delete i["Content-Type"];var s=new XMLHttpRequest;if(e.auth){var u=e.auth.username||"",c=e.auth.password||"";i.Authorization="Basic "+btoa(u+":"+c)}if(s.open(e.method.toUpperCase(),function(e,t,n){if(!t)return e;var r;if(n)r=n(t);else if(d.isURLSearchParams(t))r=t.toString();else{var o=[];d.forEach(t,(function(e,t){null!=e&&(d.isArray(e)?t+="[]":e=[e],d.forEach(e,(function(e){d.isDate(e)?e=e.toISOString():d.isObject(e)&&(e=JSON.stringify(e)),o.push(m(t)+"="+m(e))})))})),r=o.join("&")}return r&&(e+=(-1===e.indexOf("?")?"?":"&")+r),e}(e.url,e.params,e.paramsSerializer),!0),s.timeout=e.timeout,s.onreadystatechange=function(){if(s&&4===s.readyState&&(0!==s.status||s.responseURL&&0===s.responseURL.indexOf("file:"))){var t="getAllResponseHeaders"in s?(a=s.getAllResponseHeaders(),f={},a?(d.forEach(a.split("\n"),(function(e){if(c=e.indexOf(":"),i=d.trim(e.substr(0,c)).toLowerCase(),u=d.trim(e.substr(c+1)),i){if(f[i]&&w.indexOf(i)>=0)return;f[i]="set-cookie"===i?(f[i]?f[i]:[]).concat([u]):f[i]?f[i]+", "+u:u}})),f):f):null,n={data:e.responseType&&"text"!==e.responseType?s.response:s.responseText,status:s.status,statusText:s.statusText,headers:t,config:e,request:s};(function(e,t,n){var r=n.config.validateStatus;n.status&&r&&!r(n.status)?t(p("Request failed with status code "+n.status,n.config,null,n.request,n)):e(n)})(r,o,n),s=null}var a,i,u,c,f},s.onerror=function(){o(p("Network Error",e,null,s)),s=null},s.ontimeout=function(){o(p("timeout of "+e.timeout+"ms exceeded",e,"ECONNABORTED",s)),s=null},d.isStandardBrowserEnv()){var f=n({}),l=(e.withCredentials||b(e.url))&&e.xsrfCookieName?f.read(e.xsrfCookieName):void 0;l&&(i[e.xsrfHeaderName]=l)}if("setRequestHeader"in s&&d.forEach(i,(function(e,t){void 0===a&&"content-type"===t.toLowerCase()?delete i[t]:s.setRequestHeader(t,e)})),e.withCredentials&&(s.withCredentials=!0),e.responseType)try{s.responseType=e.responseType}catch(t){if("json"!==e.responseType)throw t}"function"==typeof e.onDownloadProgress&&s.addEventListener("progress",e.onDownloadProgress),"function"==typeof e.onUploadProgress&&s.upload&&s.upload.addEventListener("progress",e.onUploadProgress),e.cancelToken&&e.cancelToken.promise.then((function(e){s&&(s.abort(),o(e),s=null)})),void 0===a&&(a=null),s.send(a)}))},S=g={};function T(){throw new Error("setTimeout has not been defined")}function A(){throw new Error("clearTimeout has not been defined")}function E(e){if(y===setTimeout)return setTimeout(e,0);if((y===T||!y)&&setTimeout)return y=setTimeout,setTimeout(e,0);try{return y(e,0)}catch(t){try{return y.call(null,e,0)}catch(t){return y.call(this,e,0)}}}!function(){try{y="function"==typeof setTimeout?setTimeout:T}catch(t){y=T}try{v="function"==typeof clearTimeout?clearTimeout:A}catch(t){v=A}}();var j,x=[],R=!1,k=-1;function B(){R&&j&&(R=!1,j.length?x=j.concat(x):k=-1,x.length&&O())}function O(){if(!R){var e=E(B);R=!0;for(var n=x.length;n;){for(j=x,x=[];++k<n;)j&&j[k].run();k=-1,n=x.length}j=null,R=!1,function(e){if(v===clearTimeout)return clearTimeout(e);if((v===A||!v)&&clearTimeout)return v=clearTimeout,clearTimeout(e);try{v(e)}catch(t){try{return v.call(null,e)}catch(t){return v.call(this,e)}}}(e)}}function L(e,t){this.fun=e,this.array=t}function U(){}S.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];x.push(new L(e,t)),1!==x.length||R||E(O)},L.prototype.run=function(){this.fun.apply(null,this.array)},S.title="browser",S.browser=!0,S.env={},S.argv=[],S.version="",S.versions={},S.on=U,S.addListener=U,S.once=U,S.off=U,S.removeListener=U,S.removeAllListeners=U,S.emit=U,S.prependListener=U,S.prependOnceListener=U,S.listeners=function(e){return[]},S.binding=function(e){throw new Error("process.binding is not supported")},S.cwd=function(){return"/"},S.chdir=function(e){throw new Error("process.chdir is not supported")},S.umask=function(){return 0};var P={};(function(e){"use strict";var n={"Content-Type":"application/x-www-form-urlencoded"};function r(e,t){!d.isUndefined(e)&&d.isUndefined(e["Content-Type"])&&(e["Content-Type"]=t)}var o,a={adapter:(("undefined"!=typeof XMLHttpRequest||void 0!==e)&&(o=C),o),transformRequest:[function(e,t){return function(e,t){d.forEach(e,(function(n,r){r!==t&&r.toUpperCase()===t.toUpperCase()&&(e[t]=n,delete e[r])}))}(t,"Content-Type"),d.isFormData(e)||d.isArrayBuffer(e)||d.isBuffer(e)||d.isStream(e)||d.isFile(e)||d.isBlob(e)?e:d.isArrayBufferView(e)?e.buffer:d.isURLSearchParams(e)?(r(t,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):d.isObject(e)?(r(t,"application/json;charset=utf-8"),JSON.stringify(e)):e}],transformResponse:[function(e){if("string"==typeof e)try{e=JSON.parse(e)}catch(t){}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,validateStatus:function(e){return e>=200&&e<300},headers:{common:{Accept:"application/json, text/plain, */*"}}};d.forEach(["delete","get","head"],(function(e){a.headers[e]={}})),d.forEach(["post","put","patch"],(function(e){a.headers[e]=d.merge(n)})),P=a}).call(this,g);var N={};function q(){this.handlers=[]}q.prototype.use=function(e,t){return this.handlers.push({fulfilled:e,rejected:t}),this.handlers.length-1},q.prototype.eject=function(e){this.handlers[e]&&(this.handlers[e]=null)},q.prototype.forEach=function(e){d.forEach(this.handlers,(function(t){null!==t&&e(t)}))},N=q;var _=function(e,t,n){return d.forEach(n,(function(n){e=n(e,t)})),e},M=function(e){return!(!e||!e.__CANCEL__)};function D(e){e.cancelToken&&e.cancelToken.throwIfRequested()}var F=function(e){return D(e),e.baseURL&&(r=e.url,!/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(r))&&(e.url=(t=e.baseURL,(n=e.url)?t.replace(/\/+$/,"")+"/"+n.replace(/^\/+/,""):t)),e.headers=e.headers||{},e.data=_(e.data,e.headers,e.transformRequest),e.headers=d.merge(e.headers.common||{},e.headers[e.method]||{},e.headers||{}),d.forEach(["delete","get","head","post","put","patch","common"],(function(t){delete e.headers[t]})),(e.adapter||P.adapter)(e).then((function(t){return D(e),t.data=_(t.data,t.headers,e.transformResponse),t}),(function(t){return M(t)||(D(e),t&&t.response&&(t.response.data=_(t.response.data,t.response.headers,e.transformResponse))),Promise.reject(t)}));var t,n,r},z={};function H(e){this.defaults=e,this.interceptors={request:new N,response:new N}}H.prototype.request=function(e){"string"==typeof e&&(e=d.merge({url:arguments[0]},arguments[1])),(e=d.merge(P,{method:"get"},this.defaults,e)).method=e.method.toLowerCase();var t=[F,void 0],n=Promise.resolve(e);for(this.interceptors.request.forEach((function(e){t.unshift(e.fulfilled,e.rejected)})),this.interceptors.response.forEach((function(e){t.push(e.fulfilled,e.rejected)}));t.length;)n=n.then(t.shift(),t.shift());return n},d.forEach(["delete","get","head","options"],(function(e){H.prototype[e]=function(t,n){return this.request(d.merge(n||{},{method:e,url:t}))}})),d.forEach(["post","put","patch"],(function(e){H.prototype[e]=function(t,n,r){return this.request(d.merge(r||{},{method:e,url:t,data:n}))}})),z=H;var I={};function K(e){this.message=e}K.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")},K.prototype.__CANCEL__=!0,I=K;var G;function J(e){if("function"!=typeof e)throw new TypeError("executor must be a function.");var t;this.promise=new Promise((function(e){t=e}));var n=this;e((function(e){n.reason||(n.reason=new I(e),t(n.reason))}))}J.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},J.source=function(){var e;return{token:new J((function(t){e=t})),cancel:e}},G=J;var X={};function Y(e){var t=new z(e),n=u(z.prototype.request,t);return d.extend(n,z.prototype,t),d.extend(n,t),n}var V=Y(P);V.Axios=z,V.create=function(e){return Y(d.merge(P,e))},V.Cancel=I,V.CancelToken=G,V.isCancel=M,V.all=function(e){return Promise.all(e)},V.spread=function(e){return function(t){return e.apply(null,t)}},(X=V).default=V;var $=X,W={};Object.defineProperty(W,"__esModule",{value:!0}),W.default=function(e){for(var t=[],n=0,r=0;r<e.length;r++){var o=e.charCodeAt(r);128>o?t[n++]=o:(2048>o?t[n++]=o>>6|192:(55296==(64512&o)&&r+1<e.length&&56320==(64512&e.charCodeAt(r+1))?(o=65536+((1023&o)<<10)+(1023&e.charCodeAt(++r)),t[n++]=o>>18|240,t[n++]=o>>12&63|128):t[n++]=o>>12|224,t[n++]=o>>6&63|128),t[n++]=63&o|128)}var a=0;for(n=0;n<t.length;n++)a+=t[n],a=Q(a,"+-a^+6");return a=Q(a,"+-3^+b+-f"),0>(a^=0)&&(a=2147483648+(2147483647&a)),(a%=1e6).toString()+"."+a.toString()};var Q=function(e,t){for(var n=0;n<t.length-2;n+=3){var r=t.charAt(n+2);r="a"<=r?r.charCodeAt(0)-87:Number(r),r="+"==t.charAt(n+1)?e>>>r:e<<r,e="+"==t.charAt(n)?e+r:e^r}return e},Z={};Object.defineProperty(Z,"__esModule",{value:!0});var ee={auto:"Automatic",af:"Afrikaans",sq:"Albanian",am:"Amharic",ar:"Arabic",hy:"Armenian",az:"Azerbaijani",eu:"Basque",be:"Belarusian",bn:"Bengali",bs:"Bosnian",bg:"Bulgarian",ca:"Catalan",ceb:"Cebuano",ny:"Chichewa",zh:"Chinese Simplified","zh-cn":"Chinese Simplified","zh-tw":"Chinese Traditional",co:"Corsican",hr:"Croatian",cs:"Czech",da:"Danish",nl:"Dutch",en:"English",eo:"Esperanto",et:"Estonian",tl:"Filipino",fi:"Finnish",fr:"French",fy:"Frisian",gl:"Galician",ka:"Georgian",de:"German",el:"Greek",gu:"Gujarati",ht:"Haitian Creole",ha:"Hausa",haw:"Hawaiian",he:"Hebrew",iw:"Hebrew",hi:"Hindi",hmn:"Hmong",hu:"Hungarian",is:"Icelandic",ig:"Igbo",id:"Indonesian",ga:"Irish",it:"Italian",ja:"Japanese",jw:"Javanese",kn:"Kannada",kk:"Kazakh",km:"Khmer",ko:"Korean",ku:"Kurdish (Kurmanji)",ky:"Kyrgyz",lo:"Lao",la:"Latin",lv:"Latvian",lt:"Lithuanian",lb:"Luxembourgish",mk:"Macedonian",mg:"Malagasy",ms:"Malay",ml:"Malayalam",mt:"Maltese",mi:"Maori",mr:"Marathi",mn:"Mongolian",my:"Myanmar (Burmese)",ne:"Nepali",no:"Norwegian",ps:"Pashto",fa:"Persian",pl:"Polish",pt:"Portuguese",pa:"Punjabi",ro:"Romanian",ru:"Russian",sm:"Samoan",gd:"Scots Gaelic",sr:"Serbian",st:"Sesotho",sn:"Shona",sd:"Sindhi",si:"Sinhala",sk:"Slovak",sl:"Slovenian",so:"Somali",es:"Spanish",su:"Sundanese",sw:"Swahili",sv:"Swedish",tg:"Tajik",ta:"Tamil",te:"Telugu",th:"Thai",tr:"Turkish",uk:"Ukrainian",ur:"Urdu",uz:"Uzbek",vi:"Vietnamese",cy:"Welsh",xh:"Xhosa",yi:"Yiddish",yo:"Yoruba",zu:"Zulu"};Z.getCode=function(e){return!!e&&(e=e.toLowerCase(),ee[e]?e:Object.keys(ee).filter((function(t){return"string"==typeof ee[t]&&ee[t].toLowerCase()===e}))[0]||!1)},Z.isSupported=function(e){return Boolean(Z.getCode(e))};var te={},ne=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(te,"__esModule",{value:!0});var re=ne($),oe=ne(W),ae="";function ie(e,t){void 0===t&&(t={});var n={from:t.from||"auto",to:t.to||"en",raw:t.raw||!1,tld:t.tld||"com"},r=null;return[n.from,n.to].forEach((function(e){e&&!Z.isSupported(e)&&((r=new Error).message="The language '"+e+"' is not supported")})),r?new Promise((function(e,t){t(r)})):function(e){return new Promise((function(t){t({name:"tk",value:oe.default(e)})}))}(e).then((function(t){var r,o="https://translate.google."+n.tld+"/translate_a/single",a=((r={client:"gtx",sl:Z.getCode(n.from),tl:Z.getCode(n.to),hl:Z.getCode(n.to),dt:["at","bd","ex","ld","md","qca","rw","rm","ss","t"],ie:"UTF-8",oe:"UTF-8",otf:1,ssel:0,tsel:0,kc:7,q:e})[t.name]=t.value,r);return o+"?"+s.stringify(a)})).then((function(e){return re.default.get(ae+e).then((function(e){var t={body:JSON.stringify(e.data)},r={text:"",pronunciation:"",from:{language:{didYouMean:!1,iso:""},text:{autoCorrected:!1,value:"",didYouMean:!1}},raw:n.raw?t.body:""},o=JSON.parse(t.body);if(o[0].forEach((function(e){e[0]?r.text+=e[0]:e[2]&&(r.pronunciation+=e[2])})),o[2]===o[8][0][0]?r.from.language.iso=o[2]:(r.from.language.didYouMean=!0,r.from.language.iso=o[8][0][0]),o[7]&&o[7][0]){var a=o[7][0];a=(a=a.replace(/<b><i>/g,"[")).replace(/<\/i><\/b>/g,"]"),r.from.text.value=a,!0===o[7][5]?r.from.text.autoCorrected=!0:r.from.text.didYouMean=!0}return r})).catch((function(e){var t=new Error;throw void 0!==e.statusCode&&200!==e.statusCode?t.message="BAD_REQUEST":t.message="BAD_NETWORK",t}))}))}te.setCORS=function(e){return ae=e,ie},window.translate=te.setCORS("https://cors-anywhere.herokuapp.com/")}();

$(function(){
    'use strict';

    let localStorage = window.localStorage,
        textPoints = [],
        currentTranslationMenuItem = null,
        currentLogTranslationMenuItem = null;

    let logTranslation = GM_getValue("logTranslation", "true") === 'false';

    const updateScriptMenu = function() {
        if (currentTranslationMenuItem) { GM_unregisterMenuCommand(currentTranslationMenuItem); }
        if (currentLogTranslationMenuItem) { GM_unregisterMenuCommand(currentLogTranslationMenuItem); }

        currentLogTranslationMenuItem = GM_registerMenuCommand(logTranslation ? "Stop Logging Canvas Translation To Console" : "Log Canvas Translation To Console", function() {
            logTranslation = !logTranslation;
            GM_setValue("logTranslation", logTranslation ? 'true' : 'false');
            GM_unregisterMenuCommand(currentLogTranslationMenuItem);
            updateScriptMenu();
        });
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

    const generateTranslation = async function(text) {
        if (logTranslation && console && console.log) {
            console.log("generateTranslation", text);
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
        // \$\{[[^\}]*\} will work for examples: ${5 flag:shop_times}
        while (match = /\$\{[^\}]*\}/i.exec(text)) {
            const key = '$|'+ Object.keys(textFlags).length + '|$';
            textFlags[key] = match[0];
            //console.log("match[0]: ", textFlags[key]);
            text = text.replace(textFlags[key], key);
        }

        // translate the text
        let result = await window.translate(text, {
            from: 'zh-CN',
            to: 'en',
            browers: true,
        });

        console.log('result', result);
        translatedText = result.text;

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
        ui.prototype.drawTip = async function(text, id) {
            const translatedText = await generateTranslation(text);
            return await this._old_drawTip(translatedText, id);
        };

        ui.prototype._old_drawTextBox = ui.prototype.drawTextBox;
        ui.prototype.drawTextBox = async function(content, showAll) {
            const translatedText = await generateTranslation(content);
            return await this._old_drawTextBox(translatedText, showAll);
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
            return await this._old_drawChoices(translatedText, choices);
        }

        ui.prototype._old_drawScrollText = ui.prototype.drawScrollText;
        ui.prototype.drawScrollText = async function (content, time, lineHeight, callback) {
            const translatedText = await generateTranslation(content);
            return await this._old_drawScrollText(translatedText, time, lineHeight, callback);
        }

        ui.prototype._old_drawConfirmBox = ui.prototype.drawConfirmBox;
        ui.prototype.drawConfirmBox = async function (text, yesCallback, noCallback) {
            const translatedText = await generateTranslation(text);
            return await this._old_drawConfirmBox(translatedText, yesCallback, noCallback);

        }

        ui.prototype._old_drawWaiting = ui.prototype.drawWaiting;
        ui.prototype.drawWaiting = async function(text) {
            const translatedText = await generateTranslation(text);
            return await this._old_drawWaiting(translatedText);
        }

        ui.prototype._old_fillText = ui.prototype.fillText;
        ui.prototype.fillText = function (name, text, x, y, style, font, maxWidth) {
            // only use asyncfillText function if its actually needed
            // doing this should improve compatability
            if (!checkIfNeedsTranslation(text)) {
                return this._old_fillText(name, text, x, y, style, font, maxWidth);
            } else {
                return this.asyncfillText(name, text, x, y, style, font, maxWidth);
            }
        }
        ui.prototype.asyncfillText = async function (name, text, x, y, style, font, maxWidth) {
            const translatedText = await generateTranslation(text);
            return await this._old_fillText(name, translatedText, x, y, style, font, maxWidth);
        }

        ui.prototype._old_fillBoldText = ui.prototype.fillBoldText;
        ui.prototype.fillBoldText = function (name, text, x, y, style, font) {
            // only use asyncfillBoldText function if its actually needed
            // doing this should improve compatability
            if (!checkIfNeedsTranslation(text)) {
                return this._old_fillBoldText(name, text, x, y, style, font);
            } else {
                return this.asyncfillBoldText(name, text, x, y, style, font);
            }
        }
        ui.prototype.asyncfillBoldText = async function (name, text, x, y, style, font) {
            const translatedText = await generateTranslation(text);
            return await this._old_fillBoldText(name, translatedText, x, y, style, font);
        }

        //ui.prototype._old_drawTextContent = ui.prototype.drawTextContent;
        //ui.prototype.drawTextContent = async function (ctx, content, config) {
        //    console.log('drawTextContent', content)
        //    const translatedText = await generateTranslation(content);
        //    return await this._old_drawTextContent(ctx, content, config);
        //}
    }, 3000);
});
