/**
 * Add Find-and-Replace (Ctrl+F for find, Ctrl+H for replace by default) functionality to the code editor.
 * Files: find-and-replace.js / find-and-replace.css
 */
"use strict";

codeInput.plugins.FindAndReplace = class extends codeInput.Plugin {
    useCtrlF = false;
    useCtrlH = false;

    findMatchesOnValueChange = true; // Needed so the program can insert text to the find value and thus add it to Ctrl+Z without highlighting matches.

    instructions = {
        start: "Search for matches in your code.",
        none: "No matches",
        oneFound: "1 match found.",
        matchIndex: (index, count) => `${index} of ${count} matches.`,
        error: (message) => `Error: ${message}`,
        infiniteLoopError: "Causes an infinite loop",
        closeDialog: "Close Dialog and Return to Editor",
        findPlaceholder: "Find",
        findCaseSensitive: "Match Case Sensitive",
        findRegExp: "Use JavaScript Regular Expression",
        replaceTitle: "Replace",
        replacePlaceholder: "Replace with",
        findNext: "Find Next Occurrence",
        findPrevious: "Find Previous Occurrence",
        replaceActionShort: "Replace",
        replaceAction: "Replace This Occurrence",
        replaceAllActionShort: "Replace All",
        replaceAllAction: "Replace All Occurrences"
    };

    /**
     * Create a find-and-replace command plugin to pass into a template
     * @param {boolean} useCtrlF Should Ctrl+F be overriden for find-and-replace find functionality? Either way, you can also trigger it yourself using (instance of this plugin)`.showPrompt(code-input element, false)`.
     * @param {boolean} useCtrlH Should Ctrl+H be overriden for find-and-replace replace functionality? Either way, you can also trigger it yourself using (instance of this plugin)`.showPrompt(code-input element, true)`.
     * @param {Object} instructionTranslations: user interface string keys mapped to translated versions for localisation. Look at the find-and-replace.js source code for the English text and available keys.
     */
    constructor(useCtrlF = true, useCtrlH = true, instructionTranslations = {}) {
        super([]); // No observed attributes
        this.useCtrlF = useCtrlF;
        this.useCtrlH = useCtrlH;
        this.addTranslations(this.instructions, instructionTranslations);
    }

    /* Add keystroke events */
    afterElementsAdded(codeInput) {
        const textarea = codeInput.textareaElement;
        if(this.useCtrlF) {
            textarea.addEventListener('keydown', (event) => { this.checkCtrlF(codeInput, event); });
        }
        if(this.useCtrlH) {
            textarea.addEventListener('keydown', (event) => { this.checkCtrlH(codeInput, event); });
        }
    }

    /* After highlight, retry match highlighting */
    afterHighlight(codeInput) {
        if(codeInput.pluginData.findAndReplace != undefined && codeInput.pluginData.findAndReplace.dialog != undefined) {
            if(!codeInput.pluginData.findAndReplace.dialog.classList.contains("code-input_find-and-replace_hidden-dialog")) {
                // Code updated and dialog open - re-highlight find matches
                codeInput.pluginData.findAndReplace.dialog.findMatchState.rehighlightMatches();
                this.updateMatchDescription(codeInput.pluginData.findAndReplace.dialog);

                if(codeInput.pluginData.findAndReplace.dialog.findMatchState.numMatches == 0) {
                    // No more matches after editing
                    codeInput.pluginData.findAndReplace.dialog.findInput.classList.add('code-input_find-and-replace_error');
                }
            }
        }
    }

    /* Get a Regular Expression to match a specific piece of text, by escaping the text: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */
    text2RegExp(string, caseSensitive, stringIsRegexp) {
        // "i" flag means case-"i"nsensitive
        return new RegExp(stringIsRegexp ? string : string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), caseSensitive ? "g" : "gi"); // $& means the whole matched string
    }

    /* Update the dialog description to show the find matches */
    updateMatchDescription(dialog) {
        // 1-indexed
        if(dialog.findInput.value.length == 0) {
            dialog.matchDescription.textContent = this.instructions.start;
        } else if(dialog.findMatchState.numMatches <= 0) {
            dialog.matchDescription.textContent = this.instructions.none;
        } else if(dialog.findMatchState.numMatches == 1) {
            dialog.matchDescription.textContent = this.instructions.oneFound;
        } else {
            dialog.matchDescription.textContent = this.instructions.matchIndex(dialog.findMatchState.focusedMatchID+1, dialog.findMatchState.numMatches);
        }
    }

    /* Called with a find input keyup event to find all matches in the code and focus the next match if Enter is pressed */
    updateFindMatches(dialog) {
        // Update matches for find functionality; debounce it to prevent delay with single-character search
        let oldValue = dialog.findInput.value;
        setTimeout(() => {
            if(oldValue == dialog.findInput.value) {
                // Stopped typing
                dialog.findMatchState.clearMatches();
                if(oldValue.length > 0) {
                    try {
                        dialog.findMatchState.updateMatches(this.text2RegExp(dialog.findInput.value, dialog.findCaseSensitiveCheckbox.checked, dialog.findRegExpCheckbox.checked));
                    } catch (err) {
                        if(err instanceof SyntaxError) {
                            // Syntax error due to malformed RegExp
                            dialog.findInput.classList.add('code-input_find-and-replace_error');
                            // Only show last part of error message
                            let messageParts = err.message.split(": ");
                            dialog.matchDescription.textContent = this.instructions.error(messageParts[messageParts.length-1]); // Show only last part of error.
                            return;
                        } else {
                            throw err;
                        }
                    }

                    if(dialog.findMatchState.numMatches > 0) {
                        dialog.findInput.classList.remove('code-input_find-and-replace_error');
                    } else {
                        // No matches - error
                        dialog.findInput.classList.add('code-input_find-and-replace_error');
                    }
                }
                this.updateMatchDescription(dialog);
            }
        }, 100);
    }

    /* Deal with Enter being pressed in the find field */
    checkFindPrompt(dialog, codeInput, event) {
        if (event.key == 'Enter') {
            // Find next match
            dialog.findMatchState.nextMatch();
            this.updateMatchDescription(dialog);
        }
    }

    /* Deal with Enter being pressed in the replace field */
    checkReplacePrompt(dialog, codeInput, event) {
        if (event.key == 'Enter') {
            // Replace focused match
            dialog.findMatchState.replaceOnce(dialog.replaceInput.value);
            dialog.replaceInput.focus();
            this.updateMatchDescription(dialog);
        }
    }

    /* Called with a dialog box keyup event to close and clear the dialog box */    
    cancelPrompt(dialog, codeInput, event) {
        event.preventDefault();

        // Add current value of find/replace to Ctrl+Z stack.
        this.findMatchesOnValueChange = false;
        dialog.findInput.focus();
        dialog.findInput.selectionStart = 0;
        dialog.findInput.selectionEnd = dialog.findInput.value.length;
        document.execCommand("insertText", false, dialog.findInput.value);
        this.findMatchesOnValueChange = true;

        // Reset original selection in code-input
        dialog.textarea.focus();
        dialog.setAttribute("inert", true); // Hide from keyboard navigation when closed.
        dialog.setAttribute("tabindex", -1); // Hide from keyboard navigation when closed.
        dialog.setAttribute("aria-hidden", true); // Hide from screen reader when closed.

        if(dialog.findMatchState.numMatches > 0) {
            // Select focused match
            codeInput.textareaElement.selectionStart = dialog.findMatchState.matchStartIndexes[dialog.findMatchState.focusedMatchID];
            codeInput.textareaElement.selectionEnd = dialog.findMatchState.matchEndIndexes[dialog.findMatchState.focusedMatchID];
        } else {
            // Select text selected before
            codeInput.textareaElement.selectionStart = dialog.selectionStart;
            codeInput.textareaElement.selectionEnd = dialog.selectionEnd;    
        }

        dialog.findMatchState.clearMatches();
        
        // Remove dialog after animation
        dialog.classList.add('code-input_find-and-replace_hidden-dialog');
    }

    /**
     * Show a find-and-replace dialog.
     * @param {codeInput.CodeInput} codeInputElement the `<code-input>` element.
     * @param {boolean} replacePartExpanded whether the replace part of the find-and-replace dialog should be expanded
    */
    showPrompt(codeInputElement, replacePartExpanded) {
        let dialog;
        if(codeInputElement.pluginData.findAndReplace == undefined || codeInputElement.pluginData.findAndReplace.dialog == undefined) {
            const textarea = codeInputElement.textareaElement;

            dialog = document.createElement('div');
            const findInput = document.createElement('input');
            const findCaseSensitiveCheckbox = document.createElement('input');
            const findRegExpCheckbox = document.createElement('input');
            // TODO in next major version: use more semantic HTML element than code
            const matchDescription = document.createElement('code');
            matchDescription.setAttribute("aria-live", "assertive"); // Screen reader must read the number of matches found.

            const replaceInput = document.createElement('input');
            const replaceDropdown = document.createElement('details');
            const replaceSummary = document.createElement('summary');

            const buttonContainer = document.createElement('div');
            const findNextButton = document.createElement('button');
            const findPreviousButton = document.createElement('button');
            const replaceButton = document.createElement('button');
            const replaceAllButton = document.createElement('button');

            // TODO: Make a button element (semantic HTML for accessibility) in next major version
            const cancel = document.createElement('span');
            cancel.setAttribute("role", "button");
            cancel.setAttribute("aria-label", this.instructions.closeDialog);
            cancel.setAttribute("tabindex", 0); // Visible to keyboard navigation
            cancel.setAttribute("title", this.instructions.closeDialog);

            buttonContainer.appendChild(findNextButton);
            buttonContainer.appendChild(findPreviousButton);
            buttonContainer.appendChild(replaceButton);
            buttonContainer.appendChild(replaceAllButton);
            buttonContainer.appendChild(cancel);
            dialog.appendChild(buttonContainer);

            dialog.appendChild(findInput);
            dialog.appendChild(findRegExpCheckbox);
            dialog.appendChild(findCaseSensitiveCheckbox);
            dialog.appendChild(matchDescription);
            replaceDropdown.appendChild(replaceSummary);
            replaceDropdown.appendChild(replaceInput);

            dialog.appendChild(replaceDropdown);

            dialog.className = 'code-input_find-and-replace_dialog';
            findInput.spellcheck = false;
            findInput.placeholder = this.instructions.findPlaceholder;
            findCaseSensitiveCheckbox.setAttribute("type", "checkbox");
            findCaseSensitiveCheckbox.title = this.instructions.findCaseSensitive;
            findCaseSensitiveCheckbox.classList.add("code-input_find-and-replace_case-sensitive-checkbox");
            findRegExpCheckbox.setAttribute("type", "checkbox");
            findRegExpCheckbox.title = this.instructions.findRegExp;
            findRegExpCheckbox.classList.add("code-input_find-and-replace_reg-exp-checkbox");

            matchDescription.textContent = this.instructions.start;
            matchDescription.classList.add("code-input_find-and-replace_match-description");
            

            replaceSummary.innerText = this.instructions.replaceTitle;
            replaceInput.spellcheck = false;
            replaceInput.placeholder = this.instructions.replacePlaceholder;
            findNextButton.innerText = "↓";
            findNextButton.title = this.instructions.findNext;
            findNextButton.setAttribute("aria-label", this.instructions.findNext);
            findPreviousButton.innerText = "↑";
            findPreviousButton.title = this.instructions.findPrevious;
            findNextButton.setAttribute("aria-label", this.instructions.findPrevious);
            replaceButton.className = 'code-input_find-and-replace_button-hidden';
            replaceButton.innerText = this.instructions.replaceActionShort;
            replaceButton.title = this.instructions.replaceAction;
            replaceButton.addEventListener("focus", () => {
                // Show replace section
                replaceDropdown.setAttribute("open", true);
            });
            replaceAllButton.className = 'code-input_find-and-replace_button-hidden';
            replaceAllButton.innerText = this.instructions.replaceAllActionShort;
            replaceAllButton.title = this.instructions.replaceAllAction;
            replaceAllButton.addEventListener("focus", () => {
                // Show replace section
                replaceDropdown.setAttribute("open", true);
            });

            findNextButton.addEventListener("click", (event) => {
                // Stop form submit
                event.preventDefault();

                dialog.findMatchState.nextMatch();
                this.updateMatchDescription(dialog);
            });
            findPreviousButton.addEventListener("click", () => {
                // Stop form submit
                event.preventDefault();

                dialog.findMatchState.previousMatch();
                this.updateMatchDescription(dialog);
            });
            replaceButton.addEventListener("click", (event) => {
                // Stop form submit
                event.preventDefault();

                dialog.findMatchState.replaceOnce(replaceInput.value);
                dialog.focus();
            });
            replaceAllButton.addEventListener("click", (event) => {
                // Stop form submit
                event.preventDefault();

                dialog.findMatchState.replaceAll(replaceInput.value);
                replaceAllButton.focus();
            });

            replaceDropdown.addEventListener("toggle", () => {
                // When replace dropdown opened show replace buttons
                replaceButton.classList.toggle("code-input_find-and-replace_button-hidden");
                replaceAllButton.classList.toggle("code-input_find-and-replace_button-hidden");
            });

            // To store the state of find-and-replace functionality
            dialog.findMatchState = new codeInput.plugins.FindAndReplace.FindMatchState(codeInputElement);

            dialog.codeInput = codeInputElement;
            dialog.textarea = textarea;
            dialog.findInput = findInput;
            dialog.findCaseSensitiveCheckbox = findCaseSensitiveCheckbox;
            dialog.findRegExpCheckbox = findRegExpCheckbox;
            dialog.matchDescription = matchDescription;
            dialog.replaceInput = replaceInput;
            dialog.replaceDropdown = replaceDropdown;

            if(this.checkCtrlH) {
                findInput.addEventListener('keydown', (event) => {
                    /* Open replace part on Ctrl+H */
                    if (event.ctrlKey && event.key == 'h') {
                        event.preventDefault();
                        replaceDropdown.setAttribute("open", true);
                    }
                });
            }

            findInput.addEventListener('keypress', (event) => {
                /* Stop enter from submitting form */
                if (event.key == 'Enter') event.preventDefault();
            });
            replaceInput.addEventListener('keypress', (event) => {
                /* Stop enter from submitting form */
                if (event.key == 'Enter') event.preventDefault();
            });
            replaceInput.addEventListener('input', (event) => {
                // Ctrl+Z can trigger this. If the dialog/replace dropdown aren't open, open them!
                if(dialog.classList.contains("code-input_find-and-replace_hidden-dialog")) {
                    // Show prompt
                    this.showPrompt(dialog.codeInput, true);
                } else if(!dialog.replaceDropdown.hasAttribute("open")) {
                    // Open dropdown
                    dialog.replaceDropdown.setAttribute("open", true);
                }
            });

            dialog.addEventListener('keyup', (event) => {
                /* Close prompt on Enter pressed */
                if (event.key == 'Escape') this.cancelPrompt(dialog, codeInputElement, event);
            });
            
            findInput.addEventListener('keyup', (event) => { this.checkFindPrompt(dialog, codeInputElement, event); });
            findInput.addEventListener('input', (event) => { 
                if(this.findMatchesOnValueChange) this.updateFindMatches(dialog);
                // Ctrl+Z can trigger this. If the dialog isn't open, open it!
                if(dialog.classList.contains("code-input_find-and-replace_hidden-dialog")) {
                    this.showPrompt(dialog.codeInput, false);
                }
            });
            findCaseSensitiveCheckbox.addEventListener('click', (event) => { this.updateFindMatches(dialog); });
            findRegExpCheckbox.addEventListener('click', (event) => { this.updateFindMatches(dialog); });

            replaceInput.addEventListener('keyup', (event) => { 
                this.checkReplacePrompt(dialog, codeInputElement, event);
                replaceInput.focus();
            });
            cancel.addEventListener('click', (event) => { this.cancelPrompt(dialog, codeInputElement, event); });
            cancel.addEventListener('keypress', (event) => { if (event.key == "Space" || event.key == "Enter") this.cancelPrompt(dialog, codeInputElement, event); });

            codeInputElement.dialogContainerElement.appendChild(dialog);
            codeInputElement.pluginData.findAndReplace = {dialog: dialog};
            findInput.focus();

            if(replacePartExpanded) {
                replaceDropdown.setAttribute("open", true);
            }

            // Save selection position
            dialog.selectionStart = codeInputElement.textareaElement.selectionStart;
            dialog.selectionEnd = codeInputElement.textareaElement.selectionEnd;

            if(dialog.selectionStart < dialog.selectionEnd) {
                // Copy selected text to Find input
                let textToFind = codeInputElement.textareaElement.value.substring(dialog.selectionStart, dialog.selectionEnd);
                dialog.findInput.focus();
                dialog.findInput.selectionStart = 0;
                dialog.findInput.selectionEnd = dialog.findInput.value.length;
                document.execCommand("insertText", false, textToFind);
            }
        } else {
            dialog = codeInputElement.pluginData.findAndReplace.dialog;
            // Re-open dialog
            dialog.classList.remove("code-input_find-and-replace_hidden-dialog");
            dialog.removeAttribute("inert"); // Show to keyboard navigation when open.
            dialog.setAttribute("tabindex", 0); // Show to keyboard navigation when open.
            dialog.removeAttribute("aria-hidden"); // Show to screen reader when open.
            dialog.findInput.focus();
            if(replacePartExpanded) {
                dialog.replaceDropdown.setAttribute("open", true);
            } else {
                dialog.replaceDropdown.removeAttribute("open");
            }
        }

        // Save selection position
        dialog.selectionStart = codeInputElement.textareaElement.selectionStart;
        dialog.selectionEnd = codeInputElement.textareaElement.selectionEnd;

        if(dialog.selectionStart < dialog.selectionEnd) {
            // Copy selected text to Find input
            let textToFind = codeInputElement.textareaElement.value.substring(dialog.selectionStart, dialog.selectionEnd);
            dialog.findInput.focus();
            dialog.findInput.selectionStart = 0;
            dialog.findInput.selectionEnd = dialog.findInput.value.length;
            document.execCommand("insertText", false, textToFind);
        }
        
        // Highlight matches
        this.updateFindMatches(dialog);
    }

    /* Event handler for keydown event that makes Ctrl+F open find dialog */
    checkCtrlF(codeInput, event) {
        if (event.ctrlKey && event.key == 'f') {
            event.preventDefault();
            this.showPrompt(codeInput, false);
        }
    }

    /* Event handler for keydown event that makes Ctrl+H open find+replace dialog */
    checkCtrlH(codeInput, event) {
        if (event.ctrlKey && event.key == 'h') {
            event.preventDefault();
            this.showPrompt(codeInput, true);
        }
    }
}

