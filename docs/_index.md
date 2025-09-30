+++
title = 'Flexible Syntax Highlighted Editable Textareas'
+++

# An <mark>editable</mark> `<textarea>` that supports *any* <mark>syntax highlighting</mark> algorithm, for code or something else. [Also, added plugins.](plugins)

Aiming to be [more <mark>flexible</mark>, <mark>lightweight</mark>,
<mark>modular</mark>,
<mark>accessible</mark>, <mark>progressively enhanced</mark> and
<mark>standards-based</mark> than the alternatives](#features), we support
[HTML forms](interface/forms), the [`<textarea>` JavaScript interface](interface/js), more languages and
more use cases.

## Download

*code-input.js is free, libre, open source software under the MIT (AKA Expat) license.* **Download it [from the Git repository](https://github.com/WebCoder49/code-input/tree/v2.7.1), [in a ZIP archive](/release/code-input-js-v2.7.1.zip), [in a TAR.GZ archive](/release/code-input-js-v2.7.1.tar.gz), or from `@webcoder49/code-input` on the NPM registry ([Yarn](https://yarnpkg.com/package?name=@webcoder49/code-input), [NPM](https://npmjs.com/package/@webcoder49/code-input), etc.).**

[Want to contribute to the code? You're very welcome to! See here.](#contributing)

## Get Started with a Demo

{{< playground >}}

### Demos

#### Basic Prism.js Code Editor {#playground-preset-basic}

```
<!DOCTYPE html>
<html>
    <head>
        <title>code-input: Basic Prism.js Code Editor</title>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->

        <!--1. Import highlighter-->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.30/themes/prism.min.css">
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.30/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.30/plugins/autoloader/prism-autoloader.min.js"></script>
        <!--2. Import code-input-js-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/indent.min.js"></script>
        <!--3. Join code-input-js to highlighter-->
        <script>codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [new codeInput.plugins.Indent()]));</script>
    </head>
    <body>
        <!--4. Use the code-input element-->
        <code-input language="JavaScript"><textarea data-code-input-fallback>// Demo editable code
console.log("Hello, World!");</textarea></code-input>
        <!--See details in the Tutorials by Example-->
    </body>
</html>
```

### Tutorials by Example

#### Prism.js Code Editor (use **with vanilla HTML here** or [with ECMAScript Modules/Vue/Nuxt](modules-and-frameworks/prism)) {#playground-preset-prism}

```
<!DOCTYPE html>
<html>
    <head>
        <title>code-input: Prism.js Code Editor</title>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->

        <!--Import Prism.js-->
        <!--For a downloaded version of Prism.js: -->
        <!--  1. Download Prism.js with the languages you need here: https://prismjs.com/download.html-->
        <!--  2. Replace the JavaScript imports below with one import of prism.js (prism-core.js and prism-autoloader.js are designed for online CDNs like the one currently being used).-->
        <!--  3. Ensure the file paths of imported CSS and JavaScript files are relative from this HTML file.-->
        <!--Guide: https://prismjs.com/#basic-usage-->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.30/themes/prism.min.css">
        <!--You can also choose custom themes by changing "prism" above to something like "prism-dark" from https://prismjs.com/index.html-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.30/components/prism-core.min.js" data-manual></script><!--Remove data-manual if also using Prism normally-->
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.30/plugins/autoloader/prism-autoloader.min.js"></script>

        <!--Import code-input-->
        <!--The same goes for downloaded versions.-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import some code-input plugins-->
        <!--The same goes for downloaded versions.-->
        <!--Plugin files are here: https://code-input-js.org/plugins.-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/indent.min.js"></script>

        <!--Register code-input template-->
        <!--This can be before the code-input element is created, in which case it will defer the registration of all code-input
        elements until the page is loaded, or after it is created, in which case registration will occur immediately, but not inside
        code-input elements.-->
        <script>
            codeInput.registerTemplate("syntax-highlighted",
                new codeInput.templates.Prism(
                Prism,
                [
                    // You can add or remove plugins in this list from https://code-input-js.org/plugins.
                    // All plugins used must be imported above.
                    new codeInput.plugins.Indent()
                ]
                )
            );
            // Register templates with different names here, if needed.
        </script>
    </head>
    <body>
        <!--The language attribute is case-insensitive but must refer to a language from https://prismjs.com/index.html#supported-languages.-->
        <code-input template="syntax-highlighted" language="JavaScript"><textarea data-code-input-fallback>// Demo editable code
console.log("Hello, World!");</textarea></code-input>

        <!--Additional usage details are here: https://code-input-js.org/#pages-->
        <!--A list of plugins are here, allowing a well-rounded code-editor to be created quickly from code-input, if you're into that: https://code-input-js.org/plugins-->
    </body>
</html>
```

#### highlight.js Code Editor (use **with vanilla HTML here** or [with ECMAScript Modules/Vue/Nuxt](modules-and-frameworks/hljs)) {#playground-preset-hljs}

```
<!DOCTYPE html>
<html>
    <head>
        <title>code-input: highlight.js Code Editor</title>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->

        <!--Import highlight.js-->
        <!--For a downloaded version of highlight.js, replace the file paths for both CSS and JS below with the relative file paths from this HTML file.-->
        <!--This is similar to the "self hosted" example below.-->
        <!--Guide: https://highlightjs.org/#usage#:~:text=As%20HTML%20Tags-->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11/build/styles/default.min.css">
        <!--You can also choose custom themes by changing "default" above to the theme name from https://highlightjs.org/demo-->
        <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11/build/highlight.min.js"></script>

        <!--Import highlight.js languages-->
        <!--You can copy this line to import additional languages, replacing "javascript" with a language name from https://highlightjs.org/demo.-->
        <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11/build/languages/javascript.min.js"></script>

        <!--Import code-input-->
        <!--The same goes for downloaded versions.-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import some code-input plugins-->
        <!--The same goes for downloaded versions.-->
        <!--Plugin files are here: https://code-input-js.org/plugins.-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/indent.min.js"></script>

        <!--Register code-input template-->
        <!--This can be before the code-input element is created, in which case it will defer the registration of all code-input
        elements until the page is loaded, or after it is created, in which case registration will occur immediately, but not inside
        code-input elements.-->
        <script>
            codeInput.registerTemplate("syntax-highlighted",
                new codeInput.templates.Hljs(
                    hljs,
                    [
                        // You can add or remove plugins in this list from https://code-input-js.org/plugins.
                        // All plugins used must be imported above.
                        new codeInput.plugins.Indent()
                    ]
                )
            );
            // Register templates with different names here, if needed.
        </script>
    </head>
    <body>
        <!--The language attribute is case-insensitive but must refer to a language imported above.-->
        <code-input template="syntax-highlighted" language="JavaScript"><textarea data-code-input-fallback>// Demo editable code
console.log("Hello, World!");</textarea></code-input>

        <!--Additional usage details are here: https://code-input-js.org/#pages-->
        <!--A list of plugins are here. We recommend the Autodetect plugin with highlight.js: https://code-input-js.org/plugins-->
    </body>
</html>
```

#### Editor with Custom Highlighting Algorithm (use **with vanilla HTML here** or [with ECMAScript Modules/Vue/Nuxt](modules-and-frameworks/custom)) {#playground-preset-custom}

```
<!DOCTYPE html>
<html>
    <head>
        <title>code-input: Editor with Custom Highlighting Algorithm</title>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->

        <!--Import code-input-->
        <!--The same goes for downloaded versions.-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/code-input.min.css">

        <!--Import some code-input plugins-->
        <!--The same goes for downloaded versions.-->
        <!--Plugin files are here: https://code-input-js.org/plugins.-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.7/plugins/indent.min.js"></script>

        <!--Register code-input template-->
        <!--This can be before the code-input element is created, in which case it will defer the registration of all code-input
        elements until the page is loaded, or after it is created, in which case registration will occur immediately, but not inside
        code-input elements.-->
        <script>
            codeInput.registerTemplate("syntax-highlighted",
                new codeInput.Template(
                    function(result_element) { /* Highlight function - with `pre code` code element */
                        /* Highlight code in result_element - code is already escaped so it doesn't become HTML */
                        // TODO
                        // Example highlights question marks red
                        result_element.innerHTML = result_element.innerHTML.replace(/\?/g, "<strong style='color: red;'>?</strong>");
                    },

                    true, /* Optional - Is the `pre` element styled as well as the `code` element?
                           * Changing this to false uses the code element as the scrollable one rather
                           * than the pre element */
                           
                    true, /* Optional - This is used for editing code - setting this to true sets the `code`
                           * element's class to `language-<the code-input's lang attribute>` */

                    false /* Optional - Setting this to true passes the `<code-input>` element as a second
                           * argument to the highlight function to be used for getting data- attribute values
                           * and using the DOM for the code-input */,

                    [
                        // You can add or remove plugins in this list from https://code-input-js.org/plugins.
                        // All plugins used must be imported above.
                        new codeInput.plugins.Indent()
                    ]
                )
            );
            // Register templates with different names here, if needed.
        </script>
    </head>
    <body>
        <code-input template="syntax-highlighted"><textarea data-code-input-fallback>What will you create?
Code or something else?</textarea></code-input>

        <!--Additional usage details are here: https://code-input-js.org/#pages-->
        <!--A list of plugins are here: https://code-input-js.org/plugins-->
    </body>
</html>
```

{{< /playground >}}

Next, you can [style your `code-input`](interface/css) and use it in [JavaScript](interface/js) or [HTML5 Forms](interface/forms).

## Features

<dl>
<dt>

Choose Any Highlighter

</dt>
<dd>

Use the built in templates for [Prism.js](#playground-preset-prism) or [highlight.js](#playground-preset-hljs), or [pass in any function to highlight a normal HTML element](#playground-preset-custom), and `code-input.js` will do the editability for you. What will you create?

</dd>

<dt>

Extensible With Plugins

</dt>
<dd>

Want coding features like easy indentation and closing of brackets, tools like find and replace and go to line, or better integration like custom autocomplete popups and processing of selected highlighted tokens? [Try a selection of the easy-to-use plugins.](plugins) Plugin not available? [Make one yourself as a JavaScript class!](plugins/new)

</dd>

<dt>

HTML Form and JavaScript `textarea` Interface Support

</dt>
<dd>

A `code-input` element's just a textarea with fancy bits added - get good support with few overheads!

</dd>

<dt>

Lightweight

</dt>
<dd>

The use of modular plugins, and native features like the `textarea` wherever possible, makes code-input more lightweight than most web-based code editors while having many of their features, plus more customisability and form support. We have plans to make it even more so!

</dd>

<dt>

Widely Usable and Progressively Enhanced

</dt>
<dd>

Works on any modern browser independent of whether a framework is used, with the standardised web component API. Integrates well into modular setups and web frameworks with TypeScript definitions, an ECMAScript Module build and [tutorials](modules-and-frameworks). Falls back to a `textarea` element when there is insufficient JavaScript support. The fallback even works on Lynx.

</dd>
</dl>

## Alternatives

Here at `code-input.js`, we love getting the library to work in
different setups, or receiving bug reports; flexibility is in its
nature! Nevertheless, if `code-input.js` doesn\'t suit you on a more
fundamental level, and you want a fully-featured, packaged but likely
heavier code editing component, and don\'t need compatibility with
different highlighters, HTML forms or textarea APIs, we recommend
something like [CodeMirror](https://codemirror.net/),
[Ace](https://ace.c9.io/) or
[Monaco](https://microsoft.github.io/monaco-editor/).

## Read Enough?
**If you don't need web framework integration, get started with the commented tutorials by example on this page, for [Prism.js](#playground-preset-prism), [highlight.js](#playground-preset-hljs), or [another highlighter](#playground-preset-custom). If you're using ECMAScript modules or a web framework, start [here](modules-and-frameworks).**

## Contribute Bug Reports / Code / Docs {#contributing}

**An even more lightweight, flexible and clean major version 3 is being planned. Please come and participate with your feedback/ideas [on GitHub](https://github.com/WebCoder49/code-input/issues/190) or [via email to code-input-js+v3@webcoder49.dev](mailto:code-input-js+v3@webcoder49.dev)!**

🎉 code-input.js is collaboratively developed by many people, which is what keeps it going strong. Many have reported bugs and suggestions, and [10 people (see them on GitHub)](https://github.com/WebCoder49/code-input/graphs/contributors) have contributed code or documentation directly. If you have found a bug, would like to help with the code or documentation, or have additional suggestions, for plugins or core functionality, [please look at GitHub](https://github.com/WebCoder49/code-input/tree/main/CONTRIBUTING.md) or [get in touch via email so I can add it for you](mailto:code-input-js@webcoder49.dev). **Found a security vulnerability? [Please use this email address](mailto:security@webcoder49.dev), after reading ([this page with an encryption key](https://oliver.geer.im/#email)).**

*I'm looking into mirroring code-input.js onto Codeberg as well as GitHub for more flexibility and freedom - if you have ideas for this please get in touch!*
