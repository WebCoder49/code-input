/**
 * Render special characters as a symbol with their hex code.
 * Files: special-chars.js, special-chars.css
 */
codeInput.plugins.SpecialChars = class extends codeInput.Plugin {
    specialCharRegExp;

    cachedColors; // ascii number > [background color, text color]
    cachedWidths; // character > character width
    canvasContext;

    /**
     * Create a special characters plugin instance
     * @param {RegExp} specialCharRegExp The regular expression which matches special characters
     */
    constructor(specialCharRegExp = /(?!\n)(?!\t)[\u{0000}-\u{001F}]|[\u{0080}-\u{FFFF}]/ug) { // By default, covers many non-renderable ASCII characters
        super();
        this.specialCharRegExp = specialCharRegExp;
        this.cachedColors = {};

        this.cachedWidths = {};

        let canvas = document.createElement("canvas");
        window.addEventListener("load", () => {
            document.body.appendChild(canvas);

        });
        this.canvasContext = canvas.getContext("2d");
        this.canvasContext.fillStyle = "black";
        this.canvasContext.font = "20px 'Consolas'"; // TODO: Make dynamic
    }

    /* Runs after code is highlighted; Params: codeInput element) */
    afterHighlight(codeInput) {        
        let result_element = codeInput.querySelector("pre code");
        result_element.innerHTML = result_element.innerHTML.replaceAll(this.specialCharRegExp, this.specialCharReplacer.bind(this));
    }

    specialCharReplacer(match_char, _match_char, index, whole_string, groups) {
        let hex_code = match_char.codePointAt(0);

        let colors = this.getCharacterColor(hex_code);

        hex_code = hex_code.toString(16);
        hex_code = ("00" + hex_code).substring(hex_code.length); // So 2 chars with leading 0
        hex_code = hex_code.toUpperCase();

        let char_width = this.getCharacterWidth(match_char);
        console.log(hex_code, char_width);

        // let background_color = hashed_last_hex_char + hashed_last_hex_char + hex_code.substr(0, 1) + hex_code.substr(0, 1) + hex_code.substr(1, 1) + hex_code.substr(1, 1) // So good range of colours 
        return `<span class='code-input_special-char' data-top='${hex_code[0]}' data-bottom='${hex_code[1]}' style='background-color: #${colors[0]}; color: ${colors[1]}; width: ${char_width}px'></span>`;
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
            for(let i = 0; i < 6; i += 2) {
                color_brightness += parseInt(background_color.substring(i, i+2), 16);
            }
            // Calculate darkness
            text_color = color_brightness < (128*3) ? "white" : "black";

            this.cachedColors[ascii_code] = [background_color, text_color];
            return [background_color, text_color];
        } else {
            return this.cachedColors[ascii_code];
        }
    }

    getCharacterWidth(char) {
        // Lazy-load - TODO: Get a cleaner way of doing this
        if(char in this.cachedWidths) {
            return this.cachedWidths[char];
        }

        this.canvasContext.fillText(char, 10, 20);
        let width = this.canvasContext.measureText(char).width;
        if(width > 20) {
            width /= 2; // Fix double-width-in-canvas Firefox bug
        } else if(width == 0) {
            let fallbackWidth = this.getCharacterWidth("\u0096");
            this.cachedWidths[char] = fallbackWidth;
            return fallbackWidth; // In Firefox some control chars don't render
        }
        console.log(char, this.canvasContext.measureText(char));

        this.cachedWidths[char] = width;
        return width;
    }
}