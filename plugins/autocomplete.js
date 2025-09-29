/**
 * Display a popup under the caret using the text in the code-input element. This works well with autocomplete suggestions.
 * Files: autocomplete.js / autocomplete.css
 */
"use strict";

codeInput.plugins.Autocomplete = class extends codeInput.Plugin {
    /**
     * Pass in a function to create a plugin that displays the popup that takes in (popup element, textarea, textarea.selectionEnd).
     * @param {(popupElement: HTMLElement, textarea: HTMLTextAreaElement, selectionEnd: number) => void} updatePopupCallback  a function to display the popup that takes in (popup element, textarea, textarea.selectionEnd).
     */
    constructor(updatePopupCallback) {
        super([]); // No observed attributes
        this.updatePopupCallback = updatePopupCallback;
    }
    /* When a key is pressed, or scrolling occurs, update the popup position */
    updatePopup(codeInput, onlyScrolled) {
        let textarea = codeInput.textareaElement;
        let caretCoords = this.getCaretCoordinates(codeInput, textarea, textarea.selectionEnd, onlyScrolled);
        let popupElem = codeInput.querySelector(".code-input_autocomplete_popup");
        popupElem.style.top = caretCoords.top + "px";
        popupElem.style.left = caretCoords.left + "px";
        
        if(!onlyScrolled) {
            this.updatePopupCallback(popupElem, textarea, textarea.selectionEnd, textarea.selectionStart);
        }
    }
    /* Create the popup element */
    afterElementsAdded(codeInput) {
        let popupElem = document.createElement("div");
        popupElem.classList.add("code-input_autocomplete_popup");
        codeInput.appendChild(popupElem);

        let testPosPre = document.createElement("pre");
        testPosPre.classList.add("code-input_autocomplete_invisiblepre"); // Hide visually
        testPosPre.setAttribute("aria-hidden", true); // Hide for screen readers
        if(codeInput.templateObject.preElementStyled) {
            testPosPre.classList.add("code-input_autocomplete_testpos");
            codeInput.appendChild(testPosPre); // Styled like first pre, but first pre found to update    
        } else {
            let testPosCode = document.createElement("code");
            testPosCode.classList.add("code-input_autocomplete_testpos");
            testPosPre.appendChild(testPosCode);
            codeInput.appendChild(testPosPre); // Styled like first pre, but first pre found to update
        }
        
        let textarea = codeInput.textareaElement;
        textarea.addEventListener("input", () => { this.updatePopup(codeInput, false)});
        textarea.addEventListener("selectionchange", () => { this.updatePopup(codeInput, false)});
    }
    /**
     * Return the coordinates of the caret in a code-input
     * @param {codeInput.CodeInput} codeInput 
     * @param {HTMLElement} textarea 
     * @param {Number} charIndex 
     * @param {boolean} onlyScrolled True if no edits have been made to the text and the caret hasn't been repositioned 
     * @returns {Object} {"top": CSS top value in pixels, "left": CSS left value in pixels}
     */
    getCaretCoordinates(codeInput, textarea, charIndex, onlyScrolled) {
        let afterSpan;
        if(onlyScrolled) {
            // No edits to text; don't update element - span at index 1 is after span
            let spans = codeInput.querySelector(".code-input_autocomplete_testpos").querySelectorAll("span");
            if(spans.length < 2) {
                // Hasn't saved text in test pre to find pos
                // Need to regenerate text in test pre
                return this.getCaretCoordinates(codeInput, textarea, charIndex, false);
            } 
            afterSpan = spans[1];
        } else {
            /* Inspired by https://github.com/component/textarea-caret-position */
            let testPosElem = codeInput.querySelector(".code-input_autocomplete_testpos");
            
            let beforeSpan = document.createElement("span");
            beforeSpan.textContent = textarea.value.substring(0, charIndex);
            afterSpan = document.createElement("span");
            afterSpan.textContent = "."; // Placeholder

            // Clear test pre - https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
            while (testPosElem.firstChild) {
                testPosElem.removeChild(testPosElem.firstChild);
            }
            testPosElem.appendChild(beforeSpan);
            testPosElem.appendChild(afterSpan);
        }
        return {"top": afterSpan.offsetTop - textarea.scrollTop, "left": afterSpan.offsetLeft - textarea.scrollLeft};
    }
    updatePopupCallback = function() {};
}
