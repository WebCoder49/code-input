# Code-input: Plugins
## List Of Plugins

💡 Do you just want to get a quick editor working? We suggest the [Indent](#indent) and [Prism Line Numbers](#prism-line-numbers) plugins.

**Lots of plugins are very customisable - please see the JavaScript files for parameters and if you want more features let us know via GitHub Issues.**

---

### Auto-Close Brackets
Automatically close pairs of brackets/quotes/other syntaxes in code, but also optionally choose the brackets this
is activated for.

Files: [auto-close-brackets.js](./auto-close-brackets.js)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/qBgGGKR)

### Autocomplete
Display a popup under the caret using the text in the code-input element. This works well with autocomplete suggestions.

Files: [autocomplete.js](./autocomplete.js) / [autocomplete.css](./autocomplete.css)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/xxapjXB)

### Autodetect
Autodetect the language live and change the `lang` attribute using the syntax highlighter's autodetect capabilities. Works with highlight.js.

Files: [autodetect.js](./autodetect.js)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/eYLyMae)

### Find and Replace
Add Find-and-Replace (Ctrl+F for find, Ctrl+H for replace by default, or when JavaScript triggers it) functionality to the code editor.

Files: [find-and-replace.js](./find-and-replace.js) / [find-and-replace.css](./find-and-replace.css)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/oNVVBBz)

### Go To Line
Add a feature to go to a specific line when a line number is given (or column as well, in the format line no:column no) that appears when (optionally) Ctrl+G is pressed or when JavaScript triggers it.

Files: [go-to-line.js](./go-to-line.js) / [go-to-line.css](./go-to-line.css)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/YzBMOXP)

### Indent
Add indentation using the `Tab` key, and auto-indents after a newline, as well as making it possible to indent/unindent multiple lines using Tab/Shift+Tab. **Supports tab characters and custom numbers of spaces as indentation, as well as (optionally) brackets typed affecting indentation.**

Files: [indent.js](./indent.js)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/WNgdzar)

### Prism Line Numbers
Allow code-input elements to be used with the Prism.js line-numbers plugin, as long as the code-input element or a parent element of it has the CSS class `line-numbers`. [Prism.js Plugin Docs](https://prismjs.com/plugins/line-numbers/)

Files: [prism-line-numbers.css](./prism-line-numbers.css) (NO JS FILE)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/XWPVrWv)

### Special Chars
Render special characters and control characters as a symbol
with their hex code.

**Please note: This plugin is known to contain bugs, especially when used with highlight.js and/or other plugins. Please bear this in mind and look at the Issues if you want more details; fixes for the bugs are planned but not prioritised as much as those used in more common plugins or the core library.**

Files: [special-chars.js](./special-chars.js) / [special-chars.css](./special-chars.css)

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/jOeYJbm)

### Select Token Callbacks
Make tokens in the `<pre><code>` element that are included within the selected text of the `<code-input>` gain a CSS class while selected, or trigger JavaScript callbacks.

Files: select-token-callbacks.js

[🚀 *CodePen Demo*](https://codepen.io/WebCoder49/pen/WNVZXxM)

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
        new codeInput.plugins.Indent(true, 2) // 2 spaces indentation
      ]
    )
  );
</script>
```
