+++
title = 'Styling `code-input` elements with CSS'
+++

# Styling `code-input` elements with CSS

> Contributors: 2025 Oliver Geer

`code-input` elements can be styled like `textarea` elements in most cases; however, there are some exceptions:
* The CSS variable `--padding` should be used rather than the property `padding` (e.g. `<code-input style="--padding: 10px;">...`)
* Background colours set on `code-input` elements will not work with highlighters that set background colours themselves - use `(code-input's selector) pre[class*="language-"]` for Prism.js, `(code-input's selector) TODO` for highlight.js to target the highlighted element with higher specificity than the highlighter's theme.
