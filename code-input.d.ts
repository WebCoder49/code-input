export as namespace codeInput;
// ESM-SUPPORT-END-NOESM-SPECIFIC Do not (re)move this - it's needed for ESM generation

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

// ESM-SUPPORT-START-NAMESPACE-1 Do not (re)move this - it's needed for ESM generation
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
  // ESM-SUPPORT-START-PLUGIN-test Do not (re)move this - it's needed for ESM generation
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
  // ESM-SUPPORT-END-PLUGIN-test Do not (re)move this - it's needed for ESM generation

  // ESM-SUPPORT-START-PLUGIN-auto-close-brackets Do not (re)move this - it's needed for ESM generation
  /**
   * Automatically closes pairs of brackets/quotes/other syntaxes in code, but also lets you choose the brackets this
   * is activated for.
   * Files: auto-close-brackets.js
   */
  class AutoCloseBrackets extends Plugin {
    /**
     * Create an auto-close brackets plugin to pass into a template
     * @param {Object} bracketPairs Opening brackets mapped to closing brackets, default and example {"(": ")", "[": "]", "{": "}", '"': '"'}. All brackets must only be one character.
     */
    constructor(bracketPairs?: Object);
  }
  // ESM-SUPPORT-END-PLUGIN-auto-close-brackets Do not (re)move this - it's needed for ESM generation

  // ESM-SUPPORT-START-PLUGIN-autocomplete Do not (re)move this - it's needed for ESM generation
  /**
   * Display a popup under the caret using the text in the code-input element. This works well with autocomplete suggestions.
   * Files: autocomplete.js / autocomplete.css
   */
  class Autocomplete extends Plugin {
    /**
     * Pass in a function to create a plugin that displays the popup that takes in (popup element, textarea, textarea.selectionEnd).
     * @param {(popupElement: HTMLElement, textarea: HTMLTextAreaElement, selectionEnd: number, selectionStart?: number) => void} updatePopupCallback  a function to display the popup that takes in (popup element, textarea, textarea.selectionEnd).
     */
    constructor(updatePopupCallback: (popupElem: HTMLElement, textarea: HTMLTextAreaElement, selectionEnd: number, selectionStart?: number) => void);
  }
  // ESM-SUPPORT-END-PLUGIN-autocomplete Do not (re)move this - it's needed for ESM generation

  // ESM-SUPPORT-START-PLUGIN-autodetect Do not (re)move this - it's needed for ESM generation
  /**
   * Autodetect the language live and change the `lang` attribute using the syntax highlighter's 
   * autodetect capabilities. Works with highlight.js only.
   * Files: autodetect.js
   */
  class Autodetect extends Plugin {
    constructor();
  }
  // ESM-SUPPORT-END-PLUGIN-autodetect Do not (re)move this - it's needed for ESM generation

  // ESM-SUPPORT-START-PLUGIN-find-and-replace Do not (re)move this - it's needed for ESM generation
  /**
   * Add Find-and-Replace (Ctrl+F for find, Ctrl+H for replace by default) functionality to the code editor.
   * Files: find-and-replace.js / find-and-replace.css
   */
  class FindAndReplace extends Plugin {
    /**
     * Create a find-and-replace command plugin to pass into a template
     * @param {boolean} useCtrlF Should Ctrl+F be overriden for find-and-replace find functionality? If not, you can trigger it yourself using (instance of this plugin)`.showPrompt(code-input element, false)`.
     * @param {boolean} useCtrlH Should Ctrl+H be overriden for find-and-replace replace functionality? If not, you can trigger it yourself using (instance of this plugin)`.showPrompt(code-input element, true)`.
     * @param {Object} instructionTranslations: user interface string keys mapped to translated versions for localisation. Look at the find-and-replace.js source code for the English text.
     */
    constructor(useCtrlF?: boolean, useCtrlH?: boolean,
                instructionTranslations?: {
                  start?: string;
                  none?: string;
                  oneFound?: string;
                  matchIndex?: (index: Number, count: Number) => string;
                  error?: (message: string) => string;
                  infiniteLoopError?: string;
                  closeDialog?: string;
                  findPlaceholder?: string;
                  findCaseSensitive?: string;
                  findRegExp?: string;
                  replaceTitle?: string;
                  replacePlaceholder?: string;
                  findNext?: string;
                  findPrevious?: string;
                  replaceActionShort?: string;
                  replaceAction?: string;
                  replaceAllActionShort?: string;
                  replaceAllAction?: string
                }
              );
    /**
     * Show a find-and-replace dialog.
     * @param {codeInput.CodeInput} codeInputElement the `<code-input>` element.
     * @param {boolean} replacePartExpanded whether the replace part of the find-and-replace dialog should be expanded
     */
    showPrompt(codeInputElement: CodeInput, replacePartExpanded: boolean): void;
  }
  // ESM-SUPPORT-END-PLUGIN-find-and-replace Do not (re)move this - it's needed for ESM generation
  
  // ESM-SUPPORT-START-PLUGIN-go-to-line Do not (re)move this - it's needed for ESM generation
  /**
   * Add basic Go-To-Line (ctrl-G by default) functionality to the code editor.
   * Files: go-to-line.js / go-to-line.css
   */
  class GoToLine extends Plugin {
    /**
     * Create a go-to-line command plugin to pass into a template
     * @param {boolean} useCtrlG Should Ctrl+G be overriden for go-to-line functionality? If not, you can trigger it yourself using (instance of this plugin)`.showPrompt(code-input element)`.
     * @param {Object} instructionTranslations: user interface string keys mapped to translated versions for localisation. Look at the go-to-line.js source code for the English text.
     */
    constructor(useCtrlG?: boolean,
                instructionTranslations?: {
                  closeDialog?: string;
                  input?: string;
                  guidanceFormat?: string;
                  guidanceLineRange?: (current:Number, max: Number) => string;
                  guidanceColumnRange?: (line: Number, current: Number, max: Number) => string;
                  guidanceValidLine?: (line: Number) => string;
                  guidanceValidColumn?: (line: Number, column: Number) => string;
                });
    /**
     * Show a search-like dialog prompting line number.
     * @param {codeInput.CodeInput} codeInput the `<code-input>` element.
    */
    showPrompt(codeInput: CodeInput): void;
  }
  // ESM-SUPPORT-END-PLUGIN-go-to-line Do not (re)move this - it's needed for ESM generation

  // ESM-SUPPORT-START-PLUGIN-indent Do not (re)move this - it's needed for ESM generation
  /**
   * Adds indentation using the `Tab` key, and auto-indents after a newline, as well as making it 
   * possible to indent/unindent multiple lines using Tab/Shift+Tab
   * Files: indent.js
   */
  class Indent extends Plugin {
    /**
     * Create an indentation plugin to pass into a template
     * @param {boolean} defaultSpaces Should the Tab key enter spaces rather than tabs? Defaults to false.
     * @param {Number} numSpaces How many spaces is each tab character worth? Defaults to 4.
     * @param {Object} bracketPairs Opening brackets mapped to closing brackets, default and example {"(": ")", "[": "]", "{": "}"}. All brackets must only be one character, and this can be left as null to remove bracket-based indentation behaviour.
     * @param {boolean} escTabToChangeFocus Whether pressing the Escape key before (Shift+)Tab should make this keypress focus on a different element (Tab's default behaviour). You should always either enable this or use this plugin's disableTabIndentation and enableTabIndentation methods linked to other keyboard shortcuts, for accessibility.
     * @param {Object} instructionTranslations: user interface string keys mapped to translated versions for localisation. Look at the go-to-line.js source code for the English text.
     */
    constructor(defaultSpaces?: boolean, numSpaces?: Number, bracketPairs?: Object, escTabToChangeFocus?: boolean, instructionTwranslations?: {
      tabForIndentation?: string;
      tabForNavigation?: string;
    });
  }
  // ESM-SUPPORT-END-PLUGIN-indent Do not (re)move this - it's needed for ESM generation

  // ESM-SUPPORT-START-PLUGIN-select-token-callbacks Do not (re)move this - it's needed for ESM generation
  /**
   * Make tokens in the <pre><code> element that are included within the selected text of the <code-input>
   * gain a CSS class while selected, or trigger JavaScript callbacks.
   * Files: select-token-callbacks.js
   */
  class SelectTokenCallbacks extends Plugin {
    /**
     * Set up the behaviour of tokens text-selected in the `<code-input>` element, and the exact definition of a token being text-selected.
     * 
     * All parameters are optional. If you provide no arguments to the constructor, this will dynamically apply the "code-input_select-token-callbacks_selected" class to selected tokens only, for you to style via CSS.
     * 
     * @param {codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks} tokenSelectorCallbacks What to do with text-selected tokens. See docstrings for the TokenSelectorCallbacks class.
     * @param {boolean} onlyCaretNotSelection If true, tokens will only be marked as selected when no text is selected but rather the caret is inside them (start of selection == end of selection). Default false.
     * @param {boolean} caretAtStartIsSelected Whether the caret or text selection's end being just before the first character of a token means said token is selected. Default true.
     * @param {boolean} caretAtEndIsSelected Whether the caret or text selection's start being just after the last character of a token means said token is selected. Default true.
     * @param {boolean} createSubTokens Whether temporary `<span>` elements should be created inside partially-selected tokens containing just the selected text and given the selected class. Default false.
     * @param {boolean} partiallySelectedTokensAreSelected Whether tokens for which only some of their text is selected should be treated as selected. Default true.
     * @param {boolean} parentTokensAreSelected Whether all parent tokens of selected tokens should be treated as selected. Default true.
     */
    constructor(tokenSelectorCallbacks?: codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks, onlyCaretNotSelection?: boolean, caretAtStartIsSelected?: boolean, caretAtEndIsSelected?: boolean, createSubTokens?: boolean, partiallySelectedTokensAreSelected?: boolean, parentTokensAreSelected?: boolean);
  }

  namespace SelectTokenCallbacks {
    /**
     * A data structure specifying what should be done with tokens when they are selected, and also allows for previously selected
     * tokens to be dealt with each time the selection changes. See the constructor and the createClassSynchronisation static method.
     */
    class TokenSelectorCallbacks {
      /**
       * Pass any callbacks you want to customise the behaviour of selected tokens via JavaScript.
       * 
       * (If the behaviour you want is just differently styling selected tokens _via CSS_, you should probably use the createClassSynchronisation static method.) 
       * @param {(token: HTMLElement) => void} tokenSelectedCallback Runs multiple times when the text selection inside the code-input changes, each time inputting a single (part of the highlighted `<pre><code>`) token element that is selected in the new text selection.
       * @param {(tokenContainer: HTMLElement) => void} selectChangedCallback Each time the text selection inside the code-input changes, runs once before any tokenSelectedCallback calls, inputting the highlighted `<pre><code>`'s `<code>` element that contains all token elements.
       */
      constructor(tokenSelectedCallback: (token: HTMLElement) => void, selectChangedCallback: (tokenContainer: HTMLElement) => void);
      
      /**
       * Use preset callbacks which ensure all tokens in the selected text range in the `<code-input>`, and only such tokens, are given a certain CSS class.
       * 
       * (If the behaviour you want requires more complex behaviour or JavaScript, you should use TokenSelectorCallbacks' constructor.) 
       * 
       * @param {string} selectedClass The CSS class that will be present on tokens only when they are part of the selected text in the `<code-input>` element. Defaults to "code-input_select-token-callbacks_selected".
       * @returns {TokenSelectorCallbacks} A new TokenSelectorCallbacks instance that encodes this behaviour.
       */
      static createClassSynchronisation(selectedClass?: string): codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks;
    }
  }
  // ESM-SUPPORT-END-PLUGIN-select-token-callbacks Do not (re)move this - it's needed for ESM generation

  // ESM-SUPPORT-START-PLUGIN-special-chars Do not (re)move this - it's needed for ESM generation
  /**
   * Render special characters and control characters as a symbol with their hex code.
   * Files: special-chars.js, special-chars.css
   */
  class SpecialChars extends Plugin {
    /**
     * Create a special characters plugin instance.
     * Default = covers many non-renderable ASCII characters.
     * @param {Boolean} colorInSpecialChars Whether or not to give special characters custom background colors based on their hex code
     * @param {Boolean} inheritTextColor If `inheritTextColor` is false, forces the color of the hex code to inherit from syntax highlighting. Otherwise, the base color of the `pre code` element is used to give contrast to the small characters.
     * @param {RegExp} specialCharRegExp The regular expression which matches special characters
     */
    constructor(colorInSpecialChars?: boolean, inheritTextColor?: boolean, specialCharRegExp?: RegExp);
  }
  // ESM-SUPPORT-END-PLUGIN-special-chars Do not (re)move this - it's needed for ESM generation
}
// ESM-SUPPORT-END-NAMESPACE-1 Do not (re)move this - it's needed for ESM generation

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
   * @param {(codeElement: HTMLElement) => void} highlight - a callback to highlight the code, that takes an HTML `<code>` element inside a `<pre>` element as a parameter
   * @param {boolean} preElementStyled - is the `<pre>` element CSS-styled as well as the `<code>` element? If true, `<pre>` element's scrolling is synchronised; if false, `<code>` element's scrolling is synchronised.
   * @param {boolean} isCode - is this for writing code? If true, the code-input's lang HTML attribute can be used, and the `<code>` element will be given the class name 'language-[lang attribute's value]'.
   * @param {false} includeCodeInputInHighlightFunc - Setting this to true passes the `<code-input>` element as a second argument to the highlight function.
   * @param {boolean} autoDisableDuplicateSearching - Leaving this as true uses code-input's default fix for preventing duplicate results in Ctrl+F searching from the input and result elements, and setting this to false indicates your highlighting function implements its own fix. The default fix works by moving text content from elements to CSS `::before` pseudo-elements after highlighting.
   * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.Plugin`
   * @returns template object
   */
  constructor(highlight?: (codeElement: HTMLElement) => void, preElementStyled?: boolean, isCode?: boolean, includeCodeInputInHighlightFunc?: false, autoDisableDuplicateSearching?: boolean, plugins?: Plugin[])
  /**
   * **When `includeCodeInputInHighlightFunc` is `true`, `highlight` takes two parameters: the `<pre><code>` element, and the `<code-input>` element.**
   * 
   * Constructor to create a custom template instance. Pass this into `codeInput.registerTemplate` to use it.
   * I would strongly recommend using the built-in simpler template `codeInput.templates.prism` or `codeInput.templates.hljs`.
   * @param {(codeElement: HTMLElement, codeInput: CodeInput) => void} highlight - a callback to highlight the code, that takes an HTML `<code>` element inside a `<pre>` element as a parameter
   * @param {boolean} preElementStyled - is the `<pre>` element CSS-styled as well as the `<code>` element? If true, `<pre>` element's scrolling is synchronised; if false, `<code>` element's scrolling is synchronised.
   * @param {boolean} isCode - is this for writing code? If true, the code-input's lang HTML attribute can be used, and the `<code>` element will be given the class name 'language-[lang attribute's value]'.
   * @param {true} includeCodeInputInHighlightFunc - Setting this to true passes the `<code-input>` element as a second argument to the highlight function.
   * @param {boolean} autoDisableDuplicateSearching - Leaving this as true uses code-input's default fix for preventing duplicate results in Ctrl+F searching from the input and result elements, and setting this to false indicates your highlighting function implements its own fix. The default fix works by moving text content from elements to CSS `::before` pseudo-elements after highlighting.
   * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.Plugin`
   * @returns template object
   */
  constructor(highlight?: (codeElement: HTMLElement, codeInput: CodeInput) => void, preElementStyled?: boolean, isCode?: boolean, includeCodeInputInHighlightFunc?: true, autoDisableDuplicateSearching?: boolean, plugins?: Plugin[])
  highlight: Function
  preElementStyled: boolean
  isCode: boolean
  includeCodeInputInHighlightFunc: boolean
  autoDisableDuplicateSearching: boolean
  plugins: Plugin[]
  /**
   * @deprecated Please give a value for the `autoDisableDuplicateSearching` parameter.
   */
  constructor(highlight?: (code: HTMLElement) => void, preElementStyled?: boolean, isCode?: boolean, includeCodeInputInHighlightFunc?: false, plugins?: Plugin[])
  /**
   * @deprecated Please give a value for the `autoDisableDuplicateSearching` parameter.
   */
  constructor(highlight?: (code: HTMLElement, codeInput: CodeInput) => void, preElementStyled?: boolean, isCode?: boolean, includeCodeInputInHighlightFunc?: true, plugins?: Plugin[])
}

