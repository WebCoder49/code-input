/**
 * Render special characters and control characters as a symbol with their hex code.
 * Files: special-chars.js, special-chars.css
 *
 * WARNING:
 *
 * This plugin is currently unstable when used with other plugins,
 * Unicode characters, or highlight.js. I hope to fix much of this by
 * major version 3, and if you could help that would be amazing!
 *
 * See https://github.com/WebCoder49/code-input/issues?q=is%3Aissue%20state%3Aopen%20specialchars
 */
"use strict";

codeInput.plugins.SpecialChars = class extends codeInput.Plugin {
    specialCharRegExp;

    cachedColors; // ascii number > [background color, text color]
    cachedWidths; // character > character width
    canvasContext;

    /**
     * Create a special characters plugin instance.
     * Default = covers many non-renderable ASCII characters.
     * @param {Boolean} colorInSpecialChars Whether or not to give special characters custom background colors based on their hex code. Defaults to false.
     * @param {Boolean} inheritTextColor If true, forces the color of the hex code to inherit from syntax highlighting. If false, the base color of the `pre code` element is used to give contrast to the small characters. Defaults to false.
     * @param {RegExp} specialCharRegExp The regular expression which matches special characters. Defaults to many non-renderable ASCII characters (which characters are renderable depends on the browser and OS).
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

    /* Initially render special characters as the highlighting algorithm may automatically highlight and remove them */
    afterElementsAdded(codeInput) {
        setTimeout(() => { codeInput.value = codeInput.value; }, 100);
    }

    /* After highlighting, render special characters as their stylised hexadecimal equivalents */
    afterHighlight(codeInput) {      
        let resultElement = codeInput.codeElement;

        // Reset data each highlight so can change if font size, etc. changes
        codeInput.pluginData.specialChars = {};
        codeInput.pluginData.specialChars.contrastColor = window.getComputedStyle(resultElement).color;

        this.recursivelyReplaceText(codeInput, resultElement);

        this.lastFont = window.getComputedStyle(codeInput.textareaElement).font;
    }

    /* Search for special characters in an element and replace them with their stylised hexadecimal equivalents */
    recursivelyReplaceText(codeInput, element) {
        for(let i = 0; i < element.childNodes.length; i++) {

            let nextNode = element.childNodes[i];
            if(nextNode.nodeType == 3) {
                // Text node - Replace in here
                let oldValue = nextNode.nodeValue;

                this.specialCharRegExp.lastIndex = 0;
                let searchResult = this.specialCharRegExp.exec(oldValue);
                if(searchResult != null) {
                    let charIndex = searchResult.index; // Start as returns end

                    nextNode = nextNode.splitText(charIndex+1).previousSibling;
                    
                    if(charIndex > 0) {
                        nextNode = nextNode.splitText(charIndex); // Keep characters before the special character in a different span
                    }

                    if(nextNode.textContent != "") {
                        let replacementElement = this.getStylisedSpecialChar(codeInput, nextNode.textContent);
                        // This next node will become the i+1th node so automatically iterated to
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

    /* Get the stylised hexadecimal representation HTML element for a given special character */
    getStylisedSpecialChar(codeInput, matchChar) {
        let hexCode = matchChar.codePointAt(0);

        let colors;
        if(this.colorInSpecialChars) colors = this.getCharacterColors(hexCode);

        hexCode = hexCode.toString(16);
        hexCode = ("0000" + hexCode).substring(hexCode.length); // So 2 chars with leading 0
        hexCode = hexCode.toUpperCase();

        let charWidth = this.getCharacterWidthEm(codeInput, matchChar);

        // Create element with hex code
        let result = document.createElement("span");
        result.textContent = matchChar;
        result.classList.add("code-input_special-char");
        result.style.setProperty("--hex-0",  "var(--code-input_special-chars_" + hexCode[0] + ")");
        result.style.setProperty("--hex-1",  "var(--code-input_special-chars_" + hexCode[1] + ")");
        result.style.setProperty("--hex-2",  "var(--code-input_special-chars_" + hexCode[2] + ")");
        result.style.setProperty("--hex-3",  "var(--code-input_special-chars_" + hexCode[3] + ")");
        
        // Handle zero-width chars
        if(charWidth == 0) result.classList.add("code-input_special-char_zero-width");
        else result.style.width = charWidth + "em";

        if(this.colorInSpecialChars) {
            result.style.backgroundColor = "#" + colors[0];
            result.style.setProperty("--code-input_special-char_color", colors[1]);
        } else if(!this.inheritTextColor) {
            result.style.setProperty("--code-input_special-char_color", codeInput.pluginData.specialChars.contrastColor);
        }
        return result;
    }
    
    /* Get the colors a stylised representation of a given character must be shown in; lazy load and return [background color, text color] */
    getCharacterColors(asciiCode) {
        let textColor;
        if(!(asciiCode in this.cachedColors)) {
            // Get background color
            let asciiHex = asciiCode.toString(16);
            let backgroundColor = "";
            for(let i = 0; i < asciiHex.length; i++) {
                backgroundColor += asciiHex[i] + asciiHex[i];
            }
            backgroundColor = ("000000" + backgroundColor).substring(backgroundColor.length); // So valid HEX color with 6 characters

            // Get most suitable text color - white or black depending on background brightness
            let colorBrightness = 0;
            const luminanceCoefficients = [0.299, 0.587, 0.114];
            for(let i = 0; i < 6; i += 2) {
                colorBrightness += parseInt(backgroundColor.substring(i, i+2), 16) * luminanceCoefficients[i/2];
            }
            // Calculate darkness
            textColor = colorBrightness < 128 ? "white" : "black";

            this.cachedColors[asciiCode] = [backgroundColor, textColor];
            return [backgroundColor, textColor];
        } else {
            return this.cachedColors[asciiCode];
        }
    }

    /* Get the width of a character in em (relative to font size), for use in creation of the stylised hexadecimal representation with the same width */
    getCharacterWidthEm(codeInput, char) {
        // Force zero-width characters
        if(new RegExp("\u00AD|\u02DE|[\u0300-\u036F]|[\u0483-\u0489]|[\u200B-\u200D]|\uFEFF").test(char) ) { return 0 }
        // Non-renderable ASCII characters should all be rendered at same size
        if(char != "\u0096" && new RegExp("[\u{0000}-\u{001F}]|[\u{007F}-\u{009F}]", "g").test(char)) {
            let fallbackWidth = this.getCharacterWidthEm(codeInput, "\u0096");
            return fallbackWidth;
        }

        let font = getComputedStyle(codeInput.textareaElement).fontFamily + " " + getComputedStyle(codeInput.textareaElement).fontStretch + " " + getComputedStyle(codeInput.textareaElement).fontStyle + " " + getComputedStyle(codeInput.textareaElement).fontVariant + " " + getComputedStyle(codeInput.textareaElement).fontWeight + " " + getComputedStyle(codeInput.textareaElement).lineHeight; // Font without size

        // Lazy-load width of each character
        if(this.cachedWidths[font] == undefined) {
            this.cachedWidths[font] = {};
        }
        if(this.cachedWidths[font][char] != undefined) { // Use cached width
            return this.cachedWidths[font][char];
        }

        // Ensure font the same - 20px font size is where this algorithm works
        this.canvasContext.font = getComputedStyle(codeInput.textareaElement).font.replace(getComputedStyle(codeInput.textareaElement).fontSize, "20px");

        // Try to get width from canvas
        let width = this.canvasContext.measureText(char).width/20; // From px to em (=proportion of font-size)
        if(width > 1) {
            width /= 2; // Fix double-width-in-canvas Firefox bug
        } else if(width == 0 && char != "\u0096") {
            let fallbackWidth = this.getCharacterWidthEm(codeInput, "\u0096");
            return fallbackWidth; // In Firefox some control chars don't render, but all control chars are the same width
        }

        // Firefox will never make smaller than size at 20px
        if(navigator.userAgent.includes("Mozilla") && !navigator.userAgent.includes("Chrome") && !navigator.userAgent.includes("Safari")) {
            let fontSize = Number(getComputedStyle(codeInput.textareaElement).fontSize.substring(0, getComputedStyle(codeInput.textareaElement).fontSize.length-2)); // Remove 20, make px
            if(fontSize < 20) width *= 20 / fontSize;
        }

        this.cachedWidths[font][char] = width;

        return width;
    }
}
