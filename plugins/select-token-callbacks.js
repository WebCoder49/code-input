/**
 * Make tokens in the <pre><code> element that are included within the selected text of the <code-input>
 * gain a CSS class while selected, or trigger JavaScript callbacks.
 * Files: select-token-callbacks.js
 */
"use strict";

codeInput.plugins.SelectTokenCallbacks = class extends codeInput.Plugin {
    /**
     * Set up the behaviour of tokens text-selected in the `<code-input>` element, and the exact definition of a token being text-selected.
     * 
     * All parameters are optional. If you provide no arguments to the constructor, this will dynamically apply the "code-input_select-token-callbacks_selected" class to selected tokens only, for you to style via CSS.
     * 
     * @param {codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks} tokenSelectorCallbacks What to do with text-selected tokens. See docstrings for the TokenSelectorCallbacks class.
     * @param {boolean} onlyCaretNotSelection If true, tokens will only be marked as selected when no text is selected but rather the caret is inside them (start of selection == end of selection). Default false.
     * @param {boolean} caretAtStartIsSelected Whether the caret or text selection's end being just before the first character of a token means said token is selected. Default true.
     * @param {boolean} caretAtEndIsSelected Whether the caret or text selection's start being just after the last character of a token means said token is selected. Default true.
     * @param {boolean} createSubTokens Whether temporary `<span>` elements should be created inside partially-selected tokens containing just the selected text and given the selected class. Default false.
     * @param {boolean} partiallySelectedTokensAreSelected Whether tokens for which only some of their text is selected should be treated as selected. Default true.
     * @param {boolean} parentTokensAreSelected Whether all parent tokens of selected tokens should be treated as selected. Default true.
     */
    constructor(tokenSelectorCallbacks = codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks.createClassSynchronisation(), onlyCaretNotSelection = false, caretAtStartIsSelected = true, caretAtEndIsSelected = true, createSubTokens = false, partiallySelectedTokensAreSelected = true, parentTokensAreSelected = true) {
        super([]); // No observed attributes

        this.tokenSelectorCallbacks = tokenSelectorCallbacks;
        this.onlyCaretNotSelection = onlyCaretNotSelection;
        this.caretAtStartIsSelected = caretAtStartIsSelected;
        this.caretAtEndIsSelected = caretAtEndIsSelected;
        this.createSubTokens = createSubTokens;
        this.partiallySelectedTokensAreSelected = partiallySelectedTokensAreSelected;
        this.parentTokensAreSelected = parentTokensAreSelected;
    }
    /* Runs after code is highlighted; Params: codeInput element) */
    afterHighlight(codeInputElement) {
        this.syncSelection(codeInputElement);
    }
    /* Runs after elements are added into a `code-input` (useful for adding events to the textarea); Params: codeInput element) */
    afterElementsAdded(codeInputElement) {
        codeInputElement.pluginData.selectTokenCallbacks = {};
        codeInputElement.pluginData.selectTokenCallbacks.lastSelectionStart = codeInputElement.textareaElement.selectionStart;
        codeInputElement.pluginData.selectTokenCallbacks.lastSelectionEnd = codeInputElement.textareaElement.selectionEnd;
        codeInputElement.pluginData.selectTokenCallbacks.selectedTokenState = new codeInput.plugins.SelectTokenCallbacks.SelectedTokenState(codeInputElement.codeElement, this.tokenSelectorCallbacks, this.onlyCaretNotSelection, this.caretAtStartIsSelected, this.caretAtEndIsSelected, this.createSubTokens, this.partiallySelectedTokensAreSelected, this.parentTokensAreSelected);
        this.syncSelection(codeInputElement);

        // As of 2024-08, the selectionchange event is only supported on Firefox.
        codeInputElement.textareaElement.addEventListener("selectionchange", () => {
            this.checkSelectionChanged(codeInputElement)
        });
        // When selectionchange has complete support, the listeners below can be deleted.
        codeInputElement.textareaElement.addEventListener("select", () => {
            this.checkSelectionChanged(codeInputElement)
        });
        codeInputElement.textareaElement.addEventListener("keypress", () => {
            this.checkSelectionChanged(codeInputElement)
        });
        codeInputElement.textareaElement.addEventListener("mousedown", () => {
            this.checkSelectionChanged(codeInputElement)
        });
    }
    /* If the text selection has changed, run syncSelection. */
    checkSelectionChanged(codeInputElement) {
        if(
            codeInputElement.textareaElement.selectionStart != codeInputElement.pluginData.selectTokenCallbacks.lastSelectionStart
            || codeInputElement.textareaElement.selectionEnd != codeInputElement.pluginData.selectTokenCallbacks.lastSelectionEnd
        ) {
            this.syncSelection(codeInputElement);
            codeInputElement.pluginData.selectTokenCallbacks.lastSelectionStart = codeInputElement.textareaElement.selectionStart;
            codeInputElement.pluginData.selectTokenCallbacks.lastSelectionEnd = codeInputElement.textareaElement.selectionEnd;
        }
    }
    /* Update which elements have the code-input_selected class. */
    syncSelection(codeInputElement) {
        codeInputElement.pluginData.selectTokenCallbacks.selectedTokenState.updateSelection(codeInputElement.textareaElement.selectionStart, codeInputElement.textareaElement.selectionEnd)
    }
}

