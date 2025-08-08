+++
title = '`code-input` in HTML5 Forms'
+++

# `code-input` in HTML5 Forms

> Contributors: 2025 Oliver Geer

`code-input` elements support [HTML5 forms](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_forms#the_anatomy_of_a_form). Form-related HTML5 attributes and events on them will be passed to a `textarea` element inside them when they are registered, and whenever the attributes or events are later changed.

This is a good time to make use of the fallback textarea which is used when JavaScript is disabled; the following code will send data to the HTML5 form correctly whether or not JavaScript is enabled:
```html
<form>
    <code-input><textarea data-code-input-fallback name="code"></textarea></code-input>
    <input type="submit"/>
</form>
```
