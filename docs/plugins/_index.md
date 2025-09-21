+++
title = "Adding Extra Functionality With code-input.js' Plugins"
+++

# Adding Extra Functionality With `code-input.js`' Plugins

Right now, you can only add one plugin of each type (e.g. one SelectTokenCallbacks plugin) to a code-input template, and cannot remove or add plugins after registering the template. This is hoped to be fixed in major version 3 of code-input.js, but is not regularly needed and can usually be worked around. [If you need it, let us know!](https://github.com/WebCoder49/code-input/issues/118)

## Learn by Example
{{< playground >}}

### Plugins for Any Highlighter

#### `AutoCloseBrackets`: Add closing brackets automatically when opening ones are typed {#playground-preset-auto-close-brackets}

```
<!DOCTYPE html>
<html>
    <body>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->

        <!--Prism+code-input-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css"></link>
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/auto-close-brackets.min.js"></script>
        <!--Not necessary, but works very well with the Indent plugin-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/indent.min.js"></script>

        <script>
            codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [
                // Pass at register
                new codeInput.plugins.AutoCloseBrackets(
                    {"(": ")", "[": "]", "{": "}", '"': '"'} // Opening brackets mapped to closing brackets, default and example {"(": ")", "[": "]", "{": "}", '"': '"'}. All brackets must only be one character.
                ),
                // Not necessary, but works very well with the Indent plugin
                // when the third parameter are the brackets which enclose an
                // indented block.
                new codeInput.plugins.Indent(false, 4, {"(": ")", "[": "]", "{": "}"})
            ]));
        </script>
        <p>This uses both the auto-close brackets and indent plugins. Try typing some brackets / double quotes!</p>
        <code-input language="javascript"></code-input>
    </body>
</html>
```

#### `Autocomplete`: Display a customisable popup next to the caret that can appear and disappear {#playground-preset-autocomplete}

```
<!DOCTYPE html>
<html>
    <body>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->
        <!--Prism+code-input-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css"></link>
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/autocomplete.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/autocomplete.min.css">


        <script>
            // Create a function for autocompletion
            var tags = ["!DOCTYPE html", "html", "head", "body", "title", "style", "script", "link", "meta", "h1", "h2", "h3", "h4", "h5", "h6", "em", "strong", "span", "section", "aside", "article", "div", "nav", "main", "ul", "ol", "li", "code-input"];
            function updatePopup(popupElem, textarea, caretPos) {
                // Takes in
                //     popupElem: an element under the caret which can be filled
                //     with autocompletion suggestion elements
                //     textarea: the editing element inside the code-input element
                //     (get the code-input element using textarea.parentElement; passed
                //     in for backwards compatibility)
                //     caretPos: the character index of the caret (typing cursor) in the
                //     contents
                console.log(popupElem);
                let list_ends_on_start_tag = textarea.value.substring(0, caretPos).split("<");
                let start_tag = list_ends_on_start_tag[list_ends_on_start_tag.length-1];
                if(start_tag[0] == "/") start_tag = start_tag.substr(1);
                if(start_tag == "" || start_tag.includes(" ") || start_tag.includes(">")) {
                    popupElem.innerHTML = "";
                    return;
                }
                popupElem.innerText = "";
                tags.forEach((tag) => {
                    if(tag.substring(0, start_tag.length) == start_tag) {
                        console.log(tag, tag.substring(0, start_tag.length));
                        let autocompleteButton = document.createElement("button");
                        autocompleteButton.innerHTML = "<i>" + tag.substring(0, start_tag.length) + "</i>" + tag.substring(start_tag.length, tag.length);
                        autocompleteButton.addEventListener("click", () => {
                            textarea.parentElement.focus();
                            document.execCommand("insertText", false, tag.substring(start_tag.length, tag.length));
                            popupElem.innerHTML = ""; // On popup
                        });
                        popupElem.appendChild(autocompleteButton);
                    }
                });

                if(popupElem.firstElementChild != null) {
                    popupElem.firstElementChild.innerHTML += "[Tab]";
                }
                textarea.addEventListener("keydown", (event) => {
                    if(event.key == "Tab" && popupElem.firstElementChild != null) {
                        popupElem.firstElementChild.click();
                        event.preventDefault();
                    }
                })
            }
            // Pass at register
            codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [
                new codeInput.plugins.Autocomplete(updatePopup) // See above
            ]));
            </script>
        <p>Start typing some HTML tags to see the autocomplete in action. You can click an autocomplete suggestion, or press the Tab key to select the first.</p>
        <code-input language="html"></code-input>
    </body>
</html>
```

#### `FindAndReplace`: Add an openable dialog to find and replace matches to a search term, including highlighting the matches {#playground-preset-find-and-replace}

```
<!DOCTYPE html>
<html>
    <body>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->
        <!--Prism+code-input-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css"></link>
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/find-and-replace.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/find-and-replace.min.css"/>

        <script>
            let findAndReplacePlugin = new codeInput.plugins.FindAndReplace(
                true, // Should Ctrl+F be overriden for find-and-replace find functionality? Either way, you can also trigger it yourself using (instance of this plugin)`.showPrompt(code-input element, false)`.
                true, // Should Ctrl+H be overriden for find-and-replace replace functionality? Either way, you can also trigger it yourself using (instance of this plugin)`.showPrompt(code-input element, true)`.
            );
            // Programatically opening the dialogs, to integrate with your user interface
            function find() {
                findAndReplacePlugin.showPrompt(document.querySelector("code-input"), false);
            }
            function replace() {
                findAndReplacePlugin.showPrompt(document.querySelector("code-input"), true);
            }
            codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [
                // Pass at register
                findAndReplacePlugin
            ]));
        </script>
        <p>When focused in the editor: Try Ctrl+F, or click <button onclick="find();">this</button> to find. Try Ctrl+H, or click <button onclick="replace();">this</button> to replace.</p>
        <code-input language="markdown"># Hickory dickory dock
Hickory dickory dock.
The mouse ran up the clock.
The clock struck one,
The mouse ran down,
Hickory dickory dock.</code-input>
    </body>
</html>
```

#### `GoToLine`: Add an openable dialog to go to a specific line and potentially column number {#playground-preset-go-to-line}

```
<!DOCTYPE html>
<html>
    <body>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->
        <!--Prism+code-input-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css"></link>
        <!--Not necessary, but works very well with the Prism line-numbers plugin-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.css">
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/go-to-line.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/go-to-line.min.css"/>
        <!--Not necessary, but works very well with the Prism line-numbers plugin-->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/prism-line-numbers.min.css"/>

        <script>
            let goToLinePlugin = new codeInput.plugins.GoToLine(
                true, // Should Ctrl+G be overriden for go-to-line functionality? Either way, you can trigger it yourself using (instance of this plugin)`.showPrompt(code-input element)`.
            );
            // Programatically opening the dialogs, to integrate with your user interface
            function goToLine() {
                goToLinePlugin.showPrompt(document.querySelector("code-input"));
            }
            codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [
                // Pass at register
                goToLinePlugin
            ]));
        </script>
        <p>Try Ctrl+G when focused in the editor, or click <button onclick="goToLine()">this button</button></p>
        <code-input class="line-numbers" language="markdown"># Hickory dickory dock
Hickory dickory dock.
The mouse ran up the clock.
The clock struck one,
The mouse ran down,
Hickory dickory dock.</code-input>
    </body>
</html>
```

#### `Indent`: Make the Tab key and newlines after brackets do what you expect {#playground-preset-indent}

```
<!DOCTYPE html>
<html>
    <body>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->
        <!--Prism+code-input-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css"></link>
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/indent.min.js"></script>
        
        <script>
            // Programatically opening the dialogs, to integrate with your user interface
            function goToLine() {
                goToLinePlugin.showPrompt(document.querySelector("code-input"));
            }
            codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [
                // Pass at register
                new codeInput.plugins.Indent(
                    true, // Should the Tab key enter spaces rather than tabs? Defaults to false.
                    4, // How many spaces is each tab character worth? Defaults to 4, and has no effect if the previous argument was true (in which case use CSS tab-width)
                    {"(": ")", "[": "]", "{": "}"}, // Opening brackets mapped to closing brackets, default and example {"(": ")", "[": "]", "{": "}"}. All brackets must only be one character, and this can be left as null to remove bracket-based indentation behaviour.
                    true, // Whether pressing the Escape key before (Shift+)Tab should make this keypress focus on a different element (Tab's default behaviour). You should always either enable this or use this plugin's disableTabIndentation and enableTabIndentation methods linked to other keyboard shortcuts, for accessibility.
                )
            ]));
        </script>
        <p>Try Tab or Shift+Tab when selecting or editing text.</p>
        <code-input class="line-numbers" language="json">{
    "hello": "world",
    1: 2,
    "foo": {
        "bar": "baz"
    }
}</code-input>
  </body>
</html>
```

#### `SelectTokenCallbacks`: Handle which highlighted tokens are selected in the `code-input` element, e.g. for visual effects {#playground-preset-select-token-callbacks}

```
<!DOCTYPE html>
<html>
    <head>
        <!--Prism+code-input-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css"></link>
        
        <script>
        // This code is here to show a very real-world use of 
        // SelectTokenCallbacks: transforming plugins from a highlighter
        // that act on hover and click events to ones for editable code
        // that act on text selection.
        
        /* Modified from Prism.js v1.29.0's match-braces plugin.
        to enable codeInput SelectTokenCallbacks compatibility. */

        /* Licensed MIT
        Copyright 2012 Lea Verou, 2025 Oliver Geer */
        
        // Additions on lines 6-10, and lines 84-98.

        // code-input modification: ADD
        // Callbacks
        let selectBrace;
        let deselectAllBraces;
        // END code-input modification
        (function () {

        if (typeof Prism === 'undefined' || typeof document === 'undefined') {
            return;
        }

        function mapClassName(name) {
            var customClass = Prism.plugins.customClass;
            if (customClass) {
                return customClass.apply(name, 'none');
            } else {
                return name;
            }
        }

        var PARTNER = {
            '(': ')',
            '[': ']',
            '{': '}',
        };

        // The names for brace types.
        // These names have two purposes: 1) they can be used for styling and 2) they are used to pair braces. Only braces
        // of the same type are paired.
        var NAMES = {
            '(': 'brace-round',
            '[': 'brace-square',
            '{': 'brace-curly',
        };

        // A map for brace aliases.
        // This is useful for when some braces have a prefix/suffix as part of the punctuation token.
        var BRACE_ALIAS_MAP = {
            '${': '{', // JS template punctuation (e.g. `foo ${bar + 1}`)
        };

        var LEVEL_WARP = 12;

        var pairIdCounter = 0;

        var BRACE_ID_PATTERN = /^(pair-\d+-)(close|open)$/;

        /**
        * Returns the brace partner given one brace of a brace pair.
        *
        * @param {HTMLElement} brace
        * @returns {HTMLElement}
        */
        function getPartnerBrace(brace) {
            var match = BRACE_ID_PATTERN.exec(brace.id);
            return document.querySelector('#' + match[1] + (match[2] == 'open' ? 'close' : 'open'));
        }

        /**
        * @this {HTMLElement}
        */
        function hoverBrace() {
            if (!Prism.util.isActive(this, 'brace-hover', true)) {
                return;
            }

            [this, getPartnerBrace(this)].forEach(function (e) {
                e.classList.add(mapClassName('brace-hover'));
            });
        }
        /**
        * @this {HTMLElement}
        */
        function leaveBrace() {
            [this, getPartnerBrace(this)].forEach(function (e) {
                e.classList.remove(mapClassName('brace-hover'));
            });
        }
        // code-input modification: ADD
        selectBrace = (token) => {
            console.log("sB", token, BRACE_ID_PATTERN, BRACE_ID_PATTERN.test(token.id));
            if(BRACE_ID_PATTERN.test(token.id)) { // Check it's a brace
                hoverBrace.apply(token); // Move the brace from a this to a parameter
            }
        };
        deselectAllBraces = (tokenContainer) => {
            console.log("dAB", tokenContainer);
            // Remove selected class
            let selectedClassTokens = tokenContainer.getElementsByClassName(mapClassName('brace-hover'));
            // Use it like a queue, because as elements have their class name removed they are live-removed from the collection.
            while(selectedClassTokens.length > 0) {
                selectedClassTokens[0].classList.remove(mapClassName('brace-hover'));
            }
        }; // Moves the brace from a this to a parameter
        // end code-input modification
        /**
        * @this {HTMLElement}
        */
        function clickBrace() {
            if (!Prism.util.isActive(this, 'brace-select', true)) {
                return;
            }

            [this, getPartnerBrace(this)].forEach(function (e) {
                e.classList.add(mapClassName('brace-selected'));
            });
        }

        Prism.hooks.add('complete', function (env) {

            /** @type {HTMLElement} */
            var code = env.element;
            var pre = code.parentElement;

            if (!pre || pre.tagName != 'PRE') {
                return;
            }

            // find the braces to match
            /** @type {string[]} */
            var toMatch = [];
            if (Prism.util.isActive(code, 'match-braces')) {
                toMatch.push('(', '[', '{');
            }

            if (toMatch.length == 0) {
                // nothing to match
                return;
            }

            if (!pre.__listenerAdded) {
                // code blocks might be highlighted more than once
                pre.addEventListener('mousedown', function removeBraceSelected() {
                    // the code element might have been replaced
                    var code = pre.querySelector('code');
                    var className = mapClassName('brace-selected');
                    Array.prototype.slice.call(code.querySelectorAll('.' + className)).forEach(function (e) {
                        e.classList.remove(className);
                    });
                });
                Object.defineProperty(pre, '__listenerAdded', { value: true });
            }

            /** @type {HTMLSpanElement[]} */
            var punctuation = Array.prototype.slice.call(
                code.querySelectorAll('span.' + mapClassName('token') + '.' + mapClassName('punctuation'))
            );

            /** @type {{ index: number, open: boolean, element: HTMLElement }[]} */
            var allBraces = [];

            toMatch.forEach(function (open) {
                var close = PARTNER[open];
                var name = mapClassName(NAMES[open]);

                /** @type {[number, number][]} */
                var pairs = [];
                /** @type {number[]} */
                var openStack = [];

                for (var i = 0; i < punctuation.length; i++) {
                    var element = punctuation[i];
                    if (element.childElementCount == 0) {
                        var text = element.textContent;
                        text = BRACE_ALIAS_MAP[text] || text;
                        if (text === open) {
                            allBraces.push({ index: i, open: true, element: element });
                            element.classList.add(name);
                            element.classList.add(mapClassName('brace-open'));
                            openStack.push(i);
                        } else if (text === close) {
                            allBraces.push({ index: i, open: false, element: element });
                            element.classList.add(name);
                            element.classList.add(mapClassName('brace-close'));
                            if (openStack.length) {
                                pairs.push([i, openStack.pop()]);
                            }
                        }
                    }
                }

                pairs.forEach(function (pair) {
                    var pairId = 'pair-' + (pairIdCounter++) + '-';

                    var opening = punctuation[pair[0]];
                    var closing = punctuation[pair[1]];

                    opening.id = pairId + 'open';
                    closing.id = pairId + 'close';

                    [opening, closing].forEach(function (e) {
                        e.addEventListener('mouseenter', hoverBrace);
                        e.addEventListener('mouseleave', leaveBrace);
                        e.addEventListener('click', clickBrace);
                    });
                });
            });

            var level = 0;
            allBraces.sort(function (a, b) { return a.index - b.index; });
            allBraces.forEach(function (brace) {
                if (brace.open) {
                    brace.element.classList.add(mapClassName('brace-level-' + (level % LEVEL_WARP + 1)));
                    level++;
                } else {
                    level = Math.max(0, level - 1);
                    brace.element.classList.add(mapClassName('brace-level-' + (level % LEVEL_WARP + 1)));
                }
            });
        });

        }());
        </script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/match-braces/prism-match-braces.min.css"/>
        
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/select-token-callbacks.min.js"></script>
    </head>
    <body>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->
        
        <script>
            codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [
                // Pass at register
                new codeInput.plugins.SelectTokenCallbacks(
                    // Set up the behaviour of tokens text-selected in the `<code-input>` element, and the exact definition of a token being text-selected.
                    
                    // All parameters are optional. If you provide no arguments to the constructor, this will dynamically apply the "code-input_select-token-callbacks_selected" class to selected tokens only, for you to style via CSS.
                    
                    new codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks(
                        // Pass any callbacks you want to customise the behaviour of selected tokens via JavaScript.
                        // (If the behaviour you want is just differently styling selected tokens _via CSS_, you should probably use the codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks.createClassSynchronisation(selectedClass) static method.) 
                        
                        selectBrace, // Runs multiple times when the text selection inside the code-input changes, each time inputting a single (part of the highlighted `<pre><code>`) token element that is selected in the new text selection.
                        deselectAllBraces // Each time the text selection inside the code-input changes, runs once before any tokenSelectedCallback calls, inputting the highlighted `<pre><code>`'s `<code>` element that contains all token elements.
                    ),
                    false, // If true, tokens will only be marked as selected when no text is selected but rather the caret is inside them (start of selection == end of selection). Default false.
                    true, // Whether the caret or text selection's end being just before the first character of a token means said token is selected. Default true.
                    true, // Whether the caret or text selection's start being just after the last character of a token means said token is selected. Default true.
                    false, // Whether temporary `<span>` elements should be created inside partially-selected tokens containing just the selected text and given the selected class. Default false.
                    true, // Whether tokens for which only some of their text is selected should be treated as selected. Default true.
                    true // Whether all parent tokens of selected tokens should be treated as selected. Default true.
                )
            ]));
        </script>
        <p>Try selecting some code with a bracket. This is just one demo use of this very flexible plugin, which lets you use more features from your highlighter (here, Prism.js' match-braces plugin)!</p>
        <code-input class="match-braces" language="javascript">function hello() {
    let data = {
        "array": [
            "world"
        ]
    };
    console.log(data["array"][0]);
}</code-input>
  </body>
</html>
```

#### `SpecialChars`: Display a selection of characters as a colourful representation of their character codes {#playground-preset-special-chars}

```
<!--
WARNING:

This plugin is currently unstable when used with other plugins,
Unicode characters, or highlight.js. I hope to fix much of this by
major version 3, and if you could help that would be amazing!

See https://github.com/WebCoder49/code-input/issues?q=is%3Aissue%20state%3Aopen%20specialchars
-->

<!DOCTYPE html>
<html>
    <body>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->
        <!--Prism+code-input-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css"></link>
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/special-chars.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/special-chars.min.css"></script>
        
        <script>
            codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [
                // Pass at register
                new codeInput.plugins.SpecialChars(
                    true, // Whether or not to give special characters custom background colors based on their hex code. Defaults to false.
                    true, // If true, forces the color of the hex code to inherit from syntax highlighting. If false, the base color of the `pre code` element is used to give contrast to the small characters. Defaults to false.
                    /(?!\n)(?!\t)[\u{0000}-\u{001F}]|[\u{007F}-\u{009F}]|[\u{0200}-\u{FFFF}]/ug // The regular expression which matches special characters. Defaults to many non-renderable ASCII characters (which characters are renderable depends on the browser and OS).
                )
            ]));
        </script>
        <code-input class="line-numbers" language="json"></code-input>
        <script>
        window.addEventListener("load", function() {
            document.querySelector("code-input").value += "[\n";
            for(let i = 0; i < 256; i++) {
                document.querySelector("code-input").value += `    ${String.fromCharCode(i)},\n`;
            }
            document.querySelector("code-input").value += "]\n";
        });
        </script>
  </body>
</html>
```



### Plugins for highlight.js Only

#### `Autodetect`: Auto-detect the programming language live {#playground-preset-autodetect}

```
<!DOCTYPE html>
<html>
    <body>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->
        <!--highlight.js+code-input-->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/default.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        
        <!--Import-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/autodetect.min.js"></script>

        <script>
            codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Hljs(hljs, [
                // Pass at register
                new codeInput.plugins.Autodetect()
            ]));
        </script>
        <p>Start typing code of any language. <strong>Detected language: <span id="language"></span></strong>. Inaccurate language detection should be reported to <a target="_blank" href="https://highlightjs.org">highlight.js</a>, not code-input-js.</p>
        <code-input oninput="document.getElementById('language').textContent = this.getAttribute('language');"></code-input>
        <p></p>
    </body>
</html>
```

### Plugins for Prism.js Only

#### `PrismLineNumbers`: Add visible line numbers from Prism.js' plugin of the same name {#playground-preset-prism-line-numbers}

```
<!DOCTYPE html>
<html>
    <body>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->
        <!--Prism+code-input-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css"></link>
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        
        <!--Import-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/prism-line-numbers.min.css"/>

        <script>
            codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [
                // CSS only - don't pass here
            ]));
        </script>
        <p>The lines are numbered!</p>
        <code-input class="line-numbers" language="markdown"># Hickory dickory dock
Hickory dickory dock.
The mouse ran up the clock.
The clock struck one,
The mouse ran down,
Hickory dickory dock.</code-input>
    </body>
</html>
```

{{< /playground >}}

## Translating plugin text
As shown above, some plugins contain user interfaces containing English text. If you provide translated versions, you can swap them out for different languages following [these instructions](../i18n#languages).
