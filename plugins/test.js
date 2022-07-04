/**
 * Copy this to create a plugin, which brings extra,
 * non-central optional functionality to code-input.
 * Instances of plugins can be passed in in an array
 * to the `plugins` argument when registering a template,
 * for example like this:
 * ```javascript
 * codeInput.registerTemplate("syntax-highlighted", codeInput.templates.hljs(hljs, [new codeInput.plugins.Test()]));
 * ```
 */
codeInput.plugins.Test = class extends codeInput.Plugin {
    constructor() {
        super();
    }
    /* Runs before code is highlighted; Params: codeInput element) */
    beforeHighlight(codeInput) {
        console.log(codeInput, "before highlight");
    }
    /* Runs after code is highlighted; Params: codeInput element) */
    afterHighlight(codeInput) {
        console.log(codeInput, "after highlight");
    }
    /* Runs before elements are added into a `code-input`; Params: codeInput element) */
    beforeElementsAdded(codeInput) {
        console.log(codeInput, "before elements added");
    }
    /* Runs after elements are added into a `code-input` (useful for adding events to the textarea); Params: codeInput element) */
    afterElementsAdded(codeInput) {
        console.log(codeInput, "after elements added");
    }
    /* Runs when an attribute of a `code-input` is changed (you must add the attribute name to observedAttributes); Params: codeInput element, name attribute name, oldValue previous value of attribute, newValue changed value of attribute) */
    attributeChanged(codeInput, name, oldValue, newValue) {
        if(name == "testattr") {
            console.log(codeInput, "testattr:", oldValue, ">", newValue);
        }
    }
    observedAttributes = ["testattr"]
}