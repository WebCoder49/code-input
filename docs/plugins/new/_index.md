+++
title = 'Creating your own code-input Plugin to add functionality'
+++

# Creating your own code-input Plugin to add functionality

If you're writing some code that depends on the code-input editor and isn't very useful independent of it, or integrates other code with code-input, writing a plugin's often the way to go. You can even choose to contribute it back to the code-input library!

A very useful source of reference is the code-input.d.ts file in code-input.js' source code, which defines the public JavaScript interface of the code-input.js library including code-input elements.

Start with this code, which is also available as the `test` plugin. Afterwards, construct and pass a `new TestPlugin()` into the array when you register a code-input.js template, like any other code-input plugin:
```javascript
const TestPlugin = class extends codeInput.Plugin {
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
};
```
