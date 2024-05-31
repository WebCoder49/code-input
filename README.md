# code-input 

![Click to Switch](https://img.shields.io/static/v1?label=&message=Click%20to%20Switch:%20&color=grey&style=for-the-badge)[![GitHub](https://img.shields.io/static/v1?label=&message=GitHub&color=navy&style=for-the-badge&logo=github)](https://github.com/WebCoder49/code-input)[![NPM](https://img.shields.io/static/v1?label=&message=NPM&color=red&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@webcoder49/code-input)[![Website & Demo](https://img.shields.io/static/v1?label=&message=Website+%26+Demo&color=purple&logoColor=white&style=for-the-badge&logo=html5)](https://webcoder49.dev/code-input)

[![View License](https://img.shields.io/github/license/webcoder49/code-input?style=for-the-badge)](LICENSE) [![View Releases](https://img.shields.io/github/v/release/webcoder49/code-input?style=for-the-badge)](https://github.com/WebCoder49/code-input/releases)

> ___Fully customisable, editable syntax-highlighted textareas that can be placed in any HTML form. For frontend JavaScript and TypeScript.___

<iframe title="Full Demo on Website" src="./demos/full" style="width: 100%; height: 500px;"></iframe>

[![Click to Get Started Quickly](https://img.shields.io/static/v1?label=&message=👇+Click+To+Get+Started+Quickly&color=orange&logoColor=white&style=for-the-badge&logo=markdown)](#-getting-started)

## What does it do?
**`code-input`** lets you **turn any ordinary JavaScript syntax-highlighting theme and program into customisable syntax-highlighted editable textareas** using an HTML custom element. It uses vanilla CSS to superimpose a `textarea` on a `pre code` block, then handles indentations, scrolling and fixes any resulting bugs with JavaScript. If you wish to see how the basic idea works, you can see [this CSS-Tricks article](https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/ "Creating an Editable Textarea That Supports Syntax-Highlighted Code") I wrote.

![Using code-input with many different themes](https://user-images.githubusercontent.com/69071853/133924472-05edde5c-23e7-4350-a41b-5a74d2dc1a9a.gif)
*This demonstration uses themes from [Prism.js](https://prismjs.com/) and [highlight.js](https://highlightjs.org/), two syntax-highlighting programs which work well with and have compatibility built-in with code-input.*

More recently, it has gained a **highly modular architecture** and **grown** due to open-source contributions, to have **many optional plugins**.

### How's it Unique?

These features make `code-input` unique compared to other JavaScript code-editing libraries. They also dictate the long-term development of the library. 

1. **📝 Just like a `<textarea>`:** The core `code-input` element acts *as much as possible* like a `textarea`, including HTML forms support, but supports syntax highlighting.
2. **🎨 Choose any highlighter:** This syntax highlighting can be implemented by *any available* library, such as Prism.js and highlight.js but including many more.
3. **🔌 Plug (your selected plugins) and play:** The core functionality and code of `code-input` are *as lean as possible* without compromising the first two aims, and extra features that might be wanted are available as plugins, including ones in this repository. The choice to select plugins and isolate them creates user freedom and helps developers / contributors.

### Contributing

As a user of this library, if you find a bug that breaks any of these aims, or a plugin you want is not present, [please see our `CONTRIBUTING.md` file](CONTRIBUTING.md). It will be greatly appreciated and help us keep this library thriving.

|[![Contributors](https://contrib.rocks/image?repo=WebCoder49%2Fcode-input)](https://github.com/WebCoder49/code-input/graphs/contributors)|
|---|
|...have contributed pull requests so far.|
|(source: [contrib.rocks](https://contrib.rocks))|

## 🚀 Getting Started

### Links to Demos / Alternative Starting Points
To see if `code-input` is right for you and try out its range of optional plugins, you can use the full demo below. The starter demos also show you their code so you can use them to help you get started. 
* [![Full Demo](https://img.shields.io/static/v1?label=&message=Full+Demo&color=blue&logoColor=white&style=default&logo=javascript)](https://webcoder49.dev/code-input/demos/full)
* [![Starter Demo & Code for Prism.js](https://img.shields.io/static/v1?label=&message=Starter+Demo+%26+Code+for+Prism.js&color=purple&logoColor=white&style=default&logo=javascript)](https://webcoder49.dev/code-input/demos/prism)
* [![Starter Demo & Code for highlight.js](https://img.shields.io/static/v1?label=&message=Starter+Demo+%26+Code+for+highlight.js&color=orange&logoColor=white&style=default&logo=javascript)](https://webcoder49.dev/code-input/demos/hljs)

### Written Guide

`code-input` is designed to be **both easy to use and customisable**.

> 📚 **If you're using TypeScript,** `code-input` and the steps below should work for both plain JavaScript and TypeScript once you link the library and its `.d.ts` bindings. [Here's an annotated example project.](https://github.com/WebCoder49/code-input-for-typescript)

#### 1. Import `code-input`
- **First, import your favourite syntax-highlighter's JS and CSS theme files** to turn editable. 
- Then, import the CSS and JS files of `code-input` from a downloaded release or a CDN. The non-minified files are useful for using during development.

> ⬇️ **For a downloaded release,** you should download all of the files in this repository from [the latest release]() and keep at least the license and the JavaScript and CSS files in the root folder and `plugins` folder. When you've imported all the plugins you need, you can (but don't have to) delete the rest. The `.github`, `demos` and `tests` folders are all for development so can be deleted.

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
<script src="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.3/code-input.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/WebCoder49/code-input@2.3/code-input.min.css">
```
</details>

#### 2. Creating a template
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

    true, /* Optional - Is the `pre` element styled as well as the `code` element?
           * Changing this to false uses the code element as the scrollable one rather
           * than the pre element */
          
    true, /* Optional - This is used for editing code - setting this to true sets the `code`
           * element's class to `language-<the code-input's lang attribute>` */

    false /* Optional - Setting this to true passes the `<code-input>` element as a second
           * argument to the highlight function to be used for getting data- attribute values
           * and using the DOM for the code-input */,

    [] // Array of plugins (see below)
  ));
  ```

#### 3. Adding plugins
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
        new codeInput.plugins.Indent(true, 2) // 2 spaces indentation
      ]
    )
  );
</script>
```

To see a full list of plugins and their functions, please see [plugins/README.md](./plugins/README.md).

#### 4. Using the component
Now that you have registered a template, you can use the custom `<code-input>` element in HTML. If you have more than one template registered, you need to add the template name as the `template` attribute. With the element, using the `language` attribute will add a `language-{value}` class to the `pre code` block. You can now use HTML attributes and events, as well as CSS styles, to make your element as simple or interactive as you like, as if it were a `textarea` element! 
  ```HTML
  <code-input language="HTML"></code-input>
  ```
  *or*
  ```HTML
  <code-input language="HTML" placeholder="Type code here" template="syntax-highlighted" onchange="console.log('Your code is', this.value)">&lt; href='https://github.com/WebCoder49/code-input'>code-input&lt;/a></code-input>
  ```

> ⚠️ At the moment, you need to set the `--padding` property rather than `padding` for a `code-input` element's CSS. All other properties should work as normal.

#### 5. (Optional) Contributing

We can help you, and you can help us, to meet your full potential with `code-input` and even create new plugins! Found a bug? Please let us know!

[See `CONTRIBUTING.md`.](CONTRIBUTING.md)