/**
 * A data structure specifying what should be done with tokens when they are selected, and also allows for previously selected
 * tokens to be dealt with each time the selection changes. See the constructor and the createClassSynchronisation static method.
 */
codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks = class {
    /**
     * Pass any callbacks you want to customise the behaviour of selected tokens via JavaScript.
     * 
     * (If the behaviour you want is just differently styling selected tokens _via CSS_, you should probably use the createClassSynchronisation static method.) 
     * @param {(token: HTMLElement) => void} tokenSelectedCallback Runs multiple times when the text selection inside the code-input changes, each time inputting a single (part of the highlighted `<pre><code>`) token element that is selected in the new text selection.
     * @param {(tokenContainer: HTMLElement) => void} selectChangedCallback Each time the text selection inside the code-input changes, runs once before any tokenSelectedCallback calls, inputting the highlighted `<pre><code>`'s `<code>` element that contains all token elements.
     */
    constructor(tokenSelectedCallback, selectChangedCallback) {
        this.tokenSelectedCallback = tokenSelectedCallback;
        this.selectChangedCallback = selectChangedCallback;
    }

    /**
     * Use preset callbacks which ensure all tokens in the selected text range in the `<code-input>`, and only such tokens, are given a certain CSS class.
     * 
     * (If the behaviour you want requires more complex behaviour or JavaScript, you should use TokenSelectorCallbacks' constructor.) 
     * 
     * @param {string} selectedClass The CSS class that will be present on tokens only when they are part of the selected text in the `<code-input>` element. Defaults to "code-input_select-token-callbacks_selected".
     * @returns A new TokenSelectorCallbacks instance that encodes this behaviour.
     */
    static createClassSynchronisation(selectedClass = "code-input_select-token-callbacks_selected") {
        return new codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks(
            (token) => {
                token.classList.add(selectedClass);
            },
            (tokenContainer) => {
                // Remove selected class
                let selectedClassTokens = tokenContainer.getElementsByClassName(selectedClass);
                // Use it like a queue, because as elements have their class name removed they are live-removed from the collection.
                while(selectedClassTokens.length > 0) {
                    selectedClassTokens[0].classList.remove(selectedClass);
                }
            }
        );
    }
}

