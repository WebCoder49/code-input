/**
 * Add basic Go-To-Line (Ctrl+G by default) functionality to the code editor.
 * Files: go-to-line.js / go-to-line.css
 */
codeInput.plugins.GoToLine = class extends codeInput.Plugin {
    useCtrlG = false;

    /**
     * Create a go-to-line command plugin to pass into a template
     * @param {boolean} useCtrlG Should Ctrl+G be overriden for go-to-line functionality? If not, you can trigger it yourself using (instance of this plugin)`.showPrompt(code-input element)`.
     */
    constructor(useCtrlG = true) {
        super([]); // No observed attributes
        this.useCtrlG = useCtrlG;
    }

    /* Add keystroke events */
    afterElementsAdded(codeInput) {
        const textarea = codeInput.textareaElement;
        if(this.useCtrlG) {
            textarea.addEventListener('keydown', (event) => { this.checkCtrlG(codeInput, event); });
        }
    }

    /* Called with a dialog box keyup event to check the validity of the line number entered and submit the dialog if Enter is pressed */
    checkPrompt(dialog, event) {
        // Line number(:column number)
        const lines = dialog.textarea.value.split('\n');
        const maxLineNo = lines.length;
        const lineNo = Number(dialog.input.value.split(':')[0]);
        let columnNo = 0; // Means go to start of indented line
        let maxColumnNo = 1;
        const querySplitByColons = dialog.input.value.split(':');
        if(querySplitByColons.length > 2) return dialog.input.classList.add('code-input_go-to-line_error');

        if (event.key == 'Escape') return this.cancelPrompt(dialog, event);

        if (dialog.input.value) {
            if (!/^[0-9:]*$/.test(dialog.input.value) || lineNo < 1 || lineNo > maxLineNo) {
                return dialog.input.classList.add('code-input_go-to-line_error');
            } else {
                // Check if line:column
                if(querySplitByColons.length >= 2) {
                    columnNo = Number(querySplitByColons[1]);
                    maxColumnNo = lines[lineNo-1].length;
                }
                if(columnNo < 0 || columnNo > maxColumnNo) {
                    return dialog.input.classList.add('code-input_go-to-line_error');
                } else {
                    dialog.input.classList.remove('code-input_go-to-line_error');
                }
            }
        }

        if (event.key == 'Enter') {
            this.goTo(dialog.textarea, lineNo, columnNo);
            this.cancelPrompt(dialog, event);
        }
    }

    /* Called with a dialog box keyup event to close and clear the dialog box */    
    cancelPrompt(dialog, event) {
        event.preventDefault();
        dialog.codeInput.handleEventsFromTextarea = false;
        dialog.textarea.focus();
        dialog.codeInput.handleEventsFromTextarea = true;
        dialog.setAttribute("inert", true); // Hide from keyboard navigation when closed.
        dialog.setAttribute("tabindex", -1); // Hide from keyboard navigation when closed.
        dialog.setAttribute("aria-hidden", true); // Hide from screen reader when closed.

        // Remove dialog after animation
        dialog.classList.add('code-input_go-to-line_hidden-dialog');
        dialog.input.value = "";
    }

    /**
     * Show a search-like dialog prompting line number.
     * @param {codeInput.CodeInput} codeInput the `<code-input>` element.
    */
    showPrompt(codeInput) {
        if(codeInput.pluginData.goToLine == undefined || codeInput.pluginData.goToLine.dialog == undefined) {
            const textarea = codeInput.textareaElement;

            const dialog = document.createElement('div');
            const input = document.createElement('input');
            const cancel = document.createElement('span');
            cancel.setAttribute("tabindex", 0); // Visible to keyboard navigation
            cancel.setAttribute("title", "Close Dialog and Return to Editor");

            dialog.appendChild(input);
            dialog.appendChild(cancel);

            dialog.className = 'code-input_go-to-line_dialog';
            input.spellcheck = false;
            input.placeholder = "Line:Column / Line no. then Enter";
            dialog.codeInput = codeInput;
            dialog.textarea = textarea;
            dialog.input = input;

            input.addEventListener('keypress', (event) => {
                /* Stop enter from submitting form */
                if (event.key == 'Enter') event.preventDefault();
            });
            
            input.addEventListener('keyup', (event) => { return this.checkPrompt(dialog, event); });
            cancel.addEventListener('click', (event) => { this.cancelPrompt(dialog, event); });
            cancel.addEventListener('keypress', (event) => { if (event.key == "Space" || event.key == "Enter") this.cancelPrompt(dialog, event); });

            codeInput.dialogContainerElement.appendChild(dialog);
            codeInput.pluginData.goToLine = {dialog: dialog};
            input.focus();
        } else {
            codeInput.pluginData.goToLine.dialog.classList.remove("code-input_go-to-line_hidden-dialog");
            codeInput.pluginData.goToLine.dialog.removeAttribute("inert"); // Show to keyboard navigation when open.
            codeInput.pluginData.goToLine.dialog.setAttribute("tabindex", 0); // Show to keyboard navigation when open.
            codeInput.pluginData.goToLine.dialog.removeAttribute("aria-hidden"); // Show to screen reader when open.
            codeInput.pluginData.goToLine.dialog.input.focus();
        }
    }

    /* Set the cursor on the first non-space char of textarea's nth line, or to the columnNo-numbered character in the line if it's not 0; and scroll it into view */
    goTo(textarea, lineNo, columnNo = 0) {
        let fontSize;
        let lineHeight;
        let scrollAmount;
        let topPadding;
        let cursorPos = -1;
        let lines = textarea.value.split('\n');

        if (lineNo > 0 && lineNo <= lines.length) {
            if (textarea.computedStyleMap) {
                fontSize = textarea.computedStyleMap().get('font-size').value;
                lineHeight = fontSize * textarea.computedStyleMap().get('line-height').value;
            } else {
                fontSize = document.defaultView.getComputedStyle(textarea, null).getPropertyValue('font-size').split('px')[0];
                lineHeight = document.defaultView.getComputedStyle(textarea, null).getPropertyValue('line-height').split('px')[0];
            }

            // scroll amount and initial top padding (3 lines above, if possible)
            scrollAmount = (lineNo > 3 ? lineNo - 3 : 1) * lineHeight;
            topPadding = (lineHeight - fontSize) / 2;

            if (lineNo > 1) {
                // cursor positon just after n - 1 full lines
                cursorPos = lines.slice(0, lineNo - 1).join('\n').length;
            }

            // scan first non-space char in nth line
            if (columnNo == 0) {
                do cursorPos++; while (textarea.value[cursorPos] != '\n' && /\s/.test(textarea.value[cursorPos]));
            } else {
                cursorPos += 1 + columnNo - 1;
            }

            textarea.scrollTop = scrollAmount - topPadding;
            textarea.setSelectionRange(cursorPos, cursorPos);
            textarea.click();
        }
    }

    /* Event handler for keydown event that makes Ctrl+G open go to line dialog */
    checkCtrlG(codeInput, event) {
        if (event.ctrlKey && event.key == 'g') {
            event.preventDefault();
            this.showPrompt(codeInput);
        }
    }
}
