/**
 * Autodetect the language live and change the `lang` attribute using the syntax highlighter's 
 * autodetect capabilities. Works with highlight.js.
 */
codeInput.plugins.Autodetect = class extends codeInput.Plugin {
    constructor() {
        super();
    }
    /* Remove previous language class */
    beforeHighlight(codeInput) {
        let result_element = codeInput.querySelector("pre code");
        result_element.className = ""; // CODE
        result_element.parentElement.className = ""; // PRE
    }
    /* Get new language class and set `lang` attribute */
    afterHighlight(codeInput) {
        let result_element = codeInput.querySelector("pre code");
        let lang_class = result_element.className || result_element.parentElement.className;
        let lang = lang_class.match(/lang(\w|-)*/i)[0]; // Get word starting with lang...; Get outer bracket
        lang = lang.split("-")[1];
        if(lang == "undefined") {
            codeInput.removeAttribute("lang");
        } else {
            codeInput.setAttribute("lang", lang);
        }
    }
    observedAttributes = []
}