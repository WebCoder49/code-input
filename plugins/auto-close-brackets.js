/**
 * Automatically close pairs of brackets/quotes/other syntaxes in code, but also optionally choose the brackets this
 * is activated for.
 * Files: auto-close-brackets.js
 */
codeInput.plugins.AutoCloseBrackets = class extends codeInput.Plugin {
    bracketPairs = [];
    bracketsOpenedStack = []; // Each item [closing bracket string, opening bracket location] Innermost at right so can know which brackets should be ignored when retyped

    /**
     * Create an auto-close brackets plugin to pass into a template
     * @param {Object} bracketPairs Opening brackets mapped to closing brackets, default and example {"(": ")", "[": "]", "{": "}", '"': '"'}. All brackets must only be one character.
     */
    constructor(bracketPairs={"(": ")", "[": "]", "{": "}", '"': '"'}) {
        super([]); // No observed attributes

        this.bracketPairs = bracketPairs;
    }

    /* Add keystroke events */
    afterElementsAdded(codeInput) {
        let textarea = codeInput.textareaElement;
        textarea.addEventListener('keydown', (event) => { this.checkBackspace(codeInput, event) });
        textarea.addEventListener('beforeinput', (event) => { this.checkBrackets(codeInput, event); });

    }

    /* Event handlers */
    checkBrackets(codeInput, event) {
        if(this.bracketsOpenedStack.length > 0 && event.data == this.bracketsOpenedStack[this.bracketsOpenedStack.length-1][0] && event.data == codeInput.textareaElement.value[codeInput.textareaElement.selectionStart]) {
            // "Retype" bracket, i.e. just move caret
            codeInput.textareaElement.selectionStart = codeInput.textareaElement.selectionEnd += 1;
            this.bracketsOpenedStack.pop();
            event.preventDefault();
        } else if(event.data in this.bracketPairs) {
            // Create bracket pair
            let closingBracket = this.bracketPairs[event.data];
            this.bracketsOpenedStack.push([closingBracket, codeInput.textareaElement.selectionStart]);
            document.execCommand("insertText", false, closingBracket);
            codeInput.textareaElement.selectionStart = codeInput.textareaElement.selectionEnd -= 1;
        }
    }

    checkBackspace(codeInput, event) {
        if(event.key == "Backspace" && codeInput.textareaElement.selectionStart == codeInput.textareaElement.selectionEnd) {
            if(this.bracketsOpenedStack.length > 0 && this.bracketsOpenedStack[this.bracketsOpenedStack.length-1][1]+1 == codeInput.textareaElement.selectionStart && codeInput.textareaElement.value[codeInput.textareaElement.selectionStart] == this.bracketsOpenedStack[this.bracketsOpenedStack.length-1][0]) {
                // Delete closing bracket as well
                codeInput.textareaElement.selectionEnd = codeInput.textareaElement.selectionStart + 1;
                codeInput.textareaElement.selectionStart -= 1;
                this.bracketsOpenedStack.pop();
            }
        }
    }
}