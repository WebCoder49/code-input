export as namespace codeInput;

/**
 * Plugins are imported from the plugins folder. They will then
 * provide custom extra functionality to code-input elements.
 */
export abstract class Plugin {
  /**
   * Create a Plugin
   * 
   * @param {Array<string>} observedAttributes - The HTML attributes to watch for this plugin, and report any 
   * modifications to the `codeInput.Plugin.attributeChanged` method.
   */
  constructor(observedAttributes: Array<string>)
  /**
   * Runs before code is highlighted.
   * @param {codeInput.CodeInput} codeInput - The codeInput element
   */
  beforeHighlight(codeInput: CodeInput): void
  /**
   * Runs after code is highlighted.
   * @param {codeInput.CodeInput} codeInput - The codeInput element
   */
  afterHighlight(codeInput: CodeInput): void
  /**
   * Runs before elements are added into a code-input element.
   * @param {codeInput.CodeInput} codeInput - The codeInput element
   */
  beforeElementsAdded(codeInput: CodeInput): void
  /**
   * Runs after elements are added into a code-input element (useful for adding events to the textarea).
   * @param {codeInput.CodeInput} codeInput - The codeInput element
   */
  afterElementsAdded(codeInput: CodeInput): void
  /**
   * Runs when an attribute of a code-input element is changed (you must add the attribute name to `codeInput.Plugin.observedAttributes` first).
   * @param {codeInput.CodeInput} codeInput - The codeInput element
   * @param {string} name - The name of the attribute
   * @param {string} oldValue - The value of the attribute before it was changed
   * @param {string} newValue - The value of the attribute after it is changed
   */
  attributeChanged(codeInput: CodeInput, name: string, oldValue: string, newValue: string): void
  /**
   * The HTML attributes to watch for this plugin, and report any 
   * modifications to the `codeInput.Plugin.attributeChanged` method.
   */
  observedAttributes: Array<string>
}

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
export namespace plugins {
  /**
   * JavaScript example of a plugin, which brings extra,
   * non-central optional functionality to code-input.
   * Instances of plugins can be passed in in an array
   * to the `plugins` argument when registering a template,
   * for example like this:
   * ```javascript
   * codeInput.registerTemplate("syntax-highlighted", codeInput.templates.hljs(hljs, [new codeInput.plugins.Test()]));
   * ```
   */
  class Test extends Plugin {
    constructor();
  }

  /**
   * Display a popup under the caret using the text in the code-input element. This works well with autocomplete suggestions.
   * Files: autocomplete.js / autocomplete.css
   */
  class Autocomplete extends Plugin {
    /**
     * Pass in a function to display the popup that takes in (popup element, textarea, textarea.selectionEnd).
     * @param {function} updatePopupCallback  a function to display the popup that takes in (popup element, textarea, textarea.selectionEnd).
     */
    constructor(updatePopupCallback: (popupElem: HTMLElement, textarea: HTMLTextAreaElement, selectionEnd: number) => void);
  }

  /**
   * Autodetect the language live and change the `lang` attribute using the syntax highlighter's 
   * autodetect capabilities. Works with highlight.js only.
   * Files: autodetect.js
   */
  class Autodetect extends Plugin {
    constructor();
  }

  /**
   * Debounce the update and highlighting function
   * https://medium.com/@jamischarles/what-is-debouncing-2505c0648ff1
   * Files: debounce-update.js
   */
  class DebounceUpdate extends Plugin {
    /**
     * Create a debounced update plugin to pass into a template.
     * @param {Number} delayMs Delay, in ms, to wait until updating the syntax highlighting 
     */
    constructor(delayMs: number);
  }

  /**
   * Adds indentation using the `Tab` key, and auto-indents after a newline, as well as making it 
   * possible to indent/unindent multiple lines using Tab/Shift+Tab
   * Files: indent.js
   */
  class Indent extends Plugin {
    constructor();
  }

  /**
   * Render special characters and control characters as a symbol with their hex code.
   * Files: special-chars.js, special-chars.css
   */
  class SpecialChars extends Plugin {
    /**
     * Create a special characters plugin instance.
     * Default = covers many non-renderable ASCII characters.
     * @param {Boolean} colorInSpecialChars Whether or not to give special characters custom background colors based on their hex code
     * @param {Boolean} inheritTextColor If `colorInSpecialChars` is false, forces the color of the hex code to inherit from syntax highlighting. Otherwise, the base color of the `pre code` element is used to give contrast to the small characters.
     * @param {RegExp} specialCharRegExp The regular expression which matches special characters
     */
    constructor(colorInSpecialChars?: boolean, inheritTextColor?: boolean, specialCharRegExp?: RegExp);
  }
}

/**
 * Register a plugin class under `codeInput.plugins`.
 * @param {string} pluginName The identifier of the plugin: if it is `"foo"`, `new codeInput.plugins.foo(`...`)` will instantiate it, etc.
 * @param {Object} pluginClass The class of the plugin, created with `class extends codeInput.plugin {`...`}`
 */
export function registerPluginClass(pluginName: string, pluginClass: Object): void;

