/**
 * Autodetect the language live and change the `lang` attribute using the syntax highlighter's 
 * autodetect capabilities. Works with highlight.js only.
 * Files: autodetect.js
 */
"use strict";

codeInput.plugins.Autodetect = class extends codeInput.Plugin {
    constructor() {
        super([]); // No observed attributes
    }
    /* Remove previous language class */
    beforeHighlight(codeInput) {
        let resultElement = codeInput.codeElement;
        resultElement.className = ""; // CODE
        resultElement.parentElement.className = ""; // PRE
    }
    /* Get new language class and set `language` attribute */
    afterHighlight(codeInput) {
        let langClass = codeInput.codeElement.className || codeInput.preElement.className;
        let lang = langClass.match(/lang(\w|-)*/i)[0]; // Get word starting with lang...; Get outer bracket
        lang = lang.match(/(?<=-)(\w|-)*/i)[0];
        if(lang == "undefined") {
            codeInput.removeAttribute("language");
            codeInput.removeAttribute("lang");
        } else {
            codeInput.setAttribute("language", lang);
        }
    }
}
