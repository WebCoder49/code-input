/**
 * **code-input** is a library which lets you create custom HTML `<code-input>`
 * elements that act like `<textarea>` elements but support syntax-highlighted
 * code, implemented using any typical syntax highlighting library.
 *
 * License of whole library for bundlers:
 *
 * Copyright 2021-2025 Oliver Geer and contributors
 * @license MIT
 *
 * **<https://code-input-js.org>**
 */
"use strict";


var codeInput = {
    /**
     * A list of attributes that will trigger functionality in the
     * `codeInput.CodeInput.attributeChangedCallback`
     * when modified in a code-input element. This
     * does not include events, which are handled in
     * `codeInput.CodeInput.addEventListener` and
     * `codeInput.CodeInput.removeEventListener`.
     *
     * This does not include those listed in `codeInput.textareaSyncAttributes` that only synchronise with the textarea element.
     */
    observedAttributes: [
        "value",
        "placeholder",
        "language",
        "lang",
        "template"
    ],

    /**
     * A list of attributes that will be moved to 
     * the textarea after they are applied on the 
     * code-input element.
     */
    textareaSyncAttributes: [
        "value",
        // Form validation - https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation
        "min", "max",
        "type",
        "pattern",

        // Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
        "autocomplete", 
        "autocorrect", 
        "autofocus",
        "cols",
        "dirname",
        "disabled",
        "form",
        "maxlength",
        "minlength",
        "name",
        "placeholder",
        "readonly",
        "required",
        "rows",
        "spellcheck",
        "wrap"
    ],

    /**
     * A list of events whose listeners will be moved to 
     * the textarea after they are added to the 
     * code-input element.
     */
    textareaSyncEvents: [
        "change",
        "selectionchange",
        "invalid",
        "input",
        "focus",
        "blur",
        "focusin",
        "focusout"
    ],

    /* ------------------------------------
    *  ------------Templates---------------
    *  ------------------------------------ */

    /**
     * The templates currently available for any code-input elements
     * to use. Registered using `codeInput.registerTemplate`.
     * Key - Template Name
     * Value - A Template Object
     * @type {Object}
     */
    usedTemplates: {
    },
    /**
     * The name of the default template that a code-input element that
     * does not specify the template attribute uses. 
     * @type {string}
     */
    defaultTemplate: undefined,
    /**
     * A queue of elements waiting for a template to be registered,
     * allowing elements to be created in HTML with a template before
     * the template is registered in JS, for ease of use.
     * Key - Template Name
     * Value - An array of code-input elements
     * @type {Object}
     */
    templateNotYetRegisteredQueue: {},

    /**
     * Register a template so code-input elements with a template attribute that equals the templateName will use the template.
     * See `codeInput.templates` for constructors to create templates.
     * @param {string} templateName - the name to register the template under
     * @param {Object} template - a Template object instance - see `codeInput.templates`  
     */
    registerTemplate: function (templateName, template) {
        if(!(typeof templateName == "string" || templateName instanceof String)) throw TypeError(`code-input: Name of template "${templateName}" must be a string.`);
        if(!(typeof template.highlight == "function" || template.highlight instanceof Function)) throw TypeError(`code-input: Template for "${templateName}" invalid, because the highlight function provided is not a function; it is "${template.highlight}". Please make sure you use one of the constructors in codeInput.templates, and that you provide the correct arguments.`);
        if(!(typeof template.includeCodeInputInHighlightFunc == "boolean" || template.includeCodeInputInHighlightFunc instanceof Boolean)) throw TypeError(`code-input: Template for "${templateName}" invalid, because the includeCodeInputInHighlightFunc value provided is not a true or false; it is "${template.includeCodeInputInHighlightFunc}". Please make sure you use one of the constructors in codeInput.templates, and that you provide the correct arguments.`);
        if(!(typeof template.preElementStyled == "boolean" || template.preElementStyled instanceof Boolean)) throw TypeError(`code-input: Template for "${templateName}" invalid, because the preElementStyled value provided is not a true or false; it is "${template.preElementStyled}". Please make sure you use one of the constructors in codeInput.templates, and that you provide the correct arguments.`);
        if(!(typeof template.isCode == "boolean" || template.isCode instanceof Boolean)) throw TypeError(`code-input: Template for "${templateName}" invalid, because the isCode value provided is not a true or false; it is "${template.isCode}". Please make sure you use one of the constructors in codeInput.templates, and that you provide the correct arguments.`);
        if(!Array.isArray(template.plugins)) throw TypeError(`code-input: Template for "${templateName}" invalid, because the plugin array provided is not an array; it is "${template.plugins}". Please make sure you use one of the constructors in codeInput.templates, and that you provide the correct arguments.`);
        
        template.plugins.forEach((plugin, i) => {
            if(!(plugin instanceof codeInput.Plugin)) {
                throw TypeError(`code-input: Template for "${templateName}" invalid, because the plugin provided at index ${i} is not valid; it is "${template.plugins[i]}". Please make sure you use one of the constructors in codeInput.templates, and that you provide the correct arguments.`);
            }
        });

        
        codeInput.usedTemplates[templateName] = template;
        // Add waiting code-input elements wanting this template from queue
        if (templateName in codeInput.templateNotYetRegisteredQueue) {
            for (let i in codeInput.templateNotYetRegisteredQueue[templateName]) {
                const elem = codeInput.templateNotYetRegisteredQueue[templateName][i];
                elem.templateObject = template;
                elem.setup();
            }
        }

        if (codeInput.defaultTemplate == undefined) {
            codeInput.defaultTemplate = templateName;
            // Add elements with default template from queue
            if (undefined in codeInput.templateNotYetRegisteredQueue) {
                for (let i in codeInput.templateNotYetRegisteredQueue[undefined]) {
                    const elem = codeInput.templateNotYetRegisteredQueue[undefined][i];
                    elem.templateObject = template;
                    elem.setup();
                }
            }
        }
    },

    stylesheetI: 0, // Increments to give different classes to each code-input element so they can have custom styles synchronised internally without affecting the inline style

    /**
     * Please see `codeInput.templates.prism` or `codeInput.templates.hljs`.
     * Templates are used in `<code-input>` elements and once registered with
     * `codeInput.registerTemplate` will be in charge of the highlighting
     * algorithm and settings for all code-inputs with a `template` attribute
     * matching the registered name.
     */
    Template: class {
        /**
         * Constructor to create a custom template instance. Pass this into `codeInput.registerTemplate` to use it.
         * I would strongly recommend using the built-in simpler template `codeInput.templates.prism` or `codeInput.templates.hljs`.
         * @param {(codeElement: HTMLCodeElement, codeInput?: codeInput.CodeInput) => void} highlight - a callback to highlight the code, that takes an HTML `<code>` element inside a `<pre>` element as a parameter
         * @param {boolean} preElementStyled - is the `<pre>` element CSS-styled (if so set to true), or the `<code>` element (false)?
         * @param {boolean} isCode - is this for writing code? If true, the code-input's lang HTML attribute can be used, and the `<code>` element will be given the class name 'language-[lang attribute's value]'.
         * @param {boolean} includeCodeInputInHighlightFunc - Setting this to true passes the `<code-input>` element as a second argument to the highlight function.
         * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.Plugin`
         * @returns {codeInput.Template} template object
         */
        constructor(highlight = function (codeElement) { }, preElementStyled = true, isCode = true, includeCodeInputInHighlightFunc = false, plugins = []) {
            this.highlight = highlight;
            this.preElementStyled = preElementStyled;
            this.isCode = isCode;
            this.includeCodeInputInHighlightFunc = includeCodeInputInHighlightFunc;
            this.plugins = plugins;
        }

        /**
         * A callback to highlight the code, that takes an HTML `<code>` element 
         * inside a `<pre>` element as a parameter, and an optional second
         * `<code-input>` element parameter if `this.includeCodeInputInHighlightFunc` is
         * `true`.
         */
        highlight = function(codeElement) {};

        /**
         * Is the <pre> element CSS-styled as well as the `<code>` element? 
         * If `true`, `<pre>` element's scrolling is synchronised; if false, 
         * <code> element's scrolling is synchronised.
         */
        preElementStyled = true;

        /**
         * Is this for writing code? 
         * If true, the code-input's lang HTML attribute can be used, 
         * and the `<code>` element will be given the class name 
         * 'language-[lang attribute's value]'.
         */
        isCode = true;

        /**
         * Setting this to true passes the `<code-input>` element as a 
         * second argument to the highlight function.
         */
        includeCodeInputInHighlightFunc = false;

        /**
         * An array of plugin objects to add extra features - 
         * see `codeInput.Plugin`.
         */
        plugins = [];
    },

    // ESM-SUPPORT-START-TEMPLATES-BLOCK-1 Do not (re)move this - it's needed for ESM generation!
    /**
     * For creating a custom template from scratch, please 
     * use `new codeInput.Template(...)`
     * 
     * Shortcut functions for creating templates.
     * Each code-input element has a template attribute that 
     * tells it which template to use.
     * Each template contains functions and preferences that 
     * run the syntax-highlighting and let code-input control 
     * the highlighting.
     * For adding small pieces of functionality, please see `codeInput.plugins`.
     */
    templates: {
        // (Source code for class templates after var codeInput = ... so they can extend the codeInput.Template class)
        /**
         * @deprecated Please use `new codeInput.templates.Prism(...)`
         */
        prism(prism, plugins = []) { // Dependency: Prism.js (https://prismjs.com/)
            return new codeInput.templates.Prism(prism, plugins);
        },

        /**
         * @deprecated Please use `new codeInput.templates.Hljs(...)`
         */
        hljs(hljs, plugins = []) { // Dependency: Highlight.js (https://highlightjs.org/)
            return new codeInput.templates.Hljs(hljs, plugins);
        },

        /**
         * @deprecated Make your own version of this template if you need it - we think it isn't widely used so will remove it from the next version of code-input.
         */
        characterLimit(plugins) {
            return {
                highlight: function (resultElement, codeInput, plugins = []) {

                    let characterLimit = Number(codeInput.getAttribute("data-character-limit"));

                    let normalCharacters = codeInput.escapeHtml(codeInput.value.slice(0, characterLimit));
                    let overflowCharacters = codeInput.escapeHtml(codeInput.value.slice(characterLimit));

                    resultElement.innerHTML = `${normalCharacters}<mark class="overflow">${overflowCharacters}</mark>`;
                    if (overflowCharacters.length > 0) {
                        resultElement.innerHTML += ` <mark class="overflow-msg">${codeInput.getAttribute("data-overflow-msg") || "(Character limit reached)"}</mark>`;
                    }
                },
                includeCodeInputInHighlightFunc: true,
                preElementStyled: true,
                isCode: false,
                plugins: plugins,
            }
        },

        /**
         * @deprecated Make your own version of this template if you need it - we think it isn't widely used so will remove it from the next version of code-input.
         */
        rainbowText(rainbowColors = ["red", "orangered", "orange", "goldenrod", "gold", "green", "darkgreen", "navy", "blue", "magenta"], delimiter = "", plugins = []) {
            return {
                highlight: function (resultElement, codeInput) {
                    let htmlResult = [];
                    let sections = codeInput.value.split(codeInput.template.delimiter);
                    for (let i = 0; i < sections.length; i++) {
                        htmlResult.push(`<span style="color: ${codeInput.template.rainbowColors[i % codeInput.template.rainbowColors.length]}">${codeInput.escapeHtml(sections[i])}</span>`);
                    }
                    resultElement.innerHTML = htmlResult.join(codeInput.template.delimiter);
                },
                includeCodeInputInHighlightFunc: true,
                preElementStyled: true,
                isCode: false,

                rainbowColors: rainbowColors,
                delimiter: delimiter,

                plugins: plugins,
            }
        },

        /**
         * @deprecated Make your own version of this template if you need it - we think it isn't widely used so will remove it from the next version of code-input.
         */
        character_limit() {
            return this.characterLimit([]);
        },
        /**
         * @deprecated Make your own version of this template if you need it - we think it isn't widely used so will remove it from the next version of code-input.
         */
        rainbow_text(rainbowColors = ["red", "orangered", "orange", "goldenrod", "gold", "green", "darkgreen", "navy", "blue", "magenta"], delimiter = "", plugins = []) {
            return this.rainbowText(rainbowColors, delimiter, plugins);
        },
        
        /**
         * @deprecated Please use `new codeInput.Template(...)`
         */
        custom(highlight = function () { }, preElementStyled = true, isCode = true, includeCodeInputInHighlightFunc = false, plugins = []) {
            return {
                highlight: highlight,
                includeCodeInputInHighlightFunc: includeCodeInputInHighlightFunc,
                preElementStyled: preElementStyled,
                isCode: isCode,
                plugins: plugins,
            };
        },
    },
    // ESM-SUPPORT-END-TEMPLATES-BLOCK-1 Do not (re)move this - it's needed for ESM generation!

    /* ------------------------------------
    *  ------------Plugins-----------------
    *  ------------------------------------ */

    /**
     * Before using any plugin in this namespace, please ensure you import its JavaScript
     * files (in the plugins folder), or continue to get a more detailed error in the developer
     * console.
     * 
     * Where plugins are stored, after they are imported. The plugin
     * file assigns them a space in this object.
     * For adding completely new syntax-highlighting algorithms, please see `codeInput.templates`.
     * 
     * Key - plugin name
     * 
     * Value - plugin object
     * @type {Object}
     */
    plugins: new Proxy({}, {
        get(plugins, name) {
            if(plugins[name] == undefined) {
                throw ReferenceError(`code-input: Plugin '${name}' is not defined. Please ensure you import the necessary files from the plugins folder in the WebCoder49/code-input repository, in the <head> of your HTML, before the plugin is instatiated.`);
            }
            return plugins[name];
        }
    }),

    /**
     * Plugins are imported from the plugins folder. They will then
     * provide custom extra functionality to code-input elements.
     */
    Plugin: class {
        /**
         * Create a Plugin
         * 
         * @param {Array<string>} observedAttributes - The HTML attributes to watch for this plugin, and report any 
         * modifications to the `codeInput.Plugin.attributeChanged` method.
         */
        constructor(observedAttributes) {

            observedAttributes.forEach((attribute) => {
                codeInput.observedAttributes.push(attribute);
            });
        }

        /**
         * Replace the values in destination with those from source where the keys match, in-place.
         * @param {Object} destination Where to place the translated strings, already filled with the keys pointing to English strings.
         * @param {Object} source The same keys, or some of them, mapped to translated strings. Keys not present here will retain the values they are maapped to in destination.
         */
        addTranslations(destination, source) {
            for(const key in source) {
                destination[key] = source[key];
            }
        }

        /**
         * Runs before code is highlighted.
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         */
        beforeHighlight(codeInput) { }
        /**
         * Runs after code is highlighted.
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         */
        afterHighlight(codeInput) { }
        /**
         * Runs before elements are added into a code-input element.
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         */
        beforeElementsAdded(codeInput) { }
        /**
         * Runs after elements are added into a code-input element (useful for adding events to the textarea).
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         */
        afterElementsAdded(codeInput) { }
        /**
         * Runs when an attribute of a code-input element is changed (you must add the attribute name to `codeInput.Plugin.observedAttributes` first).
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         * @param {string} name - The name of the attribute
         * @param {string} oldValue - The value of the attribute before it was changed
         * @param {string} newValue - The value of the attribute after it is changed
         */
        attributeChanged(codeInput, name, oldValue, newValue) { }
    },

    /* ------------------------------------
    *  -------------Main-------------------
    *  ------------------------------------ */

    /**
     * A `<code-input>` element, an instance of an `HTMLElement`, and the result
     * of `document.createElement("code-input")`. Attributes are only set when
     * the element's template has been registered, and before this are null.
     */
    CodeInput: class extends HTMLElement {
        constructor() {
            super(); // Element
        }

        /**
         * When the code-input's template is registered, this contains its codeInput.Template object.
         * Should be treated as read-only by external code.
         */
        templateObject = null;
        /**
        * Exposed child textarea element for user to input code in
        */
        textareaElement = null;
        /**
        * Exposed child pre element where syntax-highlighted code is outputted.
        * Contains this.codeElement as its only child.
        */
        preElement = null
        /**
        * Exposed child pre element's child code element where syntax-highlighted code is outputted.
        * Has this.preElement as its parent.
        */
        codeElement = null;

        /** 
         * Exposed non-scrolling element designed to contain dialog boxes etc. from plugins,
         * that shouldn't scroll with the code-input element.
         */
        dialogContainerElement = null;

        /**
         * Like style attribute, but with a specificity of 1
         * element, 1 class. Present so styles can be set on only
         * this element while giving other code freedom of use of
         * the style attribute.
         *
         * For internal use only.
         */
        internalStyle = null;

        /**
        * Form-Associated Custom Element Callbacks
        * https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-face-example
        */
        static formAssociated = true;

        /**
         * When events are transferred to the textarea element, callbacks
         * are bound to set the this variable to the code-input element
         * rather than the textarea. This allows the callback to be converted
         * to a bound one:
         * Key - Callback not bound
         * Value - Callback that is bound, with this equalling the code-input element in the callback 
         */
        boundEventCallbacks = {};

        /** Trigger this event in all plugins with a optional list of arguments 
         * @param {string} eventName - the name of the event to trigger
         * @param {Array} args - the arguments to pass into the event callback in the template after the code-input element. Normally left empty
        */
        pluginEvt(eventName, args) {
            for (let i in this.templateObject.plugins) {
                let plugin = this.templateObject.plugins[i];
                if (eventName in plugin) {
                    if (args === undefined) {
                        plugin[eventName](this);
                    } else {
                        plugin[eventName](this, ...args);
                    }
                }
            }
        }

        /* ------------------------------------
        *  ----------Main Functionality--------
        *  ------------------------------------ 
        * The main function of a code-input element is to take 
        * code written in its textarea element, copy this code into
        * the result (pre code) element, then use the template object
        * to syntax-highlight it. */

        needsHighlight = false; // Just inputted
        originalAriaDescription;

        /**
         * Highlight the code as soon as possible
         */
        scheduleHighlight() {
            this.needsHighlight = true;
        }

        /**
         * Call an animation frame
         */
        animateFrame() {
            // Synchronise the contents of the pre/code and textarea elements
            if(this.needsHighlight) {
                this.update();
                this.needsHighlight = false;
            }

            window.requestAnimationFrame(this.animateFrame.bind(this));
        }

        /**
         * Update the text value to the result element, after the textarea contents have changed.
         */
        update() {
            let resultElement = this.codeElement;
            let value = this.value;
            value += "\n"; // Placeholder for next line

            // Update code
            resultElement.innerHTML = this.escapeHtml(value);
            this.pluginEvt("beforeHighlight");

            // Syntax Highlight
            if (this.templateObject.includeCodeInputInHighlightFunc) this.templateObject.highlight(resultElement, this);
            else this.templateObject.highlight(resultElement);

            this.syncSize();

            this.pluginEvt("afterHighlight");
        }

        getStyledHighlightingElement() {
            if(this.templateObject.preElementStyled) {
                return this.preElement;
            } else {
                return this.codeElement;
            }
        }

        /**
         * Set the size of the textarea element to the size of the pre/code element.
         */
        syncSize() {
            // Synchronise the size of the pre/code and textarea elements
            this.textareaElement.style.height = getComputedStyle(this.getStyledHighlightingElement()).height;
            this.textareaElement.style.width = getComputedStyle(this.getStyledHighlightingElement()).width;
        }

        /**
         * If the color attribute has been defined on the
         * code-input element by external code, return true.
         * Otherwise, make the aspects the color affects
         * (placeholder and caret colour) be the base colour
         * of the highlighted text, for best contrast, and
         * return false.
         */
        isColorOverridenSyncIfNot() {
            const oldTransition = this.style.transition;
            this.style.transition = "unset";
            window.requestAnimationFrame(() => {
                this.internalStyle.setProperty("--code-input_no-override-color", "rgb(0, 0, 0)");
                if(getComputedStyle(this).color == "rgb(0, 0, 0)") {
                    // May not be overriden
                    this.internalStyle.setProperty("--code-input_no-override-color", "rgb(255, 255, 255)");
                    if(getComputedStyle(this).color == "rgb(255, 255, 255)") {
                        // Definitely not overriden
                        this.internalStyle.removeProperty("--code-input_no-override-color");
                        this.style.transition = oldTransition;

                        const highlightedTextColor = getComputedStyle(this.getStyledHighlightingElement()).color;

                        this.internalStyle.setProperty("--code-input_highlight-text-color", highlightedTextColor);
                        this.internalStyle.setProperty("--code-input_default-caret-color", highlightedTextColor);
                        return false;
                    }
                }
                this.internalStyle.removeProperty("--code-input_no-override-color");
                this.style.transition = oldTransition;
            });

            return true;
        }

        /**
         * Update the aspects the color affects
         * (placeholder and caret colour) to the correct
         * colour: either that defined on the code-input
         * element, or if none is defined externally the
         * base colour of the highlighted text.
         */
        syncColorCompletely() {
            // color of code-input element
            if(this.isColorOverridenSyncIfNot()) {
                // color overriden
                this.internalStyle.removeProperty("--code-input_highlight-text-color");
                this.internalStyle.setProperty("--code-input_default-caret-color", getComputedStyle(this).color);
            }
        }


        /**
         * Show some instructions to the user only if they are using keyboard navigation - for example, a prompt on how to navigate with the keyboard if Tab is repurposed.
         * @param {string} instructions The instructions to display only if keyboard navigation is being used. If it's blank, no instructions will be shown.
         * @param {boolean} includeAriaDescriptionFirst Whether to include the aria-description of the code-input element before the keyboard navigation instructions for a screenreader. Keep this as true when the textarea is first focused.
         */
        setKeyboardNavInstructions(instructions, includeAriaDescriptionFirst) {
            this.dialogContainerElement.querySelector(".code-input_keyboard-navigation-instructions").innerText = instructions;
            if(includeAriaDescriptionFirst) {
                this.textareaElement.setAttribute("aria-description", this.originalAriaDescription + ". " + instructions);
            } else {
                this.textareaElement.setAttribute("aria-description", instructions);
            }
        }

        /**
         * HTML-escape an arbitrary string.
         * @param {string} text - The original, unescaped text
         * @returns {string} - The new, HTML-escaped text
         */
        escapeHtml(text) {
            return text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;"); /* Global RegExp */
        }

        /**
         * HTML-unescape an arbitrary string.
         * @param {string} text - The original, HTML-escaped text
         * @returns {string} - The new, unescaped text
         */
        unescapeHtml(text) {
            return text.replace(new RegExp("&amp;", "g"), "&").replace(new RegExp("&lt;", "g"), "<").replace(new RegExp("&gt;", "g"), ">"); /* Global RegExp */
        }

        /**
         * Get the template object this code-input element is using.
         * @returns {Object} - Template object
         */
        getTemplate() {
            let templateName;
            if (this.getAttribute("template") == undefined) {
                // Default
                templateName = codeInput.defaultTemplate;
            } else {
                templateName = this.getAttribute("template");
            }
            if (templateName in codeInput.usedTemplates) {
                return codeInput.usedTemplates[templateName];
            } else {
                // Doesn't exist - add to queue
                if (!(templateName in codeInput.templateNotYetRegisteredQueue)) {
                    codeInput.templateNotYetRegisteredQueue[templateName] = [];
                }
                codeInput.templateNotYetRegisteredQueue[templateName].push(this);
                return undefined;
            }
        }

        /**
         * Set up and initialise the textarea.
         * This will be called once the template has been added.
         */
        setup() {
            if(this.textareaElement != null) return; // Already set up

            this.classList.add("code-input_registered");

            this.mutationObserver = new MutationObserver(this.mutationObserverCallback.bind(this));
            this.mutationObserver.observe(this, {
                attributes: true,
                attributeOldValue: true
            });

            this.classList.add("code-input_registered"); // Remove register message
            if (this.templateObject.preElementStyled) this.classList.add("code-input_pre-element-styled");

            const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
            let fallbackFocused = false;
            let fallbackSelectionStart = undefined;
            let fallbackSelectionEnd = undefined;
            let fallbackSelectionDirection = undefined;
            let fallbackScrollLeft = undefined;
            let fallbackScrollTop = undefined;
            if(fallbackTextarea) {
                // Move some attributes to new textarea so typing during
                // slow load not interrupted
                if(fallbackTextarea === document.activeElement) { // Thanks to https://stackoverflow.com/a/36430896
                    fallbackFocused = true;
                }
                fallbackSelectionStart = fallbackTextarea.selectionStart;
                fallbackSelectionEnd = fallbackTextarea.selectionEnd;
                fallbackSelectionDirection = fallbackTextarea.selectionDirection;
                fallbackScrollLeft = fallbackTextarea.scrollLeft;
                fallbackScrollTop = fallbackTextarea.scrollTop;
            }

            let value;
            if(fallbackTextarea) {
                // Fallback textarea exists
                // Sync attributes; existing code-input attributes take priority
                let textareaAttributeNames = fallbackTextarea.getAttributeNames();
                for(let i = 0; i < textareaAttributeNames.length; i++) {
                    const attr = textareaAttributeNames[i];
                    if(attr == "data-code-input-fallback") continue;

                    if(!this.hasAttribute(attr)) {
                        this.setAttribute(attr, fallbackTextarea.getAttribute(attr));
                    }
                }
                // Sync value
                value = fallbackTextarea.value;
                // Backwards compatibility with plugins
                this.innerHTML = this.escapeHtml(value);
            } else {
                value = this.unescapeHtml(this.innerHTML);
            }
            value = value || this.getAttribute("value") || "";

            this.pluginEvt("beforeElementsAdded");

            // First-time attribute sync
            const lang = this.getAttribute("language") || this.getAttribute("lang");
            const placeholder = this.getAttribute("placeholder") || lang || "";


            this.initialValue = value; // For form reset

            // Create textarea
            const textarea = document.createElement("textarea");
            textarea.placeholder = placeholder;
            if(value != "") {
                textarea.value = value;
            }
            textarea.innerHTML = this.innerHTML;
            if(!this.hasAttribute("spellcheck")) {
                // For backwards compatibility:
                textarea.setAttribute("spellcheck", "false");
            }
            
            // Disable focusing on the code-input element - only allow the textarea to be focusable
            textarea.setAttribute("tabindex", this.getAttribute("tabindex") || 0);
            this.setAttribute("tabindex", -1);
            // Save aria-description so keyboard navigation guidance can be added.
            this.originalAriaDescription = this.getAttribute("aria-description") || "Code input field";

            // Accessibility - detect when mouse focus to remove focus outline + keyboard navigation guidance that could irritate users.
            this.addEventListener("mousedown", () => {
                this.classList.add("code-input_mouse-focused");
                // Wait for CSS to update padding
                window.setTimeout(() => {
                    this.syncSize();
                }, 0);
            });
            textarea.addEventListener("blur", () => {
                this.classList.remove("code-input_mouse-focused");
                // Wait for CSS to update padding
                window.setTimeout(() => {
                    this.syncSize();
                }, 0);
            });
            textarea.addEventListener("focus", () => {
                // Wait for CSS to update padding
                window.setTimeout(() => {
                    this.syncSize();
                }, 0);
            });

            this.innerHTML = ""; // Clear Content

            // Synchronise attributes to textarea
            for(let i = 0; i < this.attributes.length; i++) {
                let attribute = this.attributes[i].name;
                if (codeInput.textareaSyncAttributes.includes(attribute) 
                    || attribute.substring(0, 5) == "aria-") {
                    textarea.setAttribute(attribute, this.getAttribute(attribute));
                }
            }

            textarea.addEventListener('input', (evt) => { this.value = this.textareaElement.value; });

            // Save element internally
            this.textareaElement = textarea;
            this.append(textarea);
            this.setupTextareaSyncEvents(this.textareaElement);

            // Create result element
            let code = document.createElement("code");
            let pre = document.createElement("pre");
            pre.setAttribute("aria-hidden", "true"); // Hide for screen readers
            pre.setAttribute("tabindex", "-1"); // Hide for keyboard navigation
            pre.setAttribute("inert", true); // Hide for keyboard navigation

            // Save elements internally
            this.preElement = pre;
            this.codeElement = code;
            pre.append(code);
            this.append(pre);
            if (this.templateObject.isCode) {
                if (lang != undefined && lang != "") {
                    code.classList.add("language-" + lang.toLowerCase());
                }
            }

            // dialogContainerElement used to store non-scrolling dialog boxes, etc.
            let dialogContainerElement = document.createElement("div");
            dialogContainerElement.classList.add("code-input_dialog-container");
            this.append(dialogContainerElement);
            this.dialogContainerElement = dialogContainerElement;

            let keyboardNavigationInstructions = document.createElement("div");
            keyboardNavigationInstructions.classList.add("code-input_keyboard-navigation-instructions");
            dialogContainerElement.append(keyboardNavigationInstructions);

            this.pluginEvt("afterElementsAdded");

            this.dispatchEvent(new CustomEvent("code-input_load"));

            this.value = value;

            // Update with fallback textarea's state so can keep editing
            // if loaded slowly
            if(fallbackSelectionStart !== undefined) {
                textarea.setSelectionRange(fallbackSelectionStart, fallbackSelectionEnd, fallbackSelectionDirection);
                textarea.scrollTo(fallbackScrollTop, fallbackScrollLeft);
            }
            if(fallbackFocused) {
                textarea.focus();
            }

            this.animateFrame();

            const resizeObserver = new ResizeObserver((elements) => {
                // The only element that could be resized is this code-input element.
                this.syncSize();
            });
            resizeObserver.observe(this);


            // Add internal style as non-externally-overridable alternative to style attribute for e.g. syncing color
            this.classList.add("code-input_styles_" + codeInput.stylesheetI);
            const stylesheet = document.createElement("style");
            stylesheet.innerHTML = "code-input.code-input_styles_" + codeInput.stylesheetI + " {}";
            this.appendChild(stylesheet);
            this.internalStyle = stylesheet.sheet.cssRules[0].style;
            codeInput.stylesheetI++;

            // Synchronise colors
            const preColorChangeCallback = (evt) => {
                if(evt.propertyName == "color") {
                    this.isColorOverridenSyncIfNot();
                }
            };
            this.preElement.addEventListener("transitionend", preColorChangeCallback);
            this.preElement.addEventListener("-webkit-transitionend", preColorChangeCallback);
            const thisColorChangeCallback = (evt) => {
                if(evt.propertyName == "color") {
                    this.syncColorCompletely();
                }
                if(evt.target == this.dialogContainerElement) {
                    evt.stopPropagation();
                    // Prevent bubbling because code-input
                    // transitionend is separate
                }
            };
            // Not on this element so CSS transition property does not override publicly-visible one
            this.dialogContainerElement.addEventListener("transitionend", thisColorChangeCallback);
            this.dialogContainerElement.addEventListener("-webkit-transitionend", thisColorChangeCallback);

            // For when this code-input element has an externally-defined, different-duration transition
            this.addEventListener("transitionend", thisColorChangeCallback);
            this.addEventListener("-webkit-transitionend", thisColorChangeCallback);

            this.syncColorCompletely();

            this.classList.add("code-input_loaded");
        }

        /**
         * @deprecated This shouldn't have been accessed as part of the library's public interface (to enable more flexibility in backwards-compatible versions), but is still here just in case it was.
         */
        escape_html(text) {
            return this.escapeHtml(text);
        }

        /**
         * @deprecated This shouldn't have been accessed as part of the library's public interface (to enable more flexibility in backwards-compatible versions), but is still here just in case it was.
         */
        get_template() {
            return this.getTemplate();
        }

        /**
         * @deprecated Present for backwards compatibility; use CodeInput.templateObject.
         */
        get template() {
            return this.templateObject;
        }

        /**
         * @deprecated The Vue framework may try to set the template
         * property to the value of the template attribute, a string.
         * This should not happen. Intentional use of this should
         * also not happen since templates are changed by changing
         * the template attribute to the name of one registered.
         */
        set template(value) { }

        /* ------------------------------------
        *  -----------Callbacks----------------
        *  ------------------------------------
        * Implement the `HTMLElement` callbacks
        * to trigger the main functionality properly. */

        /**
         * When the code-input element has been added to the document,
         * find its template and set up the element.
         */
        connectedCallback() {
            // Stored in templateObject because some frameworks will override
            // template property with the string value of the attribute
            this.templateObject = this.getTemplate();
            if (this.templateObject != undefined) {
                // Template registered before loading
                this.classList.add("code-input_registered");
                if (document.readyState === 'loading') {
                    // Children not yet present - wait until they are
                    window.addEventListener("DOMContentLoaded", this.setup.bind(this))
                } else {
                    this.setup();
                }
            }

            // Graceful degradation: make events still work without template being
            // registered
            if (document.readyState === 'loading') {
                // Children not yet present - wait until they are
                window.addEventListener("DOMContentLoaded", () => {
                    const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
                    if(fallbackTextarea) {
                        this.setupTextareaSyncEvents(fallbackTextarea);
                    }
                })
            } else {
                const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
                if(fallbackTextarea) {
                    this.setupTextareaSyncEvents(fallbackTextarea);
                }
            }
        }

        mutationObserverCallback(mutationList, observer) {
            for (const mutation of mutationList) {
                if (mutation.type !== 'attributes')
                    continue;

                /* Check regular attributes */
                for(let i = 0; i < codeInput.observedAttributes.length; i++) {
                    if (mutation.attributeName == codeInput.observedAttributes[i]) {
                        return this.attributeChangedCallback(mutation.attributeName, mutation.oldValue, super.getAttribute(mutation.attributeName));
                    }
                }
                for(let i = 0; i < codeInput.textareaSyncAttributes.length; i++) {
                    if (mutation.attributeName == codeInput.textareaSyncAttributes[i]) {
                        return this.attributeChangedCallback(mutation.attributeName, mutation.oldValue, super.getAttribute(mutation.attributeName));
                    }
		}
                if (mutation.attributeName.substring(0, 5) == "aria-") {
                    return this.attributeChangedCallback(mutation.attributeName, mutation.oldValue, super.getAttribute(mutation.attributeName));
                }
            }
        }

        disconnectedCallback() {
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
            }
        }

        /**
         * Triggered when an observed HTML attribute
         * has been modified (called from `mutationObserverCallback`).
         * @param {string} name - The name of the attribute
         * @param {string} oldValue - The value of the attribute before it was changed
         * @param {string} newValue - The value of the attribute after it is changed
         */
        attributeChangedCallback(name, oldValue, newValue) {
            if (this.isConnected) {
                this.pluginEvt("attributeChanged", [name, oldValue, newValue]);
                switch (name) {

                    case "value":
                        this.value = newValue;
                        break;
                    case "template":
                        this.templateObject = codeInput.usedTemplates[newValue || codeInput.defaultTemplate];
                        if (this.templateObject.preElementStyled) this.classList.add("code-input_pre-element-styled");
                        else this.classList.remove("code-input_pre-element-styled");
                        // Syntax Highlight
                        this.scheduleHighlight();

                        break;

                    case "lang":
                    case "language":
                        let code = this.codeElement;
                        let mainTextarea = this.textareaElement;

                        // Check not already updated
                        if (newValue != null) {
                            newValue = newValue.toLowerCase();

                            if (code.classList.contains(`language-${newValue}`)) break; // Already updated
                        }

                        if(oldValue !== null) {
                            // Case insensitive
                            oldValue = oldValue.toLowerCase();

                            // Remove old language class and add new
                            code.classList.remove("language-" + oldValue); // From codeElement
                            code.parentElement.classList.remove("language-" + oldValue); // From preElement
                        }
                        // Add new language class
                        code.classList.remove("language-none"); // Prism
                        code.parentElement.classList.remove("language-none"); // Prism

                        if (newValue != undefined && newValue != "") {
                            code.classList.add("language-" + newValue);
                        }

                        if (mainTextarea.placeholder == oldValue || oldValue == null && mainTextarea.placeholder == "") {
                            mainTextarea.placeholder = newValue;
                        }

                        this.scheduleHighlight();

                        break;
                    default:
                        if (codeInput.textareaSyncAttributes.includes(name) || name.substring(0, 5) == "aria-") {
                            if(newValue == null || newValue == undefined) {
                                this.textareaElement.removeAttribute(name);
                            } else {
                                this.textareaElement.setAttribute(name, newValue);
                            }
                        } else {
                            codeInput.textareaSyncAttributes.regexp.forEach((attribute) => {
                                if (name.match(attribute)) {
                                    if(newValue == null) {
                                        this.textareaElement.removeAttribute(name);
                                    } else {
                                        this.textareaElement.setAttribute(name, newValue);
                                    }
                                }
                            });
                        }
                        break;
                }
            }

        }

        //-------------------------------------------
        //----------- Textarea interface ------------
        //-------------------------------------------
        // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement
        // Attributes defined at codeInput.textareaSyncAttributes
        // Event listener added to pass to code-input element

        /**
         * Capture all events from textareaSyncEvents triggered on the given textarea
         * element and pass them to the code-input element.
         */
        setupTextareaSyncEvents(textarea) {
            for(let i = 0; i < codeInput.textareaSyncEvents.length; i++) {
                const evtName = codeInput.textareaSyncEvents[i];
                textarea.addEventListener(evtName, (evt) => {
                    if(!evt.bubbles) { // Don't duplicate the callback
                        this.dispatchEvent(new evt.constructor(evt.type, evt)); // Thanks to
                    }
                });
            }
        }

        // addEventListener and removeEventListener overrides are still used
        // for backwards compatibility - unlike the solution above, they keep
        // the event's isTrusted as true.
        /**
         * @override
         */
        addEventListener(type, listener, options = undefined) {
            // Save a copy of the callback where `this` refers to the code-input element.
            let boundCallback = function (evt) {
                if (typeof listener === 'function') {
                    listener(evt);
                } else if (listener && listener.handleEvent) {
                    listener.handleEvent(evt);
                }
            }.bind(this);
            this.boundEventCallbacks[listener] = boundCallback;

            if (codeInput.textareaSyncEvents.includes(type)) {
                // Synchronise with textarea
                this.boundEventCallbacks[listener] = boundCallback;

                if (options === undefined) {
                    if(this.textareaElement == null) {
                        // Unregistered
                        const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
                        if(fallbackTextarea) {
                            fallbackTextarea.addEventListener(type, boundCallback);
                        }
                        this.addEventListener("code-input_load", () => { this.textareaElement.addEventListener(type, boundCallback); });
                    } else {
                        this.textareaElement.addEventListener(type, boundCallback);
                    }
                } else {
                    if(this.textareaElement == null) {
                        // Unregistered
                        const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
                        if(fallbackTextarea) {
                            fallbackTextarea.addEventListener(type, boundCallback, options);
                        }
                        this.addEventListener("code-input_load", () => { this.textareaElement.addEventListener(type, boundCallback, options); });
                    } else {
                        this.textareaElement.addEventListener(type, boundCallback, options);
                    }
                }
            } else {
                // Synchronise with code-input element
                if (options === undefined) {
                    super.addEventListener(type, boundCallback);
                } else {
                    super.addEventListener(type, boundCallback, options);
                }
            }
        }

        /**
         * @override
         */
        removeEventListener(type, listener, options = undefined) {
            // Save a copy of the callback where `this` refers to the code-input element
            let boundCallback = this.boundEventCallbacks[listener];

            if (codeInput.textareaSyncEvents.includes(type)) {
                // Synchronise with textarea
                if (options === undefined) {
                    if(this.textareaElement == null) {
                        // Unregistered
                        const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
                        if(fallbackTextarea) {
                            fallbackTextarea.removeEventListener(type, boundCallback);
                        }
                        this.addEventListener("code-input_load", () => { this.textareaElement.removeEventListener(type, boundCallback); });
                    } else {
                        this.textareaElement.removeEventListener(type, boundCallback);
                    }
                } else {
                    if(this.textareaElement == null) {
                        // Unregistered
                        const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
                        if(fallbackTextarea) {
                            fallbackTextarea.removeEventListener(type, boundCallback, options);
                        }
                        this.addEventListener("code-input_load", () => { this.textareaElement.removeEventListener(type, boundCallback, options); });
                    } else {
                        this.textareaElement.removeEventListener(type, boundCallback, options);
                    }
                }
            } else {
                // Synchronise with code-input element
                if (options === undefined) {
                    super.removeEventListener(type, boundCallback);
                } else {
                    super.removeEventListener(type, boundCallback, options);
                }
            }
        }

        /**
         * Get the JavaScript property from the internal textarea
         * element, given its name and a defaultValue to return
         * when no textarea is present (undefined to make it throw
         * an error instead).
         *
         * For internal use - treat the code-input element as a
         * textarea for the standard properties (e.g. document.
         * querySelector("code-input").defaultValue).
         */
        getTextareaProperty(name, defaultValue=undefined) {
            if(this.textareaElement) {
                return this.textareaElement[name];
            } else {
                // Unregistered
                const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
                if(fallbackTextarea) {
                    return fallbackTextarea[name];
                } else {
                    if(defaultValue === undefined) {
                        throw new Error("Cannot get "+name+" of an unregistered code-input element without a data-code-input-fallback textarea.");
                    }
                    return defaultValue;
                }
            }
        }
        /**
         * Set the JavaScript property of the internal textarea
         * element, given its name and value.
         *
         * If there is no registered or fallback textarea and errorIfCannot is
         * false, return false (otherwise true); If there is no registered or
         * fallback textarea and errorIfCannot is true, throw an error.
         *
         * For internal use - treat the code-input element as a
         * textarea for the standard properties (e.g. document.
         * querySelector("code-input").defaultValue).
         */
        setTextareaProperty(name, value, errorIfCannot=true) {
            if(this.textareaElement) {
                this.textareaElement[name] = value;
            } else {
                // Unregistered
                const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
                if(fallbackTextarea) {
                    fallbackTextarea[name] = value;
                } else {
                    if(!errorIfCannot) return false;
                    throw new Error("Cannot set "+name+" of an unregistered code-input element without a data-code-input-fallback textarea.");
                }
            }
            return true;
        }

        get autocomplete() { return this.getAttribute("autocomplete"); }
        set autocomplete(val) { return this.setAttribute("autocomplete", val); }
        get cols() { return this.getTextareaProperty("cols", Number(this.getAttribute("cols"))); }
        set cols(val) { this.setAttribute("cols", val); }
        get defaultValue() { return this.initialValue; }
        set defaultValue(val) { this.initialValue = val; }
        get textContent() { return this.initialValue; }
        set textContent(val) { this.initialValue = val; }
        get dirName() { return this.getAttribute("dirName") || ""; }
        set dirName(val) { this.setAttribute("dirname", val); }
        get disabled() { return this.hasAttribute("disabled"); }
        set disabled(val) {
            if(val) {
                this.setAttribute("disabled", true);
            } else {
                this.removeAttribute("disabled");
            }
        }
        get form() { return this.getTextareaProperty("form"); }
        get labels() { return this.getTextareaProperty("labels"); }
        get maxLength() {
            const result = Number(this.getAttribute("maxlength"));
            if(isNaN(result)) {
                return -1;
            }
            return result;
        }
        set maxLength(val) {
            if(val == -1) {
                this.removeAttribute("maxlength");
            } else {
                this.setAttribute("maxlength", val);
            }
        }
        get minLength() {
            const result = Number(this.getAttribute("minlength"));
            if(isNaN(result)) {
                return -1;
            }
            return result;
        }
        set minLength(val) {
            if(val == -1) {
                this.removeAttribute("minlength");
            } else {
                this.setAttribute("minlength", val);
            }
        }
        get name() { return this.getAttribute("name") || ""; }
        set name(val) { this.setAttribute("name", val); }
        get placeholder() { return this.getAttribute("placeholder") || ""; }
        set placeholder(val) { this.setAttribute("placeholder", val); }
        get readOnly() { return this.hasAttribute("readonly"); }
        set readOnly(val) {
            if(val) {
                this.setAttribute("readonly", true);
            } else {
                this.removeAttribute("readonly");
            }
        }
        get required() { return this.hasAttribute("readonly"); }
        set required(val) {
            if(val) {
                this.setAttribute("readonly", true);
            } else {
                this.removeAttribute("readonly");
            }
        }
        get rows() { return this.getTextareaProperty("rows", Number(this.getAttribute("rows"))); }
        set rows(val) { this.setAttribute("rows", val); }
        get selectionDirection() { return this.getTextareaProperty("selectionDirection"); }
        set selectionDirection(val) { this.setTextareaProperty("selectionDirection", val); }
        get selectionEnd() { return this.getTextareaProperty("selectionEnd"); }
        set selectionEnd(val) { this.setTextareaProperty("selectionEnd", val); }
        get selectionStart() { return this.getTextareaProperty("selectionStart"); }
        set selectionStart(val) { this.setTextareaProperty("selectionStart", val); }
        get textLength() { return this.value.length; }
        get type() { return "textarea"; } // Mimics textarea
        get validationMessage() { return this.getTextareaProperty("validationMessage"); }
        get validity() { return this.getTextareaProperty("validationMessage"); }
        get value() { return this.getTextareaProperty("value", this.getAttribute("value") || this.innerHTML); }
        set value(val) {
            val = val || "";
            if(this.setTextareaProperty("value", val, false)) {
                if(this.textareaElement) this.scheduleHighlight();
            } else {
                this.innerHTML = val;
            }
        }
        get willValidate() { return this.getTextareaProperty("willValidate", this.disabled || this.readOnly); }
        get wrap() { return this.getAttribute("wrap") || ""; }
        set wrap(val) { this.setAttribute("wrap", val); }

        /**
         * Get the JavaScript method from the internal textarea
         * element, throwing an error when no textarea is present.
         * The method is bound to the textarea as `this`.
         *
         * For internal use - treat the code-input element as a
         * textarea for the standard functions (e.g. document.
         * querySelector("code-input").focus()).
         */
        getTextareaMethod(name) {
            if(this.textareaElement) {
                return this.textareaElement[name].bind(this.textareaElement);
            } else {
                // Unregistered
                const fallbackTextarea = this.querySelector("textarea[data-code-input-fallback]");
                if(fallbackTextarea) {
                    return fallbackTextarea[name].bind(fallbackTextarea);
                } else {
                    throw new Error("Cannot call "+name+" on an unregistered code-input element without a data-code-input-fallback textarea.");
                }
            }
        }

        blur(options={}) { this.getTextareaMethod("blur")(options); }
        checkValidity() { return this.getTextareaMethod("checkValidity")(); }
        focus(options={}) { this.getTextareaMethod("focus")(options); }
        reportValidity() { return this.getTextareaMethod("reportValidity")(); }
        setCustomValidity(error) { this.getTextareaMethod("setCustomValidity")(error); }
        setRangeText(replacement, selectionStart=this.selectionStart, selectionEnd=this.selectionEnd, selectMode="preserve") {
            this.getTextareaMethod("setRangeText")(replacement, selectionStart, selectionEnd, selectMode);
            // Reflect that value updated
            if(this.textareaElement) this.scheduleHighlight();
        }
        setSelectionRange(selectionStart, selectionEnd, selectionDirection="none") { this.getTextareaMethod("setSelectionRange")(selectionStart, selectionEnd, selectionDirection); }

        /**
         * Allows plugins to store data in the scope of a single element.
         * Key - name of the plugin, in camelCase
         * Value - object of data to be stored; different plugins may use this differently.
         */
        pluginData = {};

        /**
        * Update value on form reset
        */
        formResetCallback() {
            this.value = this.initialValue;
        };
    }
}

// ESM-SUPPORT-START-TEMPLATES-BLOCK-2 Do not (re)move this - it's needed for ESM generation!
{
    // Templates are defined here after the codeInput variable is set, because they reference it by extending codeInput.Template.

    // ESM-SUPPORT-START-TEMPLATE-prism Do not (re)move this - it's needed for ESM generation!
    /**
    * A template that uses Prism.js syntax highlighting (https://prismjs.com/).
    */
    class Prism extends codeInput.Template { // Dependency: Prism.js (https://prismjs.com/)
        /**
        * Constructor to create a template that uses Prism.js syntax highlighting (https://prismjs.com/)
        * @param {Object} prism Import Prism.js, then after that import pass the `Prism` object as this parameter.
        * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.plugins`
        * @param {boolean} preElementStyled - Defaults to true, which should be right for most themes. If the styling is broken, change to false. (See `codeInput.Template` constructor's definition.)
        * @returns {codeInput.Template} template object
        */
        constructor(prism, plugins = [], preElementStyled = true) {
            super(
                prism.highlightElement, // highlight
                preElementStyled, // preElementStyled
                true, // isCode
                false, // includeCodeInputInHighlightFunc
                plugins
            );
        }
    };
    // ESM-SUPPORT-END-TEMPLATE-prism Do not (re)move this - it's needed for ESM generation!
    codeInput.templates.Prism = Prism;

    // ESM-SUPPORT-START-TEMPLATE-hljs Do not (re)move this - it's needed for ESM generation!
    /**
     * A template that uses highlight.js syntax highlighting (https://highlightjs.org/).
     */
    class Hljs extends codeInput.Template { // Dependency: Highlight.js (https://highlightjs.org/)
        /**
         * Constructor to create a template that uses highlight.js syntax highlighting (https://highlightjs.org/)
         * @param {Object} hljs Import highlight.js, then after that import pass the `hljs` object as this parameter.
         * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.plugins`
         * @param {boolean} preElementStyled - Defaults to false, which should be right for most themes. If the styling is broken, change to true. (See `codeInput.Template` constructor's definition.)
         * @returns {codeInput.Template} template object
         */
        constructor(hljs, plugins = [], preElementStyled = false) {
            super(
                function(codeElement) {
                    codeElement.removeAttribute("data-highlighted");
                    hljs.highlightElement(codeElement);
                }, // highlight
                preElementStyled, // preElementStyled
                true, // isCode
                false, // includeCodeInputInHighlightFunc
                plugins
            );
        }
    };
    // ESM-SUPPORT-END-TEMPLATE-hljs Do not (re)move this - it's needed for ESM generation!
    codeInput.templates.Hljs = Hljs;
}
// ESM-SUPPORT-END-TEMPLATES-BLOCK-2 Do not (re)move this - it's needed for ESM generation!

customElements.define("code-input", codeInput.CodeInput);
