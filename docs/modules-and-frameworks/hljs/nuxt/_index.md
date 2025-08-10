+++
title = 'How to use code-input and highlight.js with Nuxt'
+++

# How to use code-input and highlight.js with Nuxt

> Contributors: 2025 Paul Rosen, 2025 Oliver Geer; **code samples licensed [MIT/Expat](https://spdx.org/licenses/MIT)**

[Vue](../vue) and Nuxt have some similarities, but there is one big difference in how they can use this library. In Nuxt there is server side rendering (SSR) that will attempt to create the final HTML before sending the page to the browser. This cannot use any browser-specific things so the `code-input` component must be excluded from rendering until hydration in the browser.
 
## 1. Create a Nuxt app

First, create a Nuxt project. (If you already have a Nuxt project then you can skip this step). On a command line, use your package manager to do so, for example by typing one of these:
```bash
yarn create nuxt syntax-highlighter
# OR
npm create nuxt@latest syntax-highlighter
```

At the time this tutorial was created, the output was the following:
```plaintext
Need to install the following packages:
create-nuxt@3.27.0
Ok to proceed? (y) y


> npx
> "create-nuxt" syntax-highlighter


        .d$b.
       i$$A$$L  .d$b
     .$$F` `$$L.$$A$$.
    j$$'    `4$$:` `$$.
   j$$'     .4$:    `$$.
  j$$`     .$$:      `4$L
 :$$:____.d$$:  _____.:$$:
 `4$$$$$$$$P` .i$$$$$$$$P`

ℹ Welcome to Nuxt!
ℹ Creating a new project in syntax-highlighter.

✔ Which package manager would you like to use?
npm
◐ Installing dependencies...

> postinstall
> nuxt prepare

✔ Types generated in .nuxt

added 882 packages, and audited 884 packages in 5m

185 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
✔ Installation completed.

✔ Initialize git repository?
No

✔ Would you like to install any of the official modules?
Yes

✔ Pick the modules to install:
none

✨ Nuxt project has been created with the v4 template. Next steps:
 › cd syntax-highlighter
 › Start development server with npm run dev

```

And just like the above instructions mention, do the following:
```bash
cd syntax-highlighter

yarn run dev
# OR
npm run dev
# or your package manager's equivalent command
```

You should be able to open your browser to the path that it prints out and see a working Nuxt app. If so, congratulations! Hit Ctrl-C in the command line to stop it.

## 2. Add dependencies

> This tutorial will use `highlight.js` for the syntax highlighting. If you are using a different method then adjust as needed.

Type these 2 commands:
```bash
yarn add @webcoder49/code-input
# OR
npm install @webcoder49/code-input
# or your package manager's equivalent command

yarn add highlight.js
# OR
npm install highlight.js
# or your package manager's equivalent command
```

In the file `nuxt.config.ts`, after the line `compatibilityDate`, add this so that Vue knows that `code-input` is not a Vue component:

```javascript
vue: {
  compilerOptions: {
    isCustomElement: (tag) => tag === "code-input",
  },
},
``` 

> You might want to replace the second file with your own theme, but you need the first file.

## 3. Initialize a code-input element

Create a component with whatever name you want. Perhaps `app/components/CodeEditor.vue`. Read the following code then paste it into the file:

```html
<template>
  <!--Attributes that make sense on a
  textarea element are both on the code-
  input element for when full
  functionality is present, and on the
  fallback textarea for when it's not
  (e.g. bug or outdated browser).-->
  <code-input
    ref="elem"
    template="code-editor"
    :name="name"
    :value="value"
    :language="language"
    @input="value = elem.value; emit('input', elem.value)"
    @code-input_load="loaded"
  >
    <textarea
      ref="fallback"
      :name="name"
      :value="value"
      @input="value = fallback.value; emit('input', fallback.value)"
      data-code-input-fallback
    ></textarea>
  </code-input>
</template>

<script lang="ts" setup>
// For loading a highlighting engine - this example uses highlight.js
import hljs from 'highlight.js/lib/core';
// You can import and register (in onBeforeMount below) whichever languages you will use,
// or if you will use many import all, following the instructions at https://highlightjs.org/#usage.
import javascript from 'highlight.js/lib/languages/javascript';

// The following are optional.
const emit = defineEmits<{
  // If you want a listener when the user changes the contents.
  (e: "input", value: string): void;
  // If you want to do more initialization after code-input is ready.
  (e: "ready", element: HTMLElement): void;
}>();

const props = defineProps<{
  value: string; // The starting value for the code-input element
  name: string; // The name that is used when the code-input element is in a form
  language: string; // The programming language name given to highlight.js, which must also be imported above and registered below with highlight.js.
}>();

// This contains the HTMLElement of the code-input component
const elem = ref()

// Before it appears on the page, code-input needs to be initialized.
// This must be onBeforeMount and not onMount!
onBeforeMount(async () => {
  // Only if we're in the client
  // so that no server-side rendering is done on the code-input component
  if (import.meta.browser) {
    // Dynamically import code-input so that it is only in the browser
    const codeInput = await import("@webcoder49/code-input");
    const Template = (await import("@webcoder49/code-input/templates/hljs.mjs")).default;
    // Set up highlight.js
    hljs.registerLanguage('javascript', javascript);
    // Register that engine with code-input
    // You can also add plugins as shown below, and at https://code-input-js.org/plugins
    const Indent = (await import("@webcoder49/code-input/plugins/indent.mjs")).default;
    codeInput.registerTemplate("code-editor", new Template(hljs, [new Indent()]));
  }
})

function loaded() {
  // This is called after the code-input is initialized.
  // If you have some further initialization for the code-input element, then do it in this event.
  emit("ready", elem)
}
</script>

<style scoped>
.rich-editor {
  border: 1px solid #bbbbbb;
}
code-input {
  resize: both; /* if you want the resizing control that textarea has */
  margin: 0; /* you can override other styles */
  font-family: monospace;
  
  background: #f1f1f1; /* As explained below, this is required to set the colour of the code-input element if it
                          falls back to having no highlighting, and while it loads. */
}
</style>

<style>
/* These are necessary styles to make code-input work */
@import '@webcoder49/code-input/code-input.css';
/* This is one possibility of styles to use for highlighting */
@import 'highlight.js/styles/default.min.css';

/* Notice that these styles aren't scoped */
.hljs {
  background: #f1f1f1;  /* This is a style specific to highlighted code, so needs to use highlight.js' selector.
                           A side effect of this is that it will not affect unregistered/unloaded code-input elements. */
}
/* If you want to change the color of selected text during editing */
code-input textarea::selection {
  background: #6781ef;
  color: #ffffff;
}
</style>
```
## 4. Using the component

In the generated file `app.vue`, place the following line after the "NuxtRouteAnnouncer" line:
```html
<CodeEditor value="function hello() { console.log('world'); }" name="myEditor" />
```

Nuxt will have already imported it by default, so you don't need to import the component in JavaScript.

Restart the server:
```bash
yarn run dev
# OR
npm run dev
# or your package manager's equivalent command
```

If all went well, you should see the following in the browser:

![An editable syntax-highlighted textarea added to the Nuxt starter page.](nuxt-demo-screenshot.png)

## Please Note
* Hot module replacement (the updating of a running app when files are changed) will not work completely correctly when the `CodeEditor` component is changed but will work when files that use it are changed. This is only important when running a development server.
