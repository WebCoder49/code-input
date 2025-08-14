+++
title = 'How to use code-input and highlight.js with ECMAScript Modules (not framework-specific)'
+++

# How to use code-input and highlight.js with ECMAScript Modules (not framework-specific)

> Contributors: 2025 Oliver Geer

These instructions will work anywhere [ECMAScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) are supported. If you want a tutorial specific to a web framework, please [look here](..).

This is a client-side library so will not work in Node.js or similar environments. It is assumed that you have already researched and run an example frontend ECMAScript module (ESM) project using either a bundler like [esbuild](https://esbuild.github.io/) or [webpack](https://webpack.js.org), or newer browsers' direct ESM support (less browser compatibility but easier when debugging); setting them up is not described here. You can [learn about ESM from the very basics here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

## Building

The ECMAScript modules in version 2 of the code-input.js library need to be "built" from the source files, because the source files are not in the ESM format.

For builds from package managers like Yarn and NPM, the ESM files have already been built and are in the `esm` directory.

When the code is downloaded or cloned from `git` source, the ESM directory contains files to do the building but not the built modules yet; follow the instructions in `esm/README.md` to run the build.

## Usage

Here's how to use code-input and highlight.js with ECMAScript modules.

```javascript
// Access the registerTemplate function and CodeInput (extends HTMLElement),
// Template (custom highlighter) and Plugin (abstract class) classes inside the 
// imported codeInput object.
import codeInput from "@webcoder49/code-input/code-input.mjs";

// Alternatively, use:
// import { registerTemplate, CodeInput, Template, Plugin } from "@webcoder49/code-input/code-input.mjs"

// Templates must be imported separately to avoid redundant code being imported
// Use any name for the default import, not just "Template"
import Template from "@webcoder49/code-input/templates/hljs.mjs";

// Plugins must be imported separately to avoid redundant code being imported
// See them all at https://code-input-js.org/plugins
// Use any name for the default import, not just "Indent"
import Indent from "@webcoder49/code-input/plugins/indent.mjs";

// As per https://highlightjs.org/usage
// You can import and register (in onMounted below) whichever languages you will use,
// or if you will use many import all, following the instructions at https://highlightjs.org/#usage.
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
// Set up the highlighting engine first
hljs.registerLanguage('javascript', javascript);


// Register using the imported objects
codeInput.registerTemplate("code-editor", new Template(hljs, [new Indent()]));
```

Note the `.mjs` extensions on code-input.js import paths. They are needed, and also make the next part easier:

## Import Paths

The import paths above assume a package manager and `package.json` export paths are being used.

In some setups, this will not work. You have two options (replace `node_modules/@webcoder49/code-input` with the relative path to the library, if it is different):
* use relative paths instead: assuming you are importing from your project's root directory and have installed the libraries with a typical JS package manager, replace `"@webcoder49/code-input/path/to/file.mjs"` with `"./node_modules/@webcoder49/code-input/esm/path/to/file.mjs"` (note the `esm` directory). Also replace `"@webcoder49/code-input/path/to/file.mjs"` with `"./node_modules/@highlightjs/cdn-assets/es/path/to/file.mjs"` (note the `es` directory) *If you're not using an import map yet, I recommend this option because import maps are not supported on as many browsers.*
* If you're using an [import map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_modules_using_import_maps), add the following to it:
  ```json
  {
      "imports": {
          "@webcoder49/code-input": "./node_modules/@webcoder49/code-input/esm/",
      }
  }
  ```
