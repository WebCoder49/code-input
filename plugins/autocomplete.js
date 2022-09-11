/**
 *
 */
codeInput.plugins.Autocomplete = class extends codeInput.Plugin {
    /**
     * Pass in a function to display the popup that takes in (popup element, textarea, textarea.selectionEnd).
     * @param {function} updatePopupCallback  
     */
    constructor(updatePopupCallback) {
        super();
        this.updatePopupCallback = updatePopupCallback;
    }
    /* When a key is pressed, or scrolling occurs, update the autocomplete */
    updatePopup(codeInput, onlyScrolled) {
        let textarea = codeInput.querySelector("textarea");
        let caretCoords = this.getCaretCoordinates(codeInput, textarea, textarea.selectionEnd, onlyScrolled);
        let popupElem = codeInput.querySelector(".code-input_autocomplete_popup");
        popupElem.style.top = caretCoords.top + "px";
        popupElem.style.left = caretCoords.left + "px";
        
        if(!onlyScrolled) {
            this.updatePopupCallback(popupElem, textarea, textarea.selectionEnd);
        }
    }
    /* Runs after elements are added into a `code-input` (useful for adding events to the textarea); Params: codeInput element) */
    afterElementsAdded(codeInput) {
        let popupElem = document.createElement("div");
        popupElem.classList.add("code-input_autocomplete_popup");
        codeInput.appendChild(popupElem);

        let testPosElem = document.createElement("pre");
        testPosElem.classList.add("code-input_autocomplete_testpos");
        codeInput.appendChild(testPosElem); // Styled like first pre, but first pre found to update

        let textarea = codeInput.querySelector("textarea");
        textarea.addEventListener("keyup", this.updatePopup.bind(this, codeInput, false)); // Override this+args in bind - not just scrolling
        textarea.addEventListener("click", this.updatePopup.bind(this, codeInput, false)); // Override this+args in bind - not just scrolling
        textarea.addEventListener("scroll", this.updatePopup.bind(this, codeInput, true)); // Override this+args in bind - just scrolling
    }
    /**
     * Return the coordinates of the caret in a code-input
     * @param {codeInput.CodeInput} codeInput 
     * @param {HTMLElement} textarea 
     * @param {Number} charIndex 
     * @param {boolean} onlyScrolled True if no edits have been made to the text and the caret hasn't been repositioned 
     * @returns 
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
    observedAttributes = [];
    updatePopupCallback = function() {};
}