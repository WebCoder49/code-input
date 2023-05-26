// CodeInput
// by WebCoder49
// Based on a CSS-Tricks Post

var codeInput = {
    /**
     * A list of attributes that will trigger the 
     * `codeInput.CodeInput.attributeChangedCallback` 
     * when modified in a code-input element. This
     * does not include events, which are handled in
     * `codeInput.CodeInput.addEventListener` and
     * `codeInput.CodeInput.removeEventListener`.
     */
    observedAttributes: [
        "value", 
        "name",
        "placeholder", 
        "lang", 
        "template"
    ],
    
    /* ------------------------------------
    *  ------------Templates---------------
    *  ------------------------------------ 
    * Each code-input element has a template attribute that 
    * tells it which template to use.
    * Each template contains functions and preferences that 
    * run the syntax-highlighting and let code-input control 
    * the highlighting. */

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
     * Value - A code-input element
     * @type {Object}
     */
    templateNotYetRegisteredQueue: {},
    
    /* ------------------------------------
    *  ------------Plugins-----------------
    *  ------------------------------------ 
    * Plugins are imported from the plugins folder. They will then
    * provide custom extra functionality to code-input elements. */
    
    /**
     * Where plugins are stored, after they are imported. The plugin
     * file assigns them a space in this object.
     * Key - Plugin Name
     * Value - Plugin
     * @type {Object}
     */
    plugins: {
    },

    /**
     * A Plugin (see above)
     */
    Plugin: class {
        constructor() {
            console.log("code-input: plugin: Created plugin!");

            codeInput.observedAttributes = codeInput.observedAttributes.concat(self.observedAttributes);
        }

        /**
         * Runs before code is highlighted.
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         */
        beforeHighlight(codeInput) {}
        /**
         * Runs after code is highlighted.
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         */
        afterHighlight(codeInput) {}
        /**
         * Runs before elements are added into a code-input element.
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         */
        beforeElementsAdded(codeInput) {}
        /**
         * Runs after elements are added into a code-input element (useful for adding events to the textarea).
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         */
        afterElementsAdded(codeInput) {}
        /**
         * Runs when an attribute of a code-input element is changed (you must add the attribute name to `codeInput.Plugin.observedAttributes` first).
         * @param {codeInput.CodeInput} codeInput - The codeInput element
         * @param {string} name - The name of the attribute
         * @param {string} oldValue - The value of the attribute before it was changed
         * @param {string} newValue - The value of the attribute after it is changed
         */
        attributeChanged(codeInput, name, oldValue, newValue) {}
        /**
         * The HTML attributes to watch for this plugin, and report any 
         * modifications to the `codeInput.Plugin.attributeChanged` method.
         */
        observedAttributes = []
    },
    
    /* ------------------------------------
    *  -------------Main-------------------
    *  ------------------------------------ */

    /**
     * A code-input element.
     */
    CodeInput: class extends HTMLElement {
        constructor() {
            super(); // Element
        }

        /**
         * When events are transferred to the textarea element, callbacks
         * are bound to set the this variable to the code-inpute element
         * rather than the textarea. This allows the callback to be converted
         * to a bound one:
         * Key - Callback not bound
         * Value - Callback that is bound, with this equalling the code-input element in the callback 
         */
        boundEventCallbacks = {}; // TODO

        /** Trigger this event in all plugins with a optional list of arguments 
         * @param {string} eventName - the name of the event to trigger
         * @param {Array} args - the arguments to pass into the event callback in the template after the code-input element. Normally left empty
        */
        pluginEvt(eventName, args) {
            for (let i in this.template.plugins) {
                let plugin = this.template.plugins[i];
                if (eventName in plugin) {
                    if(args === undefined) {
                        plugin[eventName](this);
                    } else {
                        plugin[eventName](this, ...args);
                    }
                }
            }
        }

        // TODO: Clean up

         /* Syntax-highlighting functions */
         update(text) {
            // Prevent this from running multiple times on the same input when "value" attribute is changed, 
            // by not running when value is already equal to the input of this (implying update has already
            // been run). Thank you to peterprvy for this. 
            if(this.ignoreValueUpdate) return;
            
            this.ignoreValueUpdate = true;
            this.value = text; // Change value attribute if necessary.
            this.ignoreValueUpdate = false;
            if(this.querySelector("textarea").value != text) this.querySelector("textarea").value = text;  


            let resultElement = this.querySelector("pre code");
    
            // Handle final newlines (see article)
            if (text[text.length - 1] == "\n") {
                text += " ";
            }

            // Update code
            resultElement.innerHTML = this.escapeHtml(text);
            this.pluginEvt("beforeHighlight");

            // Syntax Highlight
            if(this.template.includeCodeInputInHighlightFunc) this.template.highlight(resultElement, this);
            else this.template.highlight(resultElement);
           
            this.pluginEvt("afterHighlight");
        }

        syncScroll() {
            /* Scroll result to scroll coords of event - sync with textarea */
            let inputElement = this.querySelector("textarea");
            let resultElement = this.template.preElementStyled ? this.querySelector("pre") : this.querySelector("pre code");
            // Get and set x and y
            resultElement.scrollTop = inputElement.scrollTop;
            resultElement.scrollLeft = inputElement.scrollLeft;
        }

        escapeHtml(text) {
            return text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;"); /* Global RegExp */
        }

        /* Get the template for this element or add to the unrecognised template queue. */
        getTemplate() {
            // Get name of template
            let templateName;
            if(this.getAttribute("template") == undefined) {
                // Default
                templateName = codeInput.defaultTemplate;
            } else {
                templateName = this.getAttribute("template");
            }
            // Get template
            if(templateName in codeInput.usedTemplates) {
                return codeInput.usedTemplates[templateName];
            } else {
                // Doesn't exist - add to queue
                if( !(templateName in codeInput.templateNotYetRegisteredQueue)) {
                    codeInput.templateNotYetRegisteredQueue[templateName] = [];
                }
                codeInput.templateNotYetRegisteredQueue[templateName].push(this);
                return undefined;
            }
            codeInput.usedTemplates[codeInput.defaultTemplate]
        }
        /* Set up element when a template is added */
        setup() {
            this.classList.add("code-input_registered"); // Remove register message
            if(this.template.preElementStyled) this.classList.add("code-input_pre-element-styled");

            this.pluginEvt("beforeElementsAdded");

            /* Defaults */
            let lang = this.getAttribute("lang");
            let placeholder = this.getAttribute("placeholder") || this.getAttribute("lang") || "";
            let value = this.value || this.innerHTML || "";
    
            this.innerHTML = ""; // Clear Content
    
            /* Create Textarea */
            let textarea = document.createElement("textarea");
            textarea.placeholder = placeholder;
            textarea.value = value;
            textarea.setAttribute("spellcheck", "false");
    
            if (this.getAttribute("name")) {
                textarea.setAttribute("name", this.getAttribute("name")); // for use in forms
            }
    
            textarea.addEventListener('input',(evt) => { textarea.parentElement.update(textarea.value); textarea.parentElement.syncScroll();});
            textarea.addEventListener('scroll',(evt) =>  textarea.parentElement.syncScroll());
            this.append(textarea);

            /* Create pre code */
            let code = document.createElement("code");
            let pre = document.createElement("pre");
            pre.setAttribute("aria-hidden", "true"); // Hide for screen readers
            pre.append(code);
            this.append(pre);

            if(this.template.isCode) {
                if(lang != undefined && lang != "") {
                    code.classList.add("language-" + lang);
                }
            }
            
            this.pluginEvt("afterElementsAdded");

            /* Add code from value attribute - useful for loading from backend */
            this.update(value, this);
        }
        
        /* Callbacks */
        connectedCallback() {
            // Added to document
            this.template = this.getTemplate();
            if(this.template != undefined) this.setup();
        }
        static get observedAttributes() {         
            return codeInput.observedAttributes;
        }
        
        attributeChangedCallback(name, oldValue, newValue) {
            if(this.isConnected) {
                // This will sometimes be called before the element has been created, so trying to update an attribute causes an error.
                // Thanks to Kevin Loughead for pointing this out.
                
                this.pluginEvt("attributeChanged", [name, oldValue, newValue]); // Plugin event
                switch (name) {
    
                    case "value":
                        this.update(newValue);
                        break;

                    case "name":
                        if(this.querySelector("textarea") !== null) {
                            this.querySelector("textarea").setAttribute("name", newValue); // for use in forms
                        }
                        break;
        
                    case "placeholder":
                        this.querySelector("textarea").placeholder = newValue;
                        break;
                    case "template":
                        this.template = codeInput.usedTemplates[newValue || codeInput.defaultTemplate];
                        if(this.template.preElementStyled) this.classList.add("code-input_pre-element-styled");
                        else this.classList.remove("code-input_pre-element-styled");
                        // Syntax Highlight
                        this.update(this.value);

                        break;
    
                    case "lang":

                        let code = this.querySelector("pre code");
                        let mainTextarea = this.querySelector("textarea");
                        
                        // Check not already updated
                        if(newValue != null) {
                            newValue = newValue.toLowerCase();
                        
                            if(code.classList.contains(`language-${newValue}`)) break; // Already updated
                        }
                        

                        // Case insensitive
                        oldValue = oldValue.toLowerCase();
    
                        // Remove old language class and add new
                        console.log("code-input: Language: REMOVE", "language-" + oldValue);
                        code.classList.remove("language-" + oldValue); // From CODE
                        code.parentElement.classList.remove("language-" + oldValue); // From PRE
                        code.classList.remove("language-none"); // Prism
                        code.parentElement.classList.remove("language-none"); // Prism
                        
                        if(newValue != undefined && newValue != "") {
                            code.classList.add("language-" + newValue);
                            console.log("code-input: Language:ADD", "language-" + newValue);
                        }
                        
                        if(mainTextarea.placeholder == oldValue) mainTextarea.placeholder = newValue;
    
                        this.update(this.value);

                        break;
                }
            }
            
        }

        /* Override addEventListener so event listener added to necessary child. Returns callback bound to code-input element as `this` */
        addEventListener(evtName, callback, thirdParameter=null) {
            let boundCallback = callback.bind(this);
            this.boundEventCallbacks[callback] = boundCallback;
            if(evtName == "change") {
                if(thirdParameter === null) {
                    this.querySelector("textarea").addEventListener("change", boundCallback);
                } else {
                    this.querySelector("textarea").addEventListener("change", boundCallback, thirdParameter);
                }
            } else if(evtName == "selectionchange") {
                if(thirdParameter === null) {
                    this.querySelector("textarea").addEventListener("selectionchange", boundCallback);
                } else {
                    this.querySelector("textarea").addEventListener("selectionchange", boundCallback, thirdParameter);
                }
            }
        }

        /* Override removeEventListener so event listener removed from necessary child */
        removeEventListener(evtName, callback, thirdParameter=null) {
            let boundCallback = this.boundEventCallbacks[callback];
            if(evtName == "change") {
                if(thirdParameter === null) {
                    this.querySelector("textarea").removeEventListener("change", boundCallback);
                } else {
                    this.querySelector("textarea").removeEventListener("change", boundCallback, thirdParameter);
                }
            } else if(evtName == "selectionchange") {
                if(thirdParameter === null) {
                    this.querySelector("textarea").removeEventListener("selectionchange", boundCallback);
                } else {
                    this.querySelector("textarea").removeEventListener("selectionchange", boundCallback, thirdParameter);
                }
            }
        }

        /* Value attribute */
        get value() {
            return this.getAttribute("value");
        }
        set value(val) {
            return this.setAttribute("value", val);
        }
        /* Placeholder attribute */
        get placeholder() {
            return this.getAttribute("placeholder");
        }
        set placeholder(val) {
            return this.setAttribute("placeholder", val);
        }

        pluginData = {}; // For plugins to store element-specific data under their name, e.g. <code-input>.pluginData.specialChars
    },
    
    registerTemplate: function(templateName, template) {
        // Set default class
        codeInput.usedTemplates[templateName] = template;
        // Add elements w/ template from queue
        if(templateName in codeInput.templateNotYetRegisteredQueue) {
            for(let i in codeInput.templateNotYetRegisteredQueue[templateName]) {
                elem = codeInput.templateNotYetRegisteredQueue[templateName][i];
                elem.template = template;
                elem.setup();
            }
            console.log(`code-input: template: Added existing elements with template ${templateName}`);
        }
        if(codeInput.defaultTemplate == undefined) {
            codeInput.defaultTemplate = templateName;
            // Add elements w/ default template from queue
            if(undefined in codeInput.templateNotYetRegisteredQueue) {
                for(let i in codeInput.templateNotYetRegisteredQueue[undefined]) {
                    elem = codeInput.templateNotYetRegisteredQueue[undefined][i];
                    elem.template = template;
                    elem.setup();
                }
            }
            console.log(`code-input: template: Set template ${templateName} as default`);
        }
        console.log(`code-input: template: Created template ${templateName}`);
    },
    templates: {
        custom(highlight=function() {}, preElementStyled=true, isCode=true, includeCodeInputInHighlightFunc=false, plugins=[]) {
            return {
                highlight: highlight, 
                includeCodeInputInHighlightFunc: includeCodeInputInHighlightFunc,
                preElementStyled: preElementStyled,
                isCode: isCode,
                plugins: plugins,
            };
        },
        prism(prism, plugins=[]) { // Dependency: Prism.js (https://prismjs.com/)
            return {
                includeCodeInputInHighlightFunc: false,
                highlight: prism.highlightElement, 
                preElementStyled: true,
                isCode: true,
                plugins: plugins,
            };
        },
        hljs(hljs, plugins=[]) { // Dependency: Highlight.js (https://highlightjs.org/)
            return {
                includeCodeInputInHighlightFunc: false,
                highlight: hljs.highlightElement, 
                preElementStyled: false,
                isCode: true,
                plugins: plugins,
            };
        },
        characterLimit() {
            return {
                highlight: function(resultElement, codeInput, plugins=[]) {

                    let characterLimit = Number(codeInput.getAttribute("data-character-limit"));

                    let normalCharacters = codeInput.escapeHtml(codeInput.value.slice(0, characterLimit));
                    let overflowCharacters = codeInput.escapeHtml(codeInput.value.slice(characterLimit));
                    
                    resultElement.innerHTML = `${normalCharacters}<mark class="overflow">${overflowCharacters}</mark>`;
                    if(overflowCharacters.length > 0) {
                        resultElement.innerHTML += ` <mark class="overflow-msg">${codeInput.getAttribute("data-overflow-msg") || "(Character limit reached)"}</mark>`;
                    }
                },
                includeCodeInputInHighlightFunc: true,
                preElementStyled: true,
                isCode: false,
                plugins: plugins,
            }
        },
        rainbowText(rainbowColors=["red", "orangered", "orange", "goldenrod", "gold", "green", "darkgreen", "navy", "blue",  "magenta"], delimiter="", plugins=[]) {
            return {
                highlight: function(resultElement, codeInput) {
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
        }
    }
}

customElements.define("code-input", codeInput.CodeInput); // Set tag
