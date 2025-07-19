/**
 * Automatically close pairs of brackets/quotes/other syntaxes in code, but also optionally choose the brackets this
 * is activated for.
 * Files: auto-close-brackets.js
 */
"use strict";

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
        codeInput.pluginData.autoCloseBrackets = { automatedKeypresses: false};
        codeInput.textareaElement.addEventListener('keydown', (event) => { this.checkBackspace(codeInput, event); });
        codeInput.textareaElement.addEventListener('beforeinput', (event) => { this.checkClosingBracket(codeInput, event); });
        codeInput.textareaElement.addEventListener('input', (event) => { this.checkOpeningBracket(codeInput, event); });
    }

    /* Deal with the ability to "retype" a closing bracket where one has already
    been placed. Runs before input so newly typing a closing bracket can be
    prevented.*/
    checkClosingBracket(codeInput, event) {
        if(codeInput.pluginData.autoCloseBrackets.automatedKeypresses) return;
        if(event.data == codeInput.textareaElement.value[codeInput.textareaElement.selectionStart]) {
            // Check if a closing bracket is typed
            for(let openingBracket in this.bracketPairs) {
                let closingBracket = this.bracketPairs[openingBracket];
                if(event.data == closingBracket) {
                    // "Retype" a closing bracket, i.e. just move caret
                    codeInput.textareaElement.selectionStart = codeInput.textareaElement.selectionEnd += 1;
                    event.preventDefault();
                    break;
                }
            }
        }
    }

    /* Deal with the automatic creation of closing bracket when opening brackets are typed. Runs after input for consistency between browsers. */
    checkOpeningBracket(codeInput, event) {
        if(codeInput.pluginData.autoCloseBrackets.automatedKeypresses) return;
        if(event.data in this.bracketPairs) {
            // Opening bracket typed; Create bracket pair
            let closingBracket = this.bracketPairs[event.data];
            // Insert the closing bracket
            // automatedKeypresses property to prevent keypresses being captured
            // by this plugin during automated input as some browsers
            // (e.g. GNOME Web) do.
            codeInput.pluginData.autoCloseBrackets.automatedKeypresses = true;
            document.execCommand("insertText", false, closingBracket);
            codeInput.pluginData.autoCloseBrackets.automatedKeypresses = false;
            // Move caret before the inserted closing bracket
            codeInput.textareaElement.selectionStart = codeInput.textareaElement.selectionEnd -= 1;
        }
    }

    /* Deal with cases where a backspace deleting an opening bracket deletes the closing bracket straight after it as well */
    checkBackspace(codeInput, event) {
        if(codeInput.pluginData.autoCloseBrackets.automatedKeypresses) return;
        if(event.key == "Backspace" && codeInput.textareaElement.selectionStart == codeInput.textareaElement.selectionEnd) {
            let closingBracket = this.bracketPairs[codeInput.textareaElement.value[codeInput.textareaElement.selectionStart-1]];
            if(closingBracket != undefined && codeInput.textareaElement.value[codeInput.textareaElement.selectionStart] == closingBracket) {
                // Opening bracket being deleted so delete closing bracket as well
                codeInput.textareaElement.selectionEnd = codeInput.textareaElement.selectionStart + 1;
                codeInput.textareaElement.selectionStart -= 1;
            }
        }
    }
}
