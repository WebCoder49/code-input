+++
title = 'How to use code-input and highlight.js with Vue'
+++

# How to use code-input and highlight.js with Vue

> Contributors: 2025 Paul Rosen, 2025 Oliver Geer; **code samples licensed [MIT/Expat](https://spdx.org/licenses/MIT)**

## 1. Create a Vue app

First, create a Vue project. (If you already have a Vue project then you can skip this step). On a command line, use your package manager to do so, for example by typing one of these:
```bash
yarn create vue
# OR
npm create vue@latest
```
At the time this tutorial was created, the output was the following, after I named the project `syntax-highlighter` and checked "typescript" (to give the most specific type of code possible in the tutorial; you can use JavaScript just by reading the comments and emitting types from the tutorial's samples):
```plaintext
Need to install the following packages:
create-vue@3.18.0
Ok to proceed? (y) y


> npx
> "create-vue"

┌  Vue.js - The Progressive JavaScript Framework
│
◇  Project name (target directory):
│  syntax-highlighter
│
◇  Select features to include in your project: (↑/↓ to navigate, space to select, a to toggle
all, enter to confirm)
│  TypeScript
│
◇  Select experimental features to include in your project: (↑/↓ to navigate, space to
select, a to toggle all, enter to confirm)
│  none
│
◇  Skip all example code and start with a blank Vue project?
│  No

Scaffolding project in /srv/app/projects/syntax-highlighter...
│
└  Done. Now run:

   cd syntax-highlighter
   npm install
   npm run dev

| Optional: Initialize Git in your project directory with:

   git init && git add -A && git commit -m "initial commit"
```

And just like the above instructions mention, do the following:
```bash
cd syntax-highlighter


yarn install
# OR
npm install
# or your package manager's equivalent command

yarn run dev
# OR
npm run dev
# or your package manager's equivalent command
```

You should be able to open your browser to the path that it prints out and see a working Vue app. If so, congratulations! Hit Ctrl-C in the command line to stop it.

## 2. Add dependencies

> This tutorial will use `highlight.js` for the syntax highlighting. If you are using a different method then adjust as needed.

Type this:
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

In the file `vite.config.ts`, change the line that contains `vue(),` to this:
```javascript
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'code-input'
    }
  }
}),
```

So that Vue knows that `code-input` is not a Vue component.

## 3. Initialize a code-input element

Create a component with whatever name you want. Perhaps `CodeEditor.vue`. Read the following code then paste it into the file:
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
import {onMounted, ref} from "vue";
// For loading the code-input web component
import codeInput from "@webcoder49/code-input";
import Template from "@webcoder49/code-input/templates/hljs.mjs";
// You can import plugins as shown below, and at https://code-input-js.org/plugins
import Indent from "@webcoder49/code-input/plugins/indent.mjs";

// You can import and register (in onMounted below) whichever languages you will use,
// or if you will use many import all, following the instructions at https://highlightjs.org/#usage.
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

// The following are optional.
const emit = defineEmits<{
  // If you want a listener when the user changes the contents.
  (e: "input", value: string): void;
  // If you want to do more initialization after code-input is ready.
  (e: "ready", element: HTMLElement): void;
}>();
// The JavaScript version of the TypeScript above would be const emit = defineEmits(["input", "ready"]);

const props = defineProps<{
  value: string; // The starting value for the code-input element
  name: string; // The name that is used when the code-input element is in a form
  language: string; // The programming language name given to highlight.js, which must also be imported above and registered below with highlight.js.
}>();
// The JavaScript version of the TypeScript above would be const props = defineProps({value: String, name: String});

// This contains the HTMLElement of the code-input component
const elem = ref();

onMounted(async () => {
  // Set up the highlighting engine first
  hljs.registerLanguage('javascript', javascript);
  // Register that engine with code-input
  codeInput.registerTemplate("code-editor", new Template(hljs, [new Indent()]));
});

function loaded() {
  // This is called after the code-input is initialized.
  // If you have some further initialization for the code-input element, then do it in this event.
  emit("ready", elem);
}

</script>

<style>
/* These are necessary styles to make code-input work */
@import '@webcoder49/code-input/code-input.css';
/* This is one possibility of styles to use for highlighting */
@import 'highlight.js/styles/default.min.css';

code-input {
  resize: both; /* if you want the resizing control that textarea has */
  margin: 0; /* you can override other styles */
  font-family: monospace;
  
  background: #f1f1f1; /* As explained below, this is required to set the colour of the code-input element if it
                        falls back to having no highlighting, and while it loads. */
}

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

In the generated file `HelloWorld.vue`, place the following line after the "greetings" line:
```html
<CodeEditor value="function hello() { console.log('world'); }" name="myEditor" />
```

And put its import in the `<script>` section:
```javascript
import CodeEditor from "@/components/CodeEditor.vue";
```

Restart the server:
```bash
yarn run dev
# OR
npm run dev
# or your package manager's equivalent command
```

If all went well, you should see the following in the browser:

![An editable syntax-highlighted textarea added to the Vue starter page.](vue-demo-screenshot.png)

## Please Note
* Hot module replacement (the updating of a running app when files are changed) will not work completely correctly when the `CodeEditor` component is changed but will work when files that use it are changed. This is only important when running a development server.