// Number of matches to highlight at once, for efficiency reasons
const CODE_INPUT_FIND_AND_REPLACE_MATCH_BLOCK_SIZE = 500;

/* This class stores the state of find and replace in a specific code-input element */
codeInput.plugins.FindAndReplace.FindMatchState = class {
    codeInput = null;
    lastValue = null; // of codeInput, so know when to update matches
    lastSearchRegexp = null; // to be able to update matches
    numMatches = 0;
    focusedMatchID = 0;
    matchStartIndexes = []; // For each match in order
    matchEndIndexes = []; // For each match in order
    focusedMatchStartIndex = 0;
    
    matchBlocksHighlighted = []; // Each block represents a CODE_INPUT_FIND_AND_REPLACE_MATCH_BLOCK_SIZE number of matches (up to it for the last), and is highlighted separately to prevent excessive delay.

    constructor(codeInputElement) {
        this.focusedMatchStartIndex = codeInputElement.textareaElement.selectionStart;
        this.codeInput = codeInputElement;
    }

    /* Clear the find matches, often to prepare for new matches to be added. */
    clearMatches() {
        // Delete match information saved here
        this.numMatches = 0;
        this.matchStartIndexes = []; 
        this.matchEndIndexes = []; 

        // Remove generated spans to hold matches
        let tempSpans = this.codeInput.codeElement.querySelectorAll(".code-input_find-and-replace_temporary-span");
        for(let i = 0; i < tempSpans.length; i++) {
            // Replace with textContent as Text node
            tempSpans[i].parentElement.replaceChild(new Text(tempSpans[i].textContent), tempSpans[i]);
        }

        // Remove old matches
        let oldMatches = this.codeInput.codeElement.querySelectorAll(".code-input_find-and-replace_find-match");
        for(let i = 0; i < oldMatches.length; i++) {
            oldMatches[i].removeAttribute("data-code-input_find-and-replace_match-id"); // No match ID
            oldMatches[i].classList.remove("code-input_find-and-replace_find-match"); // No highlighting
            oldMatches[i].classList.remove("code-input_find-and-replace_find-match-focused"); // No focused highlighting
        }        
    }

    /* Refresh the matches of find functionality with a new search term Regular Expression. */
    updateMatches(searchRegexp) {
        this.lastSearchRegexp = searchRegexp;
        this.lastValue = this.codeInput.value;
        // Add matches
        let matchID = 0;
        let match; // Search result
        this.matchStartIndexes = [];
        this.matchEndIndexes = [];
        this.matchBlocksHighlighted = [];

        // Make all match blocks be not highlighted except for currently focused
        let focusedMatchBlock = Math.floor(this.focusedMatchID / CODE_INPUT_FIND_AND_REPLACE_MATCH_BLOCK_SIZE);
        for(let i = 0; i < focusedMatchBlock; i++) {
            this.matchBlocksHighlighted.push(false);
        }
        this.matchBlocksHighlighted.push(true);

        while ((match = searchRegexp.exec(this.codeInput.value)) !== null) {
            let matchText = match[0];
            if(matchText.length == 0) {
                throw SyntaxError(this.instructions.infiniteLoopError);
            }

            // Add next match block if needed
            let currentMatchBlock = Math.floor(matchID / CODE_INPUT_FIND_AND_REPLACE_MATCH_BLOCK_SIZE);
            if(this.matchBlocksHighlighted.length < currentMatchBlock) {
                this.matchBlocksHighlighted.push(false);
            }

            if(this.matchBlocksHighlighted[currentMatchBlock]) {
                this.highlightMatch(matchID, this.codeInput.codeElement, match.index, match.index + matchText.length);
            }
            this.matchStartIndexes.push(match.index);
            this.matchEndIndexes.push(match.index + matchText.length);
            matchID++;
        }
        this.numMatches = matchID;

        if(this.numMatches > 0) {
            this.focusMatch();
        }
    }

    /* Highlight all currently found matches again if there are any matches */
    rehighlightMatches() {
        this.updateMatches(this.lastSearchRegexp);
        this.focusMatch();
    }

    /* Replace one match with the replacementText given */
    replaceOnce(replacementText) {
        if(this.numMatches > 0 && replacementText != this.codeInput.value.substring(0, this.matchStartIndexes[this.focusedMatchID], this.matchEndIndexes[this.focusedMatchID])) {
            // Go to next match
            this.focusedMatchStartIndex += replacementText.length;

            // Select the match
            this.codeInput.handleEventsFromTextarea = false;
            this.codeInput.textareaElement.focus();
            this.codeInput.textareaElement.selectionStart = this.matchStartIndexes[this.focusedMatchID];
            this.codeInput.textareaElement.selectionEnd = this.matchEndIndexes[this.focusedMatchID];

            // Replace it with the replacement text
            document.execCommand("insertText", false, replacementText);
            this.codeInput.handleEventsFromTextarea = true;
        }
    }

    /* Replace all matches with the replacementText given */
    replaceAll(replacementText) {
        const replacementNumChars = replacementText.length;
        let numCharsAdded = 0; // So can adjust match positions

        for(let i = 0; i < this.numMatches; i++) {
            // Replace each match
            
            // Select the match, taking into account characters added before
            this.codeInput.handleEventsFromTextarea = false;
            this.codeInput.textareaElement.focus();
            this.codeInput.textareaElement.selectionStart = this.matchStartIndexes[i] + numCharsAdded;
            this.codeInput.textareaElement.selectionEnd = this.matchEndIndexes[i] + numCharsAdded;

            numCharsAdded += replacementNumChars - (this.matchEndIndexes[i] - this.matchStartIndexes[i]);

            // Replace it with the replacement text
            document.execCommand("insertText", false, replacementText);
            this.codeInput.handleEventsFromTextarea = true;
        }
    }

    /* Focus on the next match found in the find results */
    nextMatch() {
        this.focusMatch((this.focusedMatchID + 1) % this.numMatches);
    }

    /* Focus on the previous match found in the find results */
    previousMatch() {
        this.focusMatch((this.focusedMatchID + this.numMatches - 1) % this.numMatches);
    }

    /* Change the focused match to the match with ID matchID. */
    focusMatch(matchID = undefined) {
        if(matchID === undefined) {
            // Focus on first match after focusedMatchStartIndex
            matchID = 0;
            while(matchID < this.matchStartIndexes.length && this.matchStartIndexes[matchID] < this.focusedMatchStartIndex) {
                matchID++;
            }
            if(matchID >= this.matchStartIndexes.length) {
                // After last match, move back to first match
                matchID = 0;
            }
        }
        
        // Save focusedMatchStartIndex so if code changed match stays at same place
        this.focusedMatchStartIndex = this.matchStartIndexes[matchID];
        this.focusedMatchID = matchID;

        // Delete old focus
        let oldFocused = this.codeInput.codeElement.querySelectorAll(".code-input_find-and-replace_find-match-focused");
        for(let i = 0; i < oldFocused.length; i++) {
            oldFocused[i].classList.remove("code-input_find-and-replace_find-match-focused");
        }

        // Highlight match block if needed
        let highlightedMatchBlock = Math.floor(matchID / CODE_INPUT_FIND_AND_REPLACE_MATCH_BLOCK_SIZE);
        if(!this.matchBlocksHighlighted[highlightedMatchBlock]) {
            this.matchBlocksHighlighted[highlightedMatchBlock] = true;
            for(let i = CODE_INPUT_FIND_AND_REPLACE_MATCH_BLOCK_SIZE*highlightedMatchBlock; i < CODE_INPUT_FIND_AND_REPLACE_MATCH_BLOCK_SIZE*(highlightedMatchBlock+1); i++) {
                // Highlight match
                this.highlightMatch(i, this.codeInput.codeElement, this.matchStartIndexes[i], this.matchEndIndexes[i])
            }
        }

        // Add new focus
        let newFocused = this.codeInput.codeElement.querySelectorAll(`.code-input_find-and-replace_find-match[data-code-input_find-and-replace_match-id="${matchID}"]`);
        for(let i = 0; i < newFocused.length; i++) {
            newFocused[i].classList.add("code-input_find-and-replace_find-match-focused");
        }
        
        if(newFocused.length > 0) {
            this.codeInput.scrollTo(newFocused[0].offsetLeft - this.codeInput.offsetWidth / 2, newFocused[0].offsetTop - this.codeInput.offsetHeight / 2); // So focused match in centre of screen
        }
    }

    /* Highlight a match from the find functionality given its start and end indexes in the text.
    Start from the currentElement. Use the matchID in the class name
    of the match so different matches can be identified.
    */
    highlightMatch(matchID, currentElement, startIndex, endIndex) {
        const lines = currentElement.textContent.substring(startIndex, endIndex).split("\n");
        let lineStartIndex = startIndex;
        for(let i = 0; i < lines.length; i++) {
            if(i == 0) {
                this.highlightMatchNewlineOnlyAtStart(matchID, currentElement, lineStartIndex, lineStartIndex+lines[i].length);
            } else {
                // Include previous newline character too
                this.highlightMatchNewlineOnlyAtStart(matchID, currentElement, lineStartIndex-1, lineStartIndex+lines[i].length);
            }

            lineStartIndex += lines[i].length + 1; // +1 for newline character
        }
    }

    /* Same as highlightMatch, but assumes any newlines in the
    match are at the startIndex (for simpler code). */
    highlightMatchNewlineOnlyAtStart(matchID, currentElement, startIndex, endIndex) {
        for(let i = 0; i < currentElement.childNodes.length; i++) {
            let childElement = currentElement.childNodes[i];
            let childText = childElement.textContent;

            let noInnerElements = false;
            if(childElement.nodeType == 3) {
                // Text node
                if(i + 1 < currentElement.childNodes.length && currentElement.childNodes[i+1].nodeType == 3) {
                    // Can merge with next text node
                    currentElement.childNodes[i+1].textContent = childElement.textContent + currentElement.childNodes[i+1].textContent; // Merge textContent with next node
                    currentElement.removeChild(childElement); // Delete this node
                    i--; // As an element removed
                    continue; // Move to next node
                }
                // Text node - replace with span
                noInnerElements = true;

                let replacementElement = document.createElement("span");
                replacementElement.textContent = childText;
                replacementElement.classList.add("code-input_find-and-replace_temporary-span"); // Can remove span later
                
                currentElement.replaceChild(replacementElement, childElement);
                childElement = replacementElement;
            }

            if(startIndex <= 0) {
                // Started highlight
                if(childText.length >= endIndex) {
                    // Match ends in childElement
                    if(noInnerElements) {
                        // Text node - highlight first part
                        let startSpan = document.createElement("span");
                        startSpan.classList.add("code-input_find-and-replace_find-match"); // Highlighted
                        startSpan.setAttribute("data-code-input_find-and-replace_match-id", matchID);
                        startSpan.classList.add("code-input_find-and-replace_temporary-span"); // Can remove span later
                        startSpan.textContent = childText.substring(0, endIndex);
                        if(startSpan.textContent[0] == "\n") {
                            // Newline at start - make clear
                            startSpan.classList.add("code-input_find-and-replace_start-newline");
                        }

                        let endText = childText.substring(endIndex);
                        childElement.textContent = endText;
                        
                        childElement.insertAdjacentElement('beforebegin', startSpan);
                        i++; // An extra element has been added
                        return;
                    } else {
                        this.highlightMatchNewlineOnlyAtStart(matchID, childElement, 0, endIndex);
                    }

                    // Match ended - nothing to do after backtracking
                    return;
                } else {
                    // Match goes through child element
                    childElement.classList.add("code-input_find-and-replace_find-match"); // Highlighted
                    childElement.setAttribute("data-code-input_find-and-replace_match-id", matchID);
                    if(childElement.textContent[0] == "\n") {
                        // Newline at start - make clear
                        childElement.classList.add("code-input_find-and-replace_start-newline");
                    }
                }
            } else if(childText.length > startIndex) {
                // Match starts in childElement
                if(noInnerElements) {
                    if(childText.length > endIndex) {
                        // Match starts and ends in childElement - highlight middle part
                        // Text node - highlight last part
                        let startSpan = document.createElement("span");
                        startSpan.classList.add("code-input_find-and-replace_temporary-span"); // Can remove span later
                        startSpan.textContent = childText.substring(0, startIndex);

                        let middleText = childText.substring(startIndex, endIndex);
                        childElement.textContent = middleText;
                        childElement.classList.add("code-input_find-and-replace_find-match"); // Highlighted
                        childElement.setAttribute("data-code-input_find-and-replace_match-id", matchID);
                        if(childElement.textContent[0] == "\n") {
                            // Newline at start - make clear
                            childElement.classList.add("code-input_find-and-replace_start-newline");
                        }

                        let endSpan = document.createElement("span");
                        endSpan.classList.add("code-input_find-and-replace_temporary-span"); // Can remove span later
                        endSpan.textContent = childText.substring(endIndex);
                        
                        childElement.insertAdjacentElement('beforebegin', startSpan);
                        childElement.insertAdjacentElement('afterend', endSpan);
                        i++; // 2 extra elements have been added
                    } else {
                        // Text node - highlight last part
                        let startText = childText.substring(0, startIndex);
                        childElement.textContent = startText;

                        let endSpan = document.createElement("span");
                        endSpan.classList.add("code-input_find-and-replace_find-match"); // Highlighted
                        endSpan.setAttribute("data-code-input_find-and-replace_match-id", matchID);
                        endSpan.classList.add("code-input_find-and-replace_temporary-span"); // Can remove span later
                        endSpan.textContent = childText.substring(startIndex);
                        if(endSpan.textContent[0] == "\n") {
                            // Newline at start - make clear
                            endSpan.classList.add("code-input_find-and-replace_start-newline");
                        }

                        childElement.insertAdjacentElement('afterend', endSpan);
                        i++; // An extra element has been added
                    }
                } else {
                    this.highlightMatchNewlineOnlyAtStart(matchID, childElement, startIndex, endIndex);
                }
                
                if(childText.length > endIndex) {
                    // Match completely in childElement - nothing to do after backtracking
                    return;
                }
            }

            // Make indexes skip the element
            startIndex -= childText.length;
            endIndex -= childText.length;
        }
    }
}