/* Manages a single <code-input> element's selected tokens, and calling the correct functions on the selected tokens */
codeInput.plugins.SelectTokenCallbacks.SelectedTokenState = class {
    constructor(codeElement, tokenSelectorCallbacks, onlyCaretNotSelection, caretAtStartIsSelected, caretAtEndIsSelected, createSubTokens, partiallySelectedTokensAreSelected, parentTokensAreSelected) {
        this.tokenContainer = codeElement;
        this.tokenSelectorCallbacks = tokenSelectorCallbacks;
        this.onlyCaretNotSelection = onlyCaretNotSelection;
        this.caretAtStartIsSelected = caretAtStartIsSelected;
        this.caretAtEndIsSelected = caretAtEndIsSelected;
        this.createSubTokens = createSubTokens;
        this.partiallySelectedTokensAreSelected = partiallySelectedTokensAreSelected;
        this.parentTokensAreSelected = parentTokensAreSelected;
    }

    /* Change the selected region to a new range from selectionStart to selectionEnd and run
    the callbacks. */
    updateSelection(selectionStart, selectionEnd) {
        this.selectChanged()
        if(!this.onlyCaretNotSelection || selectionStart == selectionEnd) { // Only deal with selected text if onlyCaretNotSelection is false.
            this.updateSelectedTokens(this.tokenContainer, selectionStart, selectionEnd)
        }
    }
    /* Runs when the text selection has changed, before any updateSelectedTokens call. */
    selectChanged() {
        if(this.createSubTokens) {
            // Remove generated spans to hold selected partial tokens
            let tempSpans = this.tokenContainer.getElementsByClassName("code-input_select-token-callbacks_temporary-span");
            while(tempSpans.length > 0) {
                // Replace with textContent as Text node
                // Use it like a queue, because as elements have their class name removed they are live-removed from the collection.
                tempSpans[0].parentElement.replaceChild(new Text(tempSpans[0].textContent), tempSpans[0]);
            }
        }

        this.tokenSelectorCallbacks.selectChangedCallback(this.tokenContainer);
    }

    /* Do the desired behaviour for selection to all tokens (elements in the currentElement)
    from startIndex to endIndex in the text. Start from the currentElement as this function is recursive.
    This code is similar to codeInput.plugins.FindAndReplace.FindMatchState.highlightMatch*/
    updateSelectedTokens(currentElement, startIndex, endIndex) {
        if(endIndex < 0 || endIndex == 0 && !this.caretAtStartIsSelected) {
            return; // Nothing selected
        }
        if(this.parentTokensAreSelected && currentElement !== this.tokenContainer) {
            this.tokenSelectorCallbacks.tokenSelectedCallback(currentElement); // Parent elements also marked with class / have callback called
        }
        for(let i = 0; i < currentElement.childNodes.length; i++) {
            let childElement = currentElement.childNodes[i];
            let childText = childElement.textContent;

            let noInnerElements = false;
            if(childElement.nodeType == 3) {
                // Text node
                if(this.createSubTokens) {
                    // Replace with token
                    if(i + 1 < currentElement.childNodes.length && currentElement.childNodes[i+1].nodeType == 3) {
                        // Can merge with next text node
                        currentElement.childNodes[i+1].textContent = childElement.textContent + currentElement.childNodes[i+1].textContent; // Merge textContent with next node
                        currentElement.removeChild(childElement); // Delete this node
                        i--; // As an element removed
                        continue; // Move to next node
                    }
                    noInnerElements = true;
    
                    let replacementElement = document.createElement("span");
                    replacementElement.textContent = childText;
                    replacementElement.classList.add("code-input_select-token-callbacks_temporary-span"); // Can remove span later
                    
                    currentElement.replaceChild(replacementElement, childElement);
                    childElement = replacementElement;
                } else {
                    // Skip text node
                    // Make indexes skip the element
                    startIndex -= childText.length;
                    endIndex -= childText.length;
                    continue;
                }
            }

            if(startIndex <= 0) {
                // Started selection
                if(childText.length > endIndex) {
                    // Selection ends in childElement
                    if(this.partiallySelectedTokensAreSelected) {
                        if(noInnerElements) {
                            if(this.createSubTokens && startIndex != endIndex) { // Subtoken to create
                                // Text node - add selection class to first part
                                let startSpan = document.createElement("span");
                                this.tokenSelectorCallbacks.tokenSelectedCallback(startSpan); // Selected
                                startSpan.classList.add("code-input_select-token-callbacks_temporary-span"); // Can remove span later
                                startSpan.textContent = childText.substring(0, endIndex);

                                let endText = childText.substring(endIndex);
                                childElement.textContent = endText;
                                
                                childElement.insertAdjacentElement('beforebegin', startSpan);
                                i++; // An extra element has been added
                            }
                            if(this.parentTokensAreSelected || !this.createSubTokens) {
                                this.tokenSelectorCallbacks.tokenSelectedCallback(childElement); // Selected                                
                            }
                        } else {
                            this.updateSelectedTokens(childElement, 0, endIndex);
                        }
                    }

                    // Match ended - nothing to do after backtracking
                    return;
                } else {
                    // Match goes through child element
                    this.tokenSelectorCallbacks.tokenSelectedCallback(childElement); // Selected
                }
            } else if(this.caretAtEndIsSelected && childText.length >= startIndex || childText.length > startIndex) {
                // Match starts in childElement
                if(this.partiallySelectedTokensAreSelected) {
                    if(noInnerElements) {
                        if(this.createSubTokens && startIndex != endIndex) { // Subtoken to create
                            if(childText.length > endIndex) {
                                // Match starts and ends in childElement - selection middle part
                                let startSpan = document.createElement("span");
                                startSpan.classList.add("code-input_select-token-callbacks_temporary-span"); // Can remove span later
                                startSpan.textContent = childText.substring(0, startIndex);
    
                                let middleText = childText.substring(startIndex, endIndex);
                                childElement.textContent = middleText;
                                this.tokenSelectorCallbacks.tokenSelectedCallback(childElement); // Selection
    
                                let endSpan = document.createElement("span");
                                endSpan.classList.add("code-input_select-token-callbacks_temporary-span"); // Can remove span later
                                endSpan.textContent = childText.substring(endIndex);
                                
                                childElement.insertAdjacentElement('beforebegin', startSpan);
                                childElement.insertAdjacentElement('afterend', endSpan);
                                i++; // 2 extra elements have been added
                            } else {
                                // Match starts in element - highlight last part
                                let startText = childText.substring(0, startIndex);
                                childElement.textContent = startText;
    
                                let endSpan = document.createElement("span");
                                this.tokenSelectorCallbacks.tokenSelectedCallback(endSpan); // Selected
                                endSpan.classList.add("code-input_select-token-callbacks_temporary-span"); // Can remove span later
                                endSpan.textContent = childText.substring(startIndex);
    
                                childElement.insertAdjacentElement('afterend', endSpan);
                                i++; // An extra element has been added
                            }
                        }
                        if(this.parentTokensAreSelected || !this.createSubTokens) {
                            this.tokenSelectorCallbacks.tokenSelectedCallback(childElement); // Selected                                
                        }
                    } else {
                        this.updateSelectedTokens(childElement, startIndex, endIndex);
                    }
                }
                
                if(this.caretAtStartIsSelected) {
                    if(childText.length > endIndex) {
                        // Match completely in childElement - nothing to do after backtracking
                        return;
                    }
                } else if(childText.length >= endIndex) {
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
