/**
 * Add indentation using the `Tab` key, and auto-indents after a newline, as well as making it 
 * possible to indent/unindent multiple lines using Tab/Shift+Tab
 * Files: indent.js
 */
codeInput.plugins.Indent = class extends codeInput.Plugin {

    bracketPairs = {}; // No bracket-auto-indentation used when {}
    indentation = "\t";
    indentationNumChars = 1;
    tabIndentationEnabled = true; // Can be disabled for accessibility reasons to allow keyboard navigation
    escTabToChangeFocus = true;
    escJustPressed = false; // Becomes true when Escape key is pressed and false when another key is pressed

    /**
     * Create an indentation plugin to pass into a template
     * @param {boolean} defaultSpaces Should the Tab key enter spaces rather than tabs? Defaults to false.
     * @param {Number} numSpaces How many spaces is each tab character worth? Defaults to 4.
     * @param {Object} bracketPairs Opening brackets mapped to closing brackets, default and example {"(": ")", "[": "]", "{": "}"}. All brackets must only be one character, and this can be left as null to remove bracket-based indentation behaviour.
     * @param {boolean} escTabToChangeFocus Whether pressing the Escape key before Tab and Shift-Tab should make this keypress focus on a different element (Tab's default behaviour). You should always either enable this or use this plugin's disableTabIndentation and enableTabIndentation methods linked to other keyboard shortcuts, for accessibility.
     */
    constructor(defaultSpaces=false, numSpaces=4, bracketPairs={"(": ")", "[": "]", "{": "}"}, escTabToChangeFocus=true) {
        super([]); // No observed attributes

        this.bracketPairs = bracketPairs;
        if(defaultSpaces) {
            this.indentation = "";
            for(let i = 0; i < numSpaces; i++) {
                this.indentation += " ";
            }
            this.indentationNumChars = numSpaces;
        }

        this.escTabToChangeFocus = true;
    }

    multipleInstancesCanBeAdded() { return false; } // Adding multiple instances wouldn't make sense
    canBeAddedAndRemoved() { return false; } // TODO: Implement
    // TODO: Remove pluginData usage

    /**
     * Make the Tab key 
     */
    disableTabIndentation() {
        this.tabIndentationEnabled = false;
    }

    enableTabIndentation() {
        this.tabIndentationEnabled = true;
    }

    /* Add keystroke events, and get the width of the indentation in pixels. */
    afterElementsAdded(codeInput) {

        let textarea = codeInput.textareaElement;
        textarea.addEventListener('focus', (event) => { if(this.escTabToChangeFocus) codeInput.setKeyboardNavInstructions("Tab and Shift-Tab currently for indentation. Press Esc to enable keyboard navigation.", true); })
        textarea.addEventListener('keydown', (event) => { this.checkTab(codeInput, event); this.checkEnter(codeInput, event); this.checkBackspace(codeInput, event); });
        textarea.addEventListener('beforeinput', (event) => { this.checkCloseBracket(codeInput, event); });

        // Get the width of the indentation in pixels
        let testIndentationWidthPre = document.createElement("pre");
        testIndentationWidthPre.setAttribute("aria-hidden", "true"); // Hide for screen readers
        let testIndentationWidthSpan = document.createElement("span");
        if(codeInput.template.preElementStyled) {
            testIndentationWidthPre.appendChild(testIndentationWidthSpan);
            testIndentationWidthPre.classList.add("code-input_autocomplete_test-indentation-width");
            codeInput.appendChild(testIndentationWidthPre); // Styled like first pre, but first pre found to update
        } else {
            let testIndentationWidthCode = document.createElement("code");
            testIndentationWidthCode.appendChild(testIndentationWidthSpan);
            testIndentationWidthCode.classList.add("code-input_autocomplete_test-indentation-width");
            testIndentationWidthPre.appendChild(testIndentationWidthCode);
            codeInput.appendChild(testIndentationWidthPre); // Styled like first pre, but first pre found to update
        }

        testIndentationWidthSpan.innerHTML = codeInput.escapeHtml(this.indentation);
        let indentationWidthPx = testIndentationWidthSpan.offsetWidth;
        codeInput.removeChild(testIndentationWidthPre);

        codeInput.pluginData.indent = {indentationWidthPx: indentationWidthPx};
    }

    /* Deal with the Tab key causing indentation, and Tab+Selection indenting / Shift+Tab+Selection unindenting lines, and the mechanism through which Tab can be used to switch focus instead (accessibility). */
    checkTab(codeInput, event) {
        if(!this.tabIndentationEnabled) return;
        if(this.escTabToChangeFocus) {
            // Accessibility - allow Tab for keyboard navigation when Esc pressed right before it.
            if(event.key == "Escape") {
                this.escJustPressed = true;
                codeInput.setKeyboardNavInstructions("Tab and Shift-Tab currently for keyboard navigation. Type to return to indentation.", false);
                return;
            } else if(event.key != "Tab") {
                if(event.key == "Shift") {
                    return; // Shift+Tab after Esc should still be keyboard navigation
                }
                codeInput.setKeyboardNavInstructions("Tab and Shift-Tab currently for indentation. Press Esc to enable keyboard navigation.", false);
                this.escJustPressed = false;
                return;
            }

            if(!this.enableTabIndentation || this.escJustPressed) {
                codeInput.setKeyboardNavInstructions("", false);
                this.escJustPressed = false;
                return;
            }
        } else if(event.key != "Tab") {
            return;
        }

        let inputElement = codeInput.textareaElement;
        event.preventDefault(); // stop normal
        
        if(!event.shiftKey && inputElement.selectionStart == inputElement.selectionEnd) {
            // Just place a tab/spaces here.
            document.execCommand("insertText", false, this.indentation);

        } else {
            let lines = inputElement.value.split("\n");
            let letterI = 0;

            let selectionStartI = inputElement.selectionStart; // where cursor moves after tab - moving forward by 1 indent
            let selectionEndI = inputElement.selectionEnd; // where cursor moves after tab - moving forward by 1 indent

            for (let i = 0; i < lines.length; i++) {
                if((selectionStartI <= letterI+lines[i].length && selectionEndI >= letterI + 1)
                || (selectionStartI == selectionEndI && selectionStartI <= letterI+lines[i].length+1 && selectionEndI >= letterI)) { // + 1 so newlines counted
                    // Starts before or at last char and ends after or at first char
                    if(event.shiftKey) {
                        if(lines[i].substring(0, this.indentationNumChars) == this.indentation) {
                            // Remove first indent
                            inputElement.selectionStart = letterI;
                            inputElement.selectionEnd = letterI+this.indentationNumChars;
                            document.execCommand("delete", false, "");

                            // Change selection
                            if(selectionStartI > letterI) { // Indented outside selection
                                selectionStartI = Math.max(selectionStartI - this.indentationNumChars, letterI); // Don't move to before indent
                            }
                            selectionEndI -= this.indentationNumChars;
                            letterI -= this.indentationNumChars;
                        }
                    } else {
                        // Add tab at start
                        inputElement.selectionStart = letterI;
                        inputElement.selectionEnd = letterI;
                        document.execCommand("insertText", false, this.indentation);

                        // Change selection
                        if(selectionStartI > letterI) { // Indented outside selection
                            selectionStartI += this.indentationNumChars;
                        }
                        selectionEndI += this.indentationNumChars;
                        letterI += this.indentationNumChars;
                    }                    
                }
                
                letterI += lines[i].length+1; // newline counted
            }

            // move cursor
            inputElement.selectionStart = selectionStartI;
            inputElement.selectionEnd = selectionEndI;

            // move scroll position to follow code
            if(event.shiftKey) {
                codeInput.scrollBy(-codeInput.pluginData.indent.indentationWidthPx, 0);
            } else {
                codeInput.scrollBy(codeInput.pluginData.indent.indentationWidthPx, 0);
            }
        }

        codeInput.value = inputElement.value;
    }

    /* Deal with new lines retaining indentation */
    checkEnter(codeInput, event) {
        if(event.key != "Enter") {
            return;
        }
        event.preventDefault(); // Stop normal \n only

        let inputElement = codeInput.textareaElement;
        let lines = inputElement.value.split("\n");
        let letterI = 0;
        let currentLineI = lines.length - 1;
        let newLine = "";
        let numberIndents = 0;

        // find the index of the line our cursor is currently on
        for (let i = 0; i < lines.length; i++) {
            letterI += lines[i].length + 1;
            if(inputElement.selectionEnd <= letterI) {
                currentLineI = i;
                break;
            }
        }

        // count the number of indents the current line starts with (up to our cursor position in the line)
        let cursorPosInLine = lines[currentLineI].length - (letterI - inputElement.selectionEnd) + 1;
        for (let i = 0; i < cursorPosInLine; i += this.indentationNumChars) {
            if (lines[currentLineI].substring(i, i+this.indentationNumChars) == this.indentation) {
                numberIndents++;
            } else {
                break;
            }
        }

        // determine the text before and after the cursor and chop the current line at the new line break
        let textAfterCursor = "";
        if (cursorPosInLine != lines[currentLineI].length) {
            textAfterCursor = lines[currentLineI].substring(cursorPosInLine);
            lines[currentLineI] = lines[currentLineI].substring(0, cursorPosInLine);
        }

        let bracketThreeLinesTriggered = false;
        let furtherIndentation = "";
        if(this.bracketPairs != null) {
            for(let openingBracket in this.bracketPairs) {
                if(lines[currentLineI][lines[currentLineI].length-1] == openingBracket) {
                    let closingBracket = this.bracketPairs[openingBracket];
                    if(textAfterCursor.length > 0 && textAfterCursor[0] == closingBracket) {
                        // Create new line and then put textAfterCursor on yet another line: 
                        // {
                        //   |CARET|
                        // }
                        bracketThreeLinesTriggered = true;
                        for (let i = 0; i < numberIndents+1; i++) {
                            furtherIndentation += this.indentation;
                        }
                    } else {
                        // Just create new line: 
                        // {
                        //   |CARET|
                        numberIndents++;
                    }
                    break;
                } else {
                    // Check whether brackets cause unindent
                    let closingBracket = this.bracketPairs[openingBracket];
                    if(textAfterCursor.length > 0 && textAfterCursor[0] == closingBracket) {
                        numberIndents--;
                        break;
                    }
                }
            }
        }

        // insert our indents and any text from the previous line that might have been after the line break
        for (let i = 0; i < numberIndents; i++) {
            newLine += this.indentation;
        }

        // save the current cursor position
        let selectionStartI = inputElement.selectionStart;

        if(bracketThreeLinesTriggered) {
            document.execCommand("insertText", false, "\n" + furtherIndentation); // Write indented line
            numberIndents += 1; // Reflects the new indent
        }
        document.execCommand("insertText", false, "\n" + newLine); // Write new line, including auto-indentation

        // move cursor to new position
        inputElement.selectionStart = selectionStartI + numberIndents*this.indentationNumChars + 1;  // count the indent level and the newline character
        inputElement.selectionEnd = inputElement.selectionStart;

        
        // Scroll down to cursor if necessary
        let paddingTop = Number(getComputedStyle(inputElement).paddingTop.replace("px", "")); 
        let lineHeight = Number(getComputedStyle(inputElement).lineHeight.replace("px", "")); 
        let inputHeight = Number(getComputedStyle(codeInput).height.replace("px", ""));
        if(currentLineI*lineHeight + lineHeight*2 + paddingTop >= inputElement.scrollTop + inputHeight) { // Cursor too far down
            codeInput.scrollBy(0, Number(getComputedStyle(inputElement).lineHeight.replace("px", "")));
        }

        codeInput.value = inputElement.value;
    }

    /* Deal with one 'tab' of spaces-based-indentation being deleted by each backspace, rather than one space */
    checkBackspace(codeInput, event) {
        if(event.key != "Backspace" || this.indentationNumChars == 1) {
            return; // Normal backspace when indentation of 1
        }

        let inputElement = codeInput.textareaElement;

        if(inputElement.selectionStart == inputElement.selectionEnd && codeInput.value.substring(inputElement.selectionStart - this.indentationNumChars, inputElement.selectionStart) == this.indentation) {
            // Indentation before cursor = delete it
            inputElement.selectionStart -= this.indentationNumChars;
            event.preventDefault();
            document.execCommand("delete", false, "");
        }
    }

    /* Deal with the typing of closing brackets causing a decrease in indentation */
    checkCloseBracket(codeInput, event) {
        if(codeInput.textareaElement.selectionStart != codeInput.textareaElement.selectionEnd) {
            return;
        }

        for(let openingBracket in this.bracketPairs) {
            let closingBracket = this.bracketPairs[openingBracket];
            if(event.data == closingBracket) {
                // Closing bracket unindents line
                if(codeInput.value.substring(codeInput.textareaElement.selectionStart - this.indentationNumChars, codeInput.textareaElement.selectionStart) == this.indentation) {
                    // Indentation before cursor = delete it
                    codeInput.textareaElement.selectionStart -= this.indentationNumChars;
                    document.execCommand("delete", false, "");
                }
            }
        }
    }
}
