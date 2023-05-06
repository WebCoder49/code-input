# Code-input: Plugins
## List Of Plugins

### Autocomplete
Display a popup under the caret using the text in the code-input element. This works well with autocomplete suggestions.

Files: [autocomplete.js](./autocomplete.js) / [autocomplete.css](./autocomplete.css)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/xxapjXB)

### Autodetect
Autodetect the language live and change the `lang` attribute using the syntax highlighter's autodetect capabilities. Works with highlight.js.

Files: [autodetect.js](./autodetect.js)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/eYLyMae)

### Debounce Update
Debounce the update and highlighting function ([What is Debouncing?](https://medium.com/@jamischarles/what-is-debouncing-2505c0648ff1))

Files: [debounce-update.js](./debounce-update.js)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/GRXyxzV)

### Indent
Adds indentation using the `Tab` key, and auto-indents after a newline, as well as making it possible to indent/unindent multiple lines using Tab/Shift+Tab

Files: [indent.js](./indent.js)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/WNgdzar)

### Prism Line Numbers
Allows code-input elements to be used with the Prism.js line-numbers plugin, as long as the code-input element or a parent element of it has the CSS class `line-numbers`. [Prism.js Plugin Docs](https://prismjs.com/plugins/line-numbers/)

Files: [prism-line-numbers.css](./prism-line-numbers.css) (NO JS FILE)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/XWPVrWv)

### Special Chars
Render special characters and control characters as a symbol
with their hex code.

Files: [special-chars.js](./special-chars.js) / [special-chars.css](./special-chars.css)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/jOeYJbm)

## Using Plugins
Plugins allow you to add extra features to a template, like [automatic indentation](./indent.js) or [support for highlight.js's language autodetection](./autodetect.js). To use them, just:
- Import the plugins' JS/CSS files (there may only be one of these; import all of the files that exist) after you have imported `code-input` and before registering the template.
- If a JavaScript file is present, Place an instance of each plugin in the array of plugins argument when registering, like this:
```html
<script src="code-input.js"></script>
<!--...-->
<script src="plugins/autodetect.js"></script>
<script src="plugins/indent.js"></script>
<!--...-->
<script>
  codeInput.registerTemplate("syntax-highlighted", 
    codeInput.templates.hljs(
      hljs, 
      [
        new codeInput.plugins.Autodetect(), 
        new codeInput.plugins.Indent()
      ]
    )
  );
</script>
```