// ESM-SUPPORT-START-NAMESPACE-2 Do not (re)move this - it's needed for ESM generation
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
  // ESM-SUPPORT-START-TEMPLATE-prism Do not (re)move this - it's needed for ESM generation
  /**
   * A template that uses Prism.js syntax highlighting (https://prismjs.com/).
   */
  class Prism extends Template {
    /**
    * Constructor to create a template that uses Prism.js syntax highlighting (https://prismjs.com/)
    * @param {Object} prism Import Prism.js, then after that import pass the `Prism` object as this parameter.
    * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.plugins`
    * @returns template object
    */
    constructor(prism: Object, plugins?: Plugin[])
  }
  // ESM-SUPPORT-END-TEMPLATE-prism Do not (re)move this - it's needed for ESM generation
  /**
   * @deprecated Please use `new codeInput.templates.Prism(...)`
   */
  function prism(prism: Object, plugins?: Plugin[]): Template
  // ESM-SUPPORT-START-TEMPLATE-hljs Do not (re)move this - it's needed for ESM generation
  /**
   * A template that uses highlight.js syntax highlighting (https://highlightjs.org/).
   */
  class Hljs extends Template {
    /**
    * Constructor to create a template that uses highlight.js syntax highlighting (https://highlightjs.org/)
    * @param {Object} hljs Import highlight.js, then after that import pass the `hljs` object as this parameter.
    * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.plugins`
    * @returns template object
    */
    constructor(hljs: Object, plugins?: Plugin[])
  }
  // ESM-SUPPORT-END-TEMPLATE-hljs Do not (re)move this - it's needed for ESM generation
  /**
   * @deprecated Please use `new codeInput.templates.Hljs(...)`
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
   * @param {string} delimiter - The character used to split up parts of text where each part is a different color (e.g. "" = characters, " " = words)
   * @param {codeInput.Plugin[]} plugins - An array of plugin objects to add extra features - see `codeInput.plugins`
   * @returns template object
   */
  function rainbowText(rainbowColors?: string[], delimiter?: string, plugins?: Plugin[]): Template
}
// ESM-SUPPORT-END-NAMESPACE-2 Do not (re)move this - it's needed for ESM generation

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
