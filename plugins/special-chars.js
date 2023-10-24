/**
 * Render special characters and control characters as a symbol with their hex code.
 * Files: special-chars.js, special-chars.css
 */

codeInput.plugins.SpecialChars = class extends codeInput.Plugin {
    specialCharRegExp;

    cachedColors; // ascii number > [background color, text color]
    cachedWidths; // font > {character > character width}
    canvasContext;

    /**
     * Create a special characters plugin instance.
     * Default = covers many non-renderable ASCII characters.
     * @param {Boolean} colorInSpecialChars Whether or not to give special characters custom background colors based on their hex code
     * @param {Boolean} inheritTextColor If `colorInSpecialChars` is false, forces the color of the hex code to inherit from syntax highlighting. Otherwise, the base colour of the `pre code` element is used to give contrast to the small characters.
     * @param {RegExp} specialCharRegExp The regular expression which matches special characters
     */
    constructor(colorInSpecialChars = false, inheritTextColor = false, specialCharRegExp = /(?!\n)(?!\t)[\u{0000}-\u{001F}]|[\u{007F}-\u{009F}]|[\u{0200}-\u{FFFF}]/ug) { // By default, covers many non-renderable ASCII characters
        super([]); // No observed attributes
        
        this.specialCharRegExp = specialCharRegExp;
        this.colorInSpecialChars = colorInSpecialChars;
        this.inheritTextColor = inheritTextColor;

        this.cachedColors = {};
        this.cachedWidths = {};

        let canvas = document.createElement("canvas");
        this.canvasContext = canvas.getContext("2d");
    }

    /* Runs before elements are added into a `code-input`; Params: codeInput element) */
    beforeElementsAdded(codeInput) {
        codeInput.classList.add("code-input_special-char_container");
    }

    /* Runs after elements are added into a `code-input` (useful for adding events to the textarea); Params: codeInput element) */
    afterElementsAdded(codeInput) {
        // For some reason, special chars aren't synced the first time - TODO is there a cleaner way to do this?
        setTimeout(() => { codeInput.update(codeInput.value); }, 100);
    }

    /* Runs after code is highlighted; Params: codeInput element) */
    afterHighlight(codeInput) {      
        let result_element = codeInput.querySelector("pre code");

        // Reset data each highlight so can change if font size, etc. changes
        codeInput.pluginData.specialChars = {};
        codeInput.pluginData.specialChars.textarea = codeInput.getElementsByTagName("textarea")[0];
        codeInput.pluginData.specialChars.contrastColor = window.getComputedStyle(result_element).color;

        this.recursivelyReplaceText(codeInput, result_element);

        this.lastFont = window.getComputedStyle(codeInput.pluginData.specialChars.textarea).font;
    }

    recursivelyReplaceText(codeInput, element) {
        for(let i = 0; i < element.childNodes.length; i++) {

            let nextNode = element.childNodes[i];
            if(nextNode.nodeName == "#text" && nextNode.nodeValue != "") {
                // Replace in here
                let oldValue = nextNode.nodeValue;

                this.specialCharRegExp.lastIndex = 0;
                let searchResult = this.specialCharRegExp.exec(oldValue);
                if(searchResult != null) {
                    let charIndex = searchResult.index; // Start as returns end

                    nextNode = nextNode.splitText(charIndex+1).previousSibling;
                    
                    if(charIndex > 0) {
                        nextNode = nextNode.splitText(charIndex); // Keep those before in difft. span
                    }

                    if(nextNode.textContent != "") {
                        let replacementElement = this.specialCharReplacer(codeInput, nextNode.textContent);
                        nextNode.parentNode.insertBefore(replacementElement, nextNode);
                        nextNode.textContent = "";
                    }
                }
            } else if(nextNode.nodeType == 1) {
                if(nextNode.className != "code-input_special-char" && nextNode.nodeValue != "") {
                    // Element - recurse
                    this.recursivelyReplaceText(codeInput, nextNode);
                }
            }
        }
    }

    specialCharReplacer(codeInput, match_char) {
        let hex_code = match_char.codePointAt(0);

        let colors;
        if(this.colorInSpecialChars) colors = this.getCharacterColor(hex_code);

        hex_code = hex_code.toString(16);
        hex_code = ("0000" + hex_code).substring(hex_code.length); // So 2 chars with leading 0
        hex_code = hex_code.toUpperCase();

        let char_width = this.getCharacterWidth(codeInput, match_char);

        // Create element with hex code
        let result = document.createElement("span");
        result.classList.add("code-input_special-char");
        result.style.setProperty("--hex-0",  "var(--code-input_special-chars_" + hex_code[0] + ")");
        result.style.setProperty("--hex-1",  "var(--code-input_special-chars_" + hex_code[1] + ")");
        result.style.setProperty("--hex-2",  "var(--code-input_special-chars_" + hex_code[2] + ")");
        result.style.setProperty("--hex-3",  "var(--code-input_special-chars_" + hex_code[3] + ")");
        
        // Handle zero-width chars
        if(char_width == 0) result.classList.add("code-input_special-char_zero-width");
        else result.style.width = char_width + "px";

        if(this.colorInSpecialChars) {
            result.style.backgroundColor = "#" + colors[0];
            result.style.setProperty("--code-input_special-char_color", colors[1]);
        } else if(!this.inheritTextColor) {
            result.style.setProperty("--code-input_special-char_color", codeInput.pluginData.specialChars.contrastColor);
        }
        return result;
    }
    
    getCharacterColor(ascii_code) {
        // Choose colors based on character code - lazy load and return [background color, text color]
        let background_color;
        let text_color;
        if(!(ascii_code in this.cachedColors)) {
            // Get background color - arbitrary bit manipulation to get a good range of colours
            background_color = ascii_code^(ascii_code << 3)^(ascii_code << 7)^(ascii_code << 14)^(ascii_code << 16); // Arbitrary
            background_color = background_color^0x1fc627; // Arbitrary
            background_color = background_color.toString(16);
            background_color = ("000000" + background_color).substring(background_color.length); // So 6 chars with leading 0

            // Get most suitable text color - white or black depending on background brightness
            let color_brightness = 0;
            let luminance_coefficients = [0.299, 0.587, 0.114];
            for(let i = 0; i < 6; i += 2) {
                color_brightness += parseInt(background_color.substring(i, i+2), 16) * luminance_coefficients[i/2];
            }
            // Calculate darkness
            text_color = color_brightness < 128 ? "white" : "black";

            this.cachedColors[ascii_code] = [background_color, text_color];
            return [background_color, text_color];
        } else {
            return this.cachedColors[ascii_code];
        }
    }

    getCharacterWidth(codeInput, char) {
        // Force zero-width characters
        if(new RegExp("\u00AD|\u02de|[\u0300-\u036F]|[\u0483-\u0489]|\u200b").test(char) ) { return 0 }
        // Non-renderable ASCII characters should all be rendered at same size
        if(char != "\u0096" && new RegExp("[\u{0000}-\u{001F}]|[\u{007F}-\u{009F}]", "g").test(char)) {
            let fallbackWidth = this.getCharacterWidth("\u0096");
            return fallbackWidth;
        }

        let font = window.getComputedStyle(codeInput.pluginData.specialChars.textarea).font;

        // Lazy-load - TODO: Get a cleaner way of doing this
        if(this.cachedWidths[font] == undefined) {
            this.cachedWidths[font] = {}; // Create new cached widths for this font
        }
        if(this.cachedWidths[font][char] != undefined) { // Use cached width
            return this.cachedWidths[font][char];
        }

        // Ensure font the same
        this.canvasContext.font = font;

        // Try to get width from canvas
        let width = this.canvasContext.measureText(char).width;
        if(width > Number(font.split("px")[0])) {
            width /= 2; // Fix double-width-in-canvas Firefox bug
        } else if(width == 0 && char != "\u0096") {
            let fallbackWidth = this.getCharacterWidth("\u0096");
            return fallbackWidth; // In Firefox some control chars don't render, but all control chars are the same width
        }

        this.cachedWidths[font][char] = width;

        return width;
    }
}