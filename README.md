# code-input

![Click to Switch](https://img.shields.io/static/v1?label=&message=Click%20to%20Switch:%20&color=grey&style=for-the-badge)[![GitHub](https://img.shields.io/static/v1?label=&message=GitHub&color=navy&style=for-the-badge&logo=github)](https://github.com/WebCoder49/code-input)[![NPM](https://img.shields.io/static/v1?label=&message=NPM&color=red&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@webcoder49/code-input)

[![View License](https://img.shields.io/github/license/webcoder49/code-input?style=for-the-badge)](LICENSE) [![View Releases](https://img.sHields.io/github/v/release/webcoder49/code-input?style=for-the-badge)](https://github.com/WebCoder49/code-input/releases) [![View the demo on CodePen](https://img.shields.io/static/v1?label=Demo&message=on%20CodePen&color=orange&logo=codepen&style=for-the-badge)](https://codepen.io/WebCoder49/details/jOypJOx)

> ___Fully customisable, editable syntax-highlighted textareas that can be placed in any HTML form.___ [[🚀 View the Demo](https://codepen.io/WebCoder49/details/jOypJOx)]

![Using code-input with many different themes](https://user-images.githubusercontent.com/69071853/133924472-05edde5c-23e7-4350-a41b-5a74d2dc1a9a.gif)
*This demonstration uses themes from [Prism.js](https://prismjs.com/) and [highlight.js](https://highlightjs.org/), two syntax-highlighting programs which work well with and have compatibility built-in with code-input.*

*A frontend JavaScript library, with:*<br/>
[![TypeScript Bindings - Click to Use](https://img.shields.io/static/v1?label=TypeScript%20Bindings&message=Click%20to%20Use&style=for-the-badge&color=blue&logo=typescript&logoColor=white)](https://github.com/WebCoder49/code-input-for-typescript)

---

## What does it do?
**`code-input`** lets you **turn any ordinary JavaScript syntax-highlighting theme and program into customisable syntax-highlighted textareas** using an HTML custom element. It uses vanilla CSS to superimpose a `textarea` on a `pre code` block, then handles indentations, scrolling and fixes any resulting bugs with JavaScript. To see how it works in more detail, please see [this CSS-Tricks article](https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/ "Creating an Editable Textarea That Supports Syntax-Highlighted Code") I wrote.

## What are the advantages of using code-input, and what can it be used for?
Unlike other front-end code-editor projects, the simplicity of how `code-input` works means it is **highly customisable**. As it is not a full-featured editor, you can **choose what features you want it to include, and use your favourite syntax-highlighting algorithms and themes**.

The `<code-input>` element works like a `<textarea>` and therefore **works in HTML5 forms and supports using the `name`, `value` and `placeholder` attributes, events like `onchange`, form resets, to name a few...** [(Demo)](https://codepen.io/WebCoder49/details/JjmqjZv)

`code-input` has also accumulated many **features in optional [plugins](./plugins/README.md)** from open-source contributions, allowing you to choose any features you want. If a feature you want is not present, [please open an issue / contribute it!](#contributing)

## 🚀 Getting Started With `code-input` (in 4 simple steps)

## [`code-input` also supports TypeScript (click)](https://github.com/WebCoder49/code-input-for-typescript)

`code-input` is designed to be **both easy to use and customisable**. Here's how to use it to create syntax-highlighted textareas: 

### 1. Import `code-input`
- **First, import your favourite syntax-highlighter's JS and CSS theme files** to turn editable. 
- Then, import the CSS and JS files of `code-input` from a downloaded release or a CDN. The non-minified files are useful for using during development.

<details>
<summary>
Locally downloaded (Click)
</summary>

```html
<!--In the <head>-->
<script src="path/to/code-input.min.js"></script>
<link rel="stylesheet" href="path/to/code-input.min.css">
```
</details>
<details>
<summary>
From JSDelivr CDN (click)
</summary>

```html
<!--In the <head>-->
<script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.0/code-input.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.0/code-input.min.css">
```
</details>

### 2. Creating a template
The next step is to set up a `template` to link `code-input` to your syntax-highlighter. If you're using Prism.js or highlight.js, you can use the built-in template, or you can create your own otherwise. In these examples, I am registering the template as `"syntax-highlighted"`, but you can use any template name as long as you are consistent.

- *Highlight.js:*
  ```js
  codeInput.registerTemplate("syntax-highlighted", codeInput.templates.hljs(hljs, [] /* Array of plugins (see below) */));
  ```

- *Prism.js:*
  ```js
  codeInput.registerTemplate("syntax-highlighted", codeInput.templates.prism(Prism, [] /* Array of plugins (see below) */));
  ```

- *Custom:*
  ```js
  codeInput.registerTemplate("syntax-highlighted", new codeInput.Template(
    function(result_element) { /* Highlight function - with `pre code` code element */
      /* Highlight code in result_element - code is already escaped so it doesn't become HTML */
    },
    true, /* Optional - Is the `pre` element styled as well as the `code` element? Changing this to false uses the code element as the scrollable one rather than the pre element */
    true, /* Optional - This is used for editing code - setting this to true sets the `code` element's class to `language-<the code-input's lang attribute>` */
    false /* Optional - Setting this to true passes the `<code-input>` element as a second argument to the highlight function to be used for getting data- attribute values and using the DOM for the code-input */,
    [] // Array of plugins (see below)
  ));
  ```

### 3. Adding plugins
[Plugins](./plugins/) allow you to add extra features to a template, like [automatic indentation](plugins/indent.js) or [support for highlight.js's language autodetection](plugins/autodetect.js). To use them, just:
- Import the plugins' JS files after you have imported `code-input` and before registering the template.
- Place instances of the plugins in the array of plugins argument when registering, like this:
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

To see a full list of plugins and their functions, please see [plugins/README.md](./plugins/README.md).

### 4. Using the component
Now that you have registered a template, you can use the custom `<code-input>` element in HTML. If you have more than one template registered, you need to add the template name as the `template` attribute. With the element, using the `lang` attribute will add a `language-{value}` class to the `pre code` block. You can now use HTML attributes and events to make your element as simple or interactive as you like! 
  ```HTML
  <code-input lang="HTML"></code-input>
  ```
  *or*
  ```HTML
  <code-input lang="HTML" placeholder="Type code here" template="syntax-highlighted" onchange="console.log('Your code is', this.value)">&lt; href='https://github.com/WebCoder49/code-input'>code-input&lt;/a></code-input>
  ```

## Contributing
If you have any features you would like to add to `code-input`, or have found any bugs, please [open an issue](https://github.com/WebCoder49/code-input/issues) or [fork and submit a pull request](https://github.com/WebCoder49/code-input/fork)! All contributions to this open-source project would be greatly appreciated.


|[![Contributors](https://contrib.rocks/image?repo=WebCoder49%2Fcode-input)](https://github.com/WebCoder49/code-input/graphs/contributors)|
|---|
|...have contributed pull requests so far.|
|(source: [contrib.rocks](https://contrib.rocks))|
