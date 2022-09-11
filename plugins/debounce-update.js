/**
 * Debounce the update and highlighting function
 *  https://medium.com/@jamischarles/what-is-debouncing-2505c0648ff1
 */
codeInput.plugins.DebounceUpdate = class extends codeInput.Plugin {
    /**
     * Create a debounced update plugin to pass into a template
     * @param {Number} delayMs Delay, in ms, to wait until updating the syntax highlighting 
     */
    constructor(delayMs) {
        super();
        this.delayMs = delayMs;
    }
    /* Runs before elements are added into a `code-input`; Params: codeInput element) */
    beforeElementsAdded(codeInput) {
        console.log(codeInput, "before elements added");
        this.update = codeInput.update.bind(codeInput); // Save previous update func
        codeInput.update = this.updateDebounced.bind(this, codeInput);
    }

    /**
     * Debounce the `update` function
     */
    updateDebounced(codeInput, text) {
        // Editing - cancel prev. timeout
        if(this.debounceTimeout != null) {
            window.clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = window.setTimeout(() => {
            // Closure arrow function can take in variables like `text`
            this.update(text);
        }, this.delayMs);
    }

    // this.`update` function is original function

    debounceTimeout = null; // Timeout until update
    delayMs = 0; // Time until update
}