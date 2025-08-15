+++
title = 'Styling `code-input` elements with CSS'
+++

# Styling `code-input` elements with CSS

> Contributors: 2025 Oliver Geer

`code-input` elements can be styled like `textarea` elements in most cases; however, there are some exceptions:
* The CSS variable `--padding` should be used rather than the property `padding` (e.g. `<code-input style="--padding: 10px;">...`), or `--padding-left`, `--padding-right`, `--padding-top` and `--padding-bottom` instead of the CSS properties of the same names. For technical reasons, the value must have a unit (i.e. `0px`, not `0`).
* Background colours set on `code-input` elements will not work with highlighters that set background colours themselves - use `(code-input's selector) pre[class*="language-"]` for Prism.js or `.hljs` for highlight.js to target the highlighted element with higher specificity than the highlighter's theme. You may also set the `background-color` of the code-input element for its appearance when its template is unregistered / there is no JavaScript.
* For now, elements on top of `code-input` elements should have a CSS `z-index` at least 3 greater than the `code-input` element.
