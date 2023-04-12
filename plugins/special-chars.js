/**
 * Render special characters as a symbol with their hex code.
 * Files: special-chars.js, special-chars.css
 */
codeInput.plugins.SpecialChars = class extends codeInput.Plugin {
    specialCharRegExp;

    /**
     * Create a special characters plugin instance
     * @param {RegExp} specialCharRegExp The regular expression which matches special characters
     */
    constructor(specialCharRegExp = /(?!\n)(?!\t)[\u{0000}-\u{001F}]|[\u{0080}-\u{FFFF}]/ug) { // By default, covers many non-renderable ASCII characters
        super();
        this.specialCharRegExp = specialCharRegExp;
    }

    /* Runs after code is highlighted; Params: codeInput element) */
    afterHighlight(codeInput) {        
        let result_element = codeInput.querySelector("pre code");

        console.log("Text", result_element.innerHTML);

        result_element.innerHTML = result_element.innerHTML.replaceAll(this.specialCharRegExp, this.specialCharReplacer);
    }

    specialCharReplacer(match_char, _match_char, index, whole_string, groups) {
        let hex_code = match_char.codePointAt(0).toString(16);
        hex_code = ("0000" + hex_code).substring(hex_code.length);
        hex_code = hex_code.toUpperCase();
        console.log(match_char, hex_code);
        return `<span class='code-input_special-char' data-top='${hex_code.substr(0, 2)}' data-bottom='${hex_code.substr(2, 2)}'> </span>`;
    }
    
}