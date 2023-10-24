/**
 * Adds indentation using the `Tab` key, and auto-indents after a newline, as well as making it 
 * possible to indent/unindent multiple lines using Tab/Shift+Tab
 * Files: indent.js
 */
codeInput.plugins.Indent = class extends codeInput.Plugin {
    constructor() {
        super([]); // No observed attributes
    }

    /* Add keystroke events */
    afterElementsAdded(codeInput) {
        let textarea = codeInput.textareaElement;
        textarea.addEventListener('keydown', (event) => { this.checkTab(codeInput, event); this.checkEnter(codeInput, event); });
    }

    /* Event handlers */
    checkTab(codeInput, event) {
        if(event.key != "Tab") {
            return;
        }
        let inputElement = codeInput.textareaElement;
        event.preventDefault(); // stop normal
        
        if(!event.shiftKey && inputElement.selectionStart == inputElement.selectionEnd) {
            // Just place a tab here.
            document.execCommand("insertText", false, "\t");

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
                        if(lines[i][0] == "\t") {
                            // Remove first tab
                            inputElement.selectionStart = letterI;
                            inputElement.selectionEnd = letterI+1;
                            document.execCommand("delete", false, "");

                            // Change selection
                            if(selectionStartI > letterI) { // Indented outside selection
                                selectionStartI--;
                            }
                            selectionEndI--;
                            letterI--;
                        }
                    } else {
                        // Add tab at start
                        inputElement.selectionStart = letterI;
                        inputElement.selectionEnd = letterI;
                        document.execCommand("insertText", false, "\t");

                        // Change selection
                        if(selectionStartI > letterI) { // Indented outside selection
                            selectionStartI++;
                        }
                        selectionEndI++;
                        letterI++;
                    }                    
                }
                
                letterI += lines[i].length+1; // newline counted
            }

            // move cursor
            inputElement.selectionStart = selectionStartI;
            inputElement.selectionEnd = selectionEndI;
        }

        codeInput.update(inputElement.value);
    }

    checkEnter(codeInput, event) {
        if(event.key != "Enter") {
            return;
        }
        event.preventDefault(); // Stop normal \n only

        let inputElement = codeInput.querySelector("textarea");
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
        for (let i = 0; i < cursorPosInLine; i++) {
            if (lines[currentLineI][i] == "\t") {
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

        // insert our indents and any text from the previous line that might have been after the line break
        for (let i = 0; i < numberIndents; i++) {
            newLine += "\t";
        }

        // save the current cursor position
        let selectionStartI = inputElement.selectionStart;

        document.execCommand("insertText", false, "\n" + newLine); // Write new line, including auto-indentation

        // move cursor to new position
        inputElement.selectionStart = selectionStartI + numberIndents + 1;  // count the indent level and the newline character
        inputElement.selectionEnd = inputElement.selectionStart;

        
        // Scroll down to cursor if necessary
        let paddingTop = Number(getComputedStyle(inputElement).paddingTop.replace("px", "")); 
        let lineHeight = Number(getComputedStyle(inputElement).lineHeight.replace("px", "")); 
        let inputHeight = Number(getComputedStyle(inputElement).height.replace("px", ""));
        if(currentLineI*lineHeight + lineHeight*2 + paddingTop >= inputElement.scrollTop + inputHeight) { // Cursor too far down
            inputElement.scrollBy(0, Number(getComputedStyle(inputElement).lineHeight.replace("px", "")))
        }

        codeInput.update(inputElement.value);
    }
}