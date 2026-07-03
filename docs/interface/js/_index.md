+++
title = '`code-input` vs the `textarea` in JavaScript'
+++

# `code-input` vs the `textarea` in JavaScript

> Contributors: 2025 Oliver Geer

[Once registered](#code-input_load), `code-input` elements support the JavaScript properties and events used with a `textarea` element, because they are built around them. Try swapping out your `textarea` element in your JavaScript application for a `code-input`! If it doesn't work, [submit a bug report](https://github.com/WebCoder49/code-input/issues).

If you want to replace a `textarea` with a `code-input` in an application that doesn't need JavaScript, [look here](../forms). We support HTML5 forms, and progressive enhancement so JavaScript isn't needed!

## The `code-input_load` event {#code-input_load}

Each `code-input` element fires a `code-input_load` event when it, its template and its plugins have been fully registered. You should carry out initialisation code for `code-input` elements in a handler for this event:
```javascript
// TODO: Get code-input element as codeInputElement
codeInputElement.addEventListener("code-input_load", () => {
    // TODO: Initialisation code
    // TODO: Add event handlers to the element here.
});
```

For backwards compatibility, you should also implement the subset of the functionality that doesn't require `code-input.js` on the `<textarea data-code-input-fallback>` element before load, if you have one. For backwards compatibility and technical reasons, event handlers registered in HTML attributes like `onchange` of the textarea will be passed to the code-input element when it is registered, but event listeners registered like that above will not - this should be cleaned up in major version 3.

## Caching in Single-Page Applications

Some JavaScript Single-Page App libraries, such as [Turbo](https://turbo.hotwired.dev/), will try to cache the `code-input` element and render it again on the page in the same state as when it was cached. This can break functionality, but that is easy to fix.

Run this code ***just before*** any `code-input` elements are ***cached*** (in Turbo, on the `turbo:before-cache` event):

```javascript
document.querySelectorAll("code-input textarea").forEach((el) => el.setAttribute("data-code-input-fallback", true));
```