/**
 * Please see `codeInput.templates.prism` or `codeInput.templates.hljs`.
 * Templates are used in `<code-input>` elements and once registered with
 * `codeInput.registerTemplate` will be in charge of the highlighting
 * algorithm and settings for all code-inputs with a `template` attribute
 * matching the registered name.
 */
export class Template {
  /**
   * **When `includeCodeInputInHighlightFunc` is `false`, `highlight` takes only the `<pre><code>` element as a parameter.**
   * 
   * Constructor to create a custom template instance. Pass this into `codeInput.registerTemplate` to use it.
   * I would strongly recommend using the built-in simpler template `codeInput.templates.prism` or `codeInput.templates.hljs`.
   * @param {Function} highlight - a callback to highlight the code, that takes an HTML `<code>` element inside a `<pre>` element as a parameter
   * @param {boolean} preElementStyled - is the `<pre>` element CSS-styled as well as the `<code>` element? If true, `<pre>` element's scrolling is synchronised; if false, `<code>` element's scrolling is synchronised.
   * @param {boolean} isCode - is this for writing code? If true, the code-input's lang HTML attribute can be used, and the `<code>` element will be given the class name 'language-[lang attribute's value]'.
   * @param {false} includeCodeInputInHighlightFunc - Setting this to true passes the `<code-input>` element as a second argument to the highlight function.
   * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.Plugin`
   * @returns template object
   */
  constructor(highlight?: (code: HTMLElement) => void, preElementStyled?: boolean, isCode?: boolean, includeCodeInputInHighlightFunc?: false, plugins?: Plugin[])
  /**
   * **When `includeCodeInputInHighlightFunc` is `true`, `highlight` takes two parameters: the `<pre><code>` element, and the `<code-input>` element.**
   * 
   * Constructor to create a custom template instance. Pass this into `codeInput.registerTemplate` to use it.
   * I would strongly recommend using the built-in simpler template `codeInput.templates.prism` or `codeInput.templates.hljs`.
   * @param {Function} highlight - a callback to highlight the code, that takes an HTML `<code>` element inside a `<pre>` element as a parameter
   * @param {boolean} preElementStyled - is the `<pre>` element CSS-styled as well as the `<code>` element? If true, `<pre>` element's scrolling is synchronised; if false, `<code>` element's scrolling is synchronised.
   * @param {boolean} isCode - is this for writing code? If true, the code-input's lang HTML attribute can be used, and the `<code>` element will be given the class name 'language-[lang attribute's value]'.
   * @param {true} includeCodeInputInHighlightFunc - Setting this to true passes the `<code-input>` element as a second argument to the highlight function.
   * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.Plugin`
   * @returns template object
   */
  constructor(highlight?: (code: HTMLElement, codeInput: CodeInput) => void, preElementStyled?: boolean, isCode?: boolean, includeCodeInputInHighlightFunc?: true, plugins?: Plugin[])
  highlight: Function
  preElementStyled: boolean
  isCode: boolean
  includeCodeInputInHighlightFunc: boolean
  plugins: Plugin[]
}

/** 
 * Shortcut functions for creating templates.
 * Each code-input element has a template attribute that 
 * tells it which template to use.
 * Each template contains functions and preferences that 
 * run the syntax-highlighting and let code-input control 
 * the highlighting.
 * 
 * For creating a custom template from scratch, please 
 * use `new codeInput.Template(...)`.
 * 
 * For adding small pieces of functionality, please see `codeInput.plugins`.
 */
export namespace templates {
  /**
   * Constructor to create a template that uses Prism.js syntax highlighting (https://prismjs.com/)
   * @param {Object} prism Import Prism.js, then after that import pass the `Prism` object as this parameter.
   * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.plugins`
   * @returns template object
   */
  function prism(prism: Object, plugins?: Plugin[]): Template
  /**
   * Constructor to create a template that uses highlight.js syntax highlighting (https://highlightjs.org/)
   * @param {Object} hljs Import highlight.js, then after that import pass the `hljs` object as this parameter.
   * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.plugins`
   * @returns template object
   */
  function hljs(hljs: Object, plugins?: Plugin[]): Template
  /**
   * Constructor to create a proof-of-concept template that gives a message if too many characters are typed.
   * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.plugins`
   * @returns template object
   */
  function characterLimit(plugins?: Plugin[]): Template
  /**
   * Constructor to create a proof-of-concept template that shows text in a repeating series of colors.
   * @param {string[]} rainbowColors - An array of CSS colors, in the order each color will be shown
   * @param {string} delimiter - The character used to split up parts of text where each part is a different colour (e.g. "" = characters, " " = words)
   * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.plugins`
   * @returns template object
   */
  function rainbowText(rainbowColors?: string[], delimiter?: string, plugins?: Plugin[]): Template
}

/**
 * A `<code-input>` element, an instance of an `HTMLElement`, and the result
 * of `document.createElement("code-input")`.
 */
export class CodeInput extends HTMLElement { }

/**
 * Register a template so code-input elements with a template attribute that equals the templateName will use the template.
 * See `codeInput.templates` for constructors to create templates.
 * @param {string} templateName - the name to register the template under
 * @param {Object} template - a Template object instance - see `codeInput.templates`  
 */
export function registerTemplate(templateName: string, template: Template): void;