+++
title = 'Flexible Syntax Highlighted Editable Textareas'
+++

# An <mark>editable</mark> `<textarea>` that supports *any* <mark>syntax highlighting</mark> algorithm, for code or something else. [Also, added plugins.](#TODO)

Aiming to be [more <mark>flexible</mark>, <mark>lightweight</mark>,
<mark>modular</mark>, <mark>progressively enhanced</mark> and
<mark>standards-based</mark></a> than the alternatives](#features), we support
HTML forms, the `<textarea>` JavaScript interface, more languages and
more use cases.

## Get Started with a Demo

{{< playground >}}

### Demos

#### Basic Prism.js Code Editor {#demo-preset-basic}

```
<!DOCTYPE html>
<html>
    <head>
        <title>code-input: Basic Prism.js Code Editor</title>
        <!--For convenience, this demo uses files from JSDelivr CDN; for more privacy and security download and host them yourself.-->

        <!--1. Import highlighter-->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.30/themes/prism.min.css">
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.30/components/prism-core.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.30/plugins/autoloader/prism-autoloader.min.js"></script>
        <!--2. Import code-input-js-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.6/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.6/code-input.min.css">
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.6/plugins/indent.min.js"></script>
        <!--3. Join code-input-js to highlighter-->
        <script>codeInput.registerTemplate("syntax-highlighted", new codeInput.templates.Prism(Prism, [new codeInput.plugins.Indent()]));</script>
    </head>
    <body>
        <!--4. Use the code-input element-->
        <code-input language="JavaScript"><textarea code-input-fallback>// Demo editable code
console.log("Hello, World!");</textarea></code-input>
        <!--See details in the Tutorials by Example-->
    </body>
</html>
```

### Tutorials by Example

#### Prism.js Code Editor (use **with vanilla HTML here** or [with ECMAScript Modules/Vue/Nuxt](#TODO)) {#demo-preset-prism}

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
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.30/components/prism-core.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.30/plugins/autoloader/prism-autoloader.min.js"></script>

        <!--Import code-input-->
        <!--The same goes for downloaded versions.-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.6/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.6/code-input.min.css">

        <!--Import some code-input plugins-->
        <!--The same goes for downloaded versions.-->
        <!--Plugin files are here: #TODO.-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.6/plugins/indent.min.js"></script>

        <!--Register code-input template-->
        <script>
            codeInput.registerTemplate("syntax-highlighted",
                new codeInput.templates.Prism(
                Prism,
                [
                    // You can add or remove plugins in this list from #TODO.
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
        <code-input template="syntax-highlighted" language="JavaScript"><textarea code-input-fallback>// Demo editable code
console.log("Hello, World!");</textarea></code-input>

        <!--Additional usage details are here: #TODO-->
        <!--A list of plugins are here, allowing a well-rounded code-editor to be created quickly from code-input, if you're into that: #TODO-->
    </body>
</html>
```

#### highlight.js Code Editor (use **with vanilla HTML here** or [with ECMAScript Modules/Vue/Nuxt](#TODO)) {#demo-preset-hljs}

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
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.6/code-input.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.6/code-input.min.css">

        <!--Import some code-input plugins-->
        <!--The same goes for downloaded versions.-->
        <!--Plugin files are here: #TODO.-->
        <script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.6/plugins/indent.min.js"></script>

        <!--Register code-input template-->
        <script>
            codeInput.registerTemplate("syntax-highlighted",
                new codeInput.templates.Hljs(
                    hljs,
                    [
                        // You can add or remove plugins in this list from #TODO.
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
        <code-input template="syntax-highlighted" language="JavaScript"><textarea code-input-fallback>// Demo editable code
console.log("Hello, World!");</textarea></code-input>

        <!--Additional usage details are here: #TODO-->
        <!--A list of plugins are here. We recommend the Autodetect plugin with highlight.js: #TODO-->
    </body>
</html>
```

#### Editor with Custom Highlighting Algorithm (use **with vanilla HTML here** or [with ECMAScript Modules/Vue/Nuxt](#TODO)) {#demo-preset-custom}

```
<!--custom: TODO-->
```

{{< /playground >}}

## Features

<dl>
<dt>

Choose Any Highlighter

</dt>
<dd>

Use the built in templates for [Prism.js](#demo-preset-prism) or [highlight.js](#demo-preset-hljs), or [pass in any function to highlight a normal HTML element](#demo-preset-custom), and `code-input.js` will do the editability for you. What will you create?

</dd>

<dt>

Extensible With Plugins

</dt>
<dd>

Want coding features like easy indentation and closing of brackets, tools like find and replace and go to line, or better integration like custom autocomplete popups and processing of selected highlighted tokens? [Try a selection of the easy-to-use plugins.](#TODO) Plugin not available? [Make one yourself as a JavaScript class!](#TODO)

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

Works on any modern browser independent of whether a framework is used, with the standardised web component API. Integrates well into modular setups and web frameworks with TypeScript definitions, an ECMAScript Module build and tutorials. Falls back to a `textarea` element when there is insufficient JavaScript support. The fallback even works on Lynx.

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

