+++
title = 'How to use code-input and highlight.js with Vue'
+++

# How to use code-input and highlight.js with Vue

> Contributors: 2025 Paul Rosen

## 1. Create a Vue app

First, create a Vue project. (If you already have a Vue project then you can skip this step). On a command line, type this:
```bash
npm create vue@latest
```
At the time this tutorial was created, the output was the following, after I named the project `syntax-highlighter` and checked "typescript":
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
npm install
npm run dev
```

You should be able to open your browser to the path that it prints out and see a working Vue app. If so, congratulations! Hit Ctrl-C to stop it.

## 2. Add dependencies

> This tutorial will use `highlight.js` for the syntax highlighting. If you are using a different method then adjust as needed.

Type this:
```bash
npm install @webcoder49/code-input
npm install highlight.js
```

In the file `vite.config.ts`, change the line that contains `vue()` to this:
```javascript
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'code-input'
    }
  }
})
```

So that Vue knows that `code-input` is not a Vue component.

## 3. Initialize the textarea

Create a component with whatever name you want. Perhaps `RichEditor.vue`. Paste the following into it:
```html
<template>
  <code-input name="richText">function hello() { console.log("world"); }
  </code-input>
</template>

<script lang="ts" setup>
import {onMounted} from "vue";
// For loading the code-input web component
import codeInput from "@webcoder49/code-input";
import Template from "@webcoder49/code-input/templates/hljs.mjs";
// For loading a highlighting engine - this example uses highlight.js
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

onMounted(async () => {
  // Set up the highlighting engine first
  hljs.registerLanguage('javascript', javascript);
  // Register that engine with code-input
  codeInput.registerTemplate("syntax-highlighted", new Template(hljs, []));
})

</script>

<style>
/* These are necessary styles to make code-input work */
@import '@webcoder49/code-input/code-input.css';
/* This is one possibility of styles to use for highlighting */
@import 'highlight.js/styles/default.min.css';

code-input {
  resize: both; /* if you want the resizing control that textarea has */
  margin: 0; /* you can override other styles */
  font-family: Monaco, monospace;
}

.hljs {
  background: #f1f1f1; /* here's how to change the background color. */
}
</style>
```

## 4. Using the component

In the generated file `HelloWorld.vue`, place the following line after the "greetings" line:
```html
<RichEditor />
```

And put its import in the `<script>` section:
```html
import RichEditor from "@/components/RichEditor.vue";
```

Restart the server:
```bash
npm run dev
```

If all went well, you should see the following in the browser:

![An editable syntax-highlighted textarea added to the Vue starter page.](vue-demo-screenshot.png)
