# code-input
[![View License](https://img.shields.io/github/license/webcoder49/code-input?style=for-the-badge)](LICENSE) [![View Releases](https://img.shields.io/github/v/release/webcoder49/code-input?style=for-the-badge)](https://github.com/WebCoder49/code-input/releases)

> ___Fully customisable syntax-highlighted textareas.___

![Using code-input with many different themes](https://user-images.githubusercontent.com/69071853/133924472-05edde5c-23e7-4350-a41b-5a74d2dc1a9a.gif)
*This demonstration uses themes from [Prism.js](https://prismjs.com/) and [highlight.js](https://highlightjs.org/), two syntax-highlighting programs which work well with code-input.*

## What does it do?
**`code-input`** lets you **turn any ordinary JavaScript syntax-highlighting theme and program into customisable syntax-highlighted textareas** using an HTML custom element. It uses vanilla CSS to superimpose a `textarea` on a `pre code` block, then handles indentations, scrolling and fixes any resulting bugs with JavaScript. To see how it works in more detail, please see [this CSS-Tricks article](https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/ "Creating an Editable Textarea That Supports Syntax-Highlighted Code") I wrote.

## What are the advantages of using code-input, and what can it be used for?
Unlike other front-end code-editor projects, the simplicity of how `code-input` works means it is **highly customisable**. As it is not a full-featured editor, you can **choose what features you want it to include, and use your favourite syntax-highlighting algorithms and themes**.

The `<code-input>` element works like a `<textarea>` and therefore **works in HTML5 forms and supports using the `value` and `placeholder` attributes, as well as the `onchange` event.**
