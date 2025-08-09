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
"use strict";

codeInput.plugins.Test = class extends codeInput.Plugin {
    instructions = {
        beforeHighlight: "before highlight",
        afterHighlight: "after highlight",
        beforeElementsAdded: "before elements added",
        afterElementsAdded: "after elements added",
        attributeChanged: (name, oldValue, newValue) => `${name}: '${oldValue}'>'${newValue}'`
    };

    constructor(instructionTranslations = {}) {
        super(["testattr"]); 
        // Array of observed attributes as parameter

        // instructionTranslations, instructions, and the addTranslations
        // call need not be present if this plugin uses no localisable
        // text.
        this.addTranslations(this.instructions, instructionTranslations);
    }
    /* Runs before code is highlighted; Params: codeInput element) */
    beforeHighlight(codeInput) {
        console.log(codeInput, this.instructions.beforeHighlight);
    }
    /* Runs after code is highlighted; Params: codeInput element) */
    afterHighlight(codeInput) {
        console.log(codeInput, this.instructions.afterHighlight);
    }
    /* Runs before elements are added into a `code-input`; Params: codeInput element) */
    beforeElementsAdded(codeInput) {
        console.log(codeInput, this.instructions.beforeElementsAdded);
    }
    /* Runs after elements are added into a `code-input` (useful for adding events to the textarea); Params: codeInput element) */
    afterElementsAdded(codeInput) {
        console.log(codeInput, this.instructions.afterElementsAdded);
    }
    /* Runs when an observed attribute of a `code-input` is changed (you must add the attribute name in the constructor); Params: codeInput element, name attribute name, oldValue previous value of attribute, newValue changed value of attribute) */
    attributeChanged(codeInput, name, oldValue, newValue) {
        console.log(codeInput, this.instructions.attriibuteChanged(name, oldValue, newValue));
    }
}
