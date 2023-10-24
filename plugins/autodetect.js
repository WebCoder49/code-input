/**
 * Autodetect the language live and change the `lang` attribute using the syntax highlighter's 
 * autodetect capabilities. Works with highlight.js only.
 * Files: autodetect.js
 */
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
    /* Get new language class and set `lang` attribute */
    afterHighlight(codeInput) {
        let resultElement = codeInput.codeElement;
        let langClass = resultElement.className || resultElement.parentElement.className;
        let lang = langClass.match(/lang(\w|-)*/i)[0]; // Get word starting with lang...; Get outer bracket
        lang = lang.split("-")[1];
        if(lang == "undefined") {
            codeInput.removeAttribute("lang");
        } else {
            codeInput.setAttribute("lang", lang);
        }
    }
}