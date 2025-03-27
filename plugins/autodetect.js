/**
 * Autodetect the language live and change the `lang` attribute using the syntax highlighter's
 * autodetect capabilities. Works with highlight.js only.
 * Files: autodetect.js
 */
codeInput.plugins.Autodetect = class extends codeInput.Plugin {
    constructor() {
        super([]); // No observed attributes
    }

    multipleInstancesCanBeAdded() { return false; } // Adding multiple instances wouldn't make sense
    canBeAddedAndRemoved() { return true; }

    onAdd(codeInput) {
        // Allow autodetection
        codeInput.removeAttribute("language");
        codeInput.removeAttribute("lang");
    }
    onRemove(codeInput) {
        // Removing the language attribute here will cause more problems than not,
        // especially if the calling code directly sets the language just before.
        // Therefore, the language is kept as-is and the calling code can remove
        // the language itself it wanted.
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
        lang = lang.split("-")[1];
        if(lang == "undefined") {
            codeInput.removeAttribute("language");
            codeInput.removeAttribute("lang");
        } else {
            codeInput.setAttribute("language", lang);
        }
    }
}
