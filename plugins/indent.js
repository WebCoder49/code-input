/**
 * Adds indentation using the `Tab` key, and auto-indents after a newline, as well as making it 
 * possible to indent/unindent multiple lines using Tab/Shift+Tab
 * Files: indent.js
 */
 codeInput.plugins.Indent = class extends codeInput.Plugin {
    constructor() {
        super();
    }

    /* Add keystroke events */
    afterElementsAdded(codeInput) {
        let textarea = codeInput.querySelector("textarea");
        textarea.addEventListener('keydown', (event) => { this.check_tab(codeInput, event); this.check_enter(codeInput, event); });
    }

    /* Event handlers */
    check_tab(codeInput, event) {
        if(event.key != "Tab") {
            return;
        }
        let input_element = codeInput.querySelector("textarea");
        let code = input_element.value;
        event.preventDefault(); // stop normal
        
        if(!event.shiftKey && input_element.selectionStart == input_element.selectionEnd) {
            // Just place a tab here.
            document.execCommand("insertText", false, "\t");

        } else {
            let lines = input_element.value.split("\n");
            let letter_i = 0;

            let selection_start = input_element.selectionStart; // where cursor moves after tab - moving forward by 1 indent
            let selection_end = input_element.selectionEnd; // where cursor moves after tab - moving forward by 1 indent

            let number_indents = 0;
            let first_line_indents = 0;

            for (let i = 0; i < lines.length; i++) {                
                // console.log(lines[i], ": start", selection_start, letter_i + lines[i].length + 1, "&& end", selection_end , letter_i + 1)
                if((selection_start <= letter_i+lines[i].length && selection_end >= letter_i + 1)
                || (selection_start == selection_end && selection_start <= letter_i+lines[i].length+1 && selection_end >= letter_i)) { // + 1 so newlines counted
                    // Starts before or at last char and ends after or at first char
                    if(event.shiftKey) {
                        if(lines[i][0] == "\t") {
                            // Remove first tab
                            input_element.selectionStart = letter_i;
                            input_element.selectionEnd = letter_i+1;
                            document.execCommand("delete", false, "");

                            // Change selection
                            if(selection_start > letter_i) { // Indented outside selection
                                selection_start--;
                            }
                            selection_end--;
                            letter_i--;
                        }
                    } else {
                        // Add tab at start
                        input_element.selectionStart = letter_i;
                        input_element.selectionEnd = letter_i;
                        document.execCommand("insertText", false, "\t");

                        // Change selection
                        if(selection_start > letter_i) { // Indented outside selection
                            selection_start++;
                        }
                        selection_end++;
                        letter_i++;
                    }                    
                }
                
                letter_i += lines[i].length+1; // newline counted
            }
            // input_element.value = lines.join("\n");

            // move cursor
            input_element.selectionStart = selection_start;
            input_element.selectionEnd = selection_end;
        }

        codeInput.update(input_element.value);
    }

    check_enter(codeInput, event) {
        if(event.key != "Enter") {
            return;
        }
        event.preventDefault(); // stop normal

        let input_element = codeInput.querySelector("textarea");
        let lines = input_element.value.split("\n");
        let letter_i = 0;
        let current_line = lines.length - 1;
        let new_line = "";
        let number_indents = 0;

        // find the index of the line our cursor is currently on
        for (let i = 0; i < lines.length; i++) {
            letter_i += lines[i].length + 1;
            if(input_element.selectionEnd <= letter_i) {
                current_line = i;
                break;
            }
        }

        // count the number of indents the current line starts with (up to our cursor position in the line)
        let cursor_pos_in_line = lines[current_line].length - (letter_i - input_element.selectionEnd) + 1;
        for (let i = 0; i < cursor_pos_in_line; i++) {
            if (lines[current_line][i] == "\t") {
                number_indents++;
            } else {
                break;
            }
        }

        // determine the text before and after the cursor and chop the current line at the new line break
        let text_after_cursor = "";
        if (cursor_pos_in_line != lines[current_line].length) {
            text_after_cursor = lines[current_line].substring(cursor_pos_in_line);
            lines[current_line] = lines[current_line].substring(0, cursor_pos_in_line);
        }

        // insert our indents and any text from the previous line that might have been after the line break
        for (let i = 0; i < number_indents; i++) {
            new_line += "\t";
        }

        // save the current cursor position
        let selection_start = input_element.selectionStart;
        let selection_end = input_element.selectionEnd;

        document.execCommand("insertText", false, "\n" + new_line); // Write new line, including auto-indentation

        // move cursor to new position
        input_element.selectionStart = selection_start + number_indents + 1;  // count the indent level and the newline character
        input_element.selectionEnd = selection_end + number_indents + 1;

        codeInput.update(input_element.value);


        // Update scrolls
        input_element.scrollLeft = 0;
        // Move down 1 line
        let lineHeight = Number(getComputedStyle(input_element).lineHeight.split(0, -2));
        // console.log(getComputedStyle(input_element).lineHeight);
        if(lineHeight == NaN && getComputedStyle(input_element).lineHeight.split(-2) == "px") {
            input_element.scrollTop += lineHeight;
        } else {
            input_element.scrollTop += 20; // px
        }
    }
}