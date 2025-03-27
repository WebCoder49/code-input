/**
 * Copy this to create a plugin, which brings extra,
 * non-central optional functionality to code-input.
 * Instances of plugins can be passed into the `addPlugin`
 * method of a template, for example like this:
 * ```javascript
 * let template = codeInput.templates.hljs(hljs);
 * template.addPlugin(new codeInput.plugins.Test());
 * codeInput.registerTemplate("syntax-highlighted", template));
 * ```
 */
codeInput.plugins.Test = class extends codeInput.Plugin {
    constructor() {
        super(["testattr"]); 
        // Array of observed attributes as parameter
    }
    /* Can multiple instances of this plugin class be added to the same codeInput element? */
    multipleInstancesCanBeAdded() {
        return true;
    }

    /* Can this plugin be added and removed from a codeInput element - i.e. does it implement onAdd and onRemove? */
    canBeAddedAndRemoved() {
        return true;
    }
    /* Runs when this template is added to a codeInput element; Params: codeInput element */
    onAdd(codeInput) {
        console.log(codeInput, "test plugin added");
    }
    /* Runs when this template is removed from a codeInput element; Params: codeInput element */
    onRemove(codeInput) {
        console.log(codeInput, "test plugin removed");
    }

    /* Runs before code is highlighted; Params: codeInput element */
    beforeHighlight(codeInput) {
        console.log(codeInput, "before highlight");
    }
    /* Runs after code is highlighted; Params: codeInput element */
    afterHighlight(codeInput) {
        console.log(codeInput, "after highlight");
    }
    /* Runs before elements are added into a `code-input`; Params: codeInput element */
    beforeElementsAdded(codeInput) {
        console.log(codeInput, "before elements added");
    }
    /* Runs after elements are added into a `code-input` (useful for adding events to the textarea); Params: codeInput element */
    afterElementsAdded(codeInput) {
        console.log(codeInput, "after elements added");
    }
    /* Runs when an observed attribute of a `code-input` is changed (you must add the attribute name in the constructor); Params: codeInput element, name attribute name, oldValue previous value of attribute, newValue changed value of attribute */
    attributeChanged(codeInput, name, oldValue, newValue) {
        console.log(codeInput, name, ":", oldValue, ">", newValue);
    }
}
