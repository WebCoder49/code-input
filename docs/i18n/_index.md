+++
title = 'Internationalising code-input.js'
+++

# Internationalising code-input.js

> Contributors: 2025 Oliver Geer

## Languages

code-input.js defaults to using English text for its interface, but when you want it in a different language you can provide the translated text:

**The core of code-input.js** contains one message shown only when CSS is supported but JavaScript has not been used to register the element. Translate it by writing the following CSS rule, replacing the text with its localised version.

```css
code-input:not(.code-input_registered)::after {
  content: "No highlighting. JavaScript support is disabled or insufficient, or codeInput.registerTemplate has not been called."!important;
}
```

It is only present for debugging and explanatory purposes when highlighting cannot be seen, and should not contain important or specific information about the editor state; if you need such information, especially for screen reader users, add separate text to your application which disappears after registering the code-input without errors.

**Plugins** sometimes come with user interface features (e.g. the find-and-replace dialog) which contain text to be translated. The text is provided as an extra argument to the plugin constructor containing translated strings or functions to produce them for each translation key, with the keys and their English values found in either the `code-input.d.ts` or the plugin's source code file. Here's an example:
```javascript
// CC-BY; Attribution: Translated by Oliver Geer with some help from English Wiktionary
let findAndReplaceTranslations = {
    start: "Buscar términos en su código.",
    none: "No hay sucesos",
    oneFound: "1 suceso encontrado.",
    matchIndex: (index, count) => `${index} de ${count} sucesos.`,
    error: (message) => `Error: ${message}`,
    infiniteLoopError: "Causa un ciclo infinito",
    closeDialog: "Cerrar el Diálogo y Regresar al Editor",
    findPlaceholder: "Buscar",
    findCaseSensitive: "Prestar atención a las minúsculas/mayúsculas",
    findRegExp: "Utilizar expresión regular de JavaScript",
    replaceTitle: "Reemplazar",
    replacePlaceholder: "Reemplazar con",
    findNext: "Buscar Suceso Próximo",
    findPrevious: "Buscar Suceso Previo",
    replaceActionShort: "Reemplazar",
    replaceAction: "Reemplazar este Suceso",
    replaceAllActionShort: "Reemplazar Todos",
    replaceAllAction: "Reemplazar Todos los Sucesos"
};
// ...
// passed when the plugin is constructed:
new codeInput.plugins.FindAndReplace(true, true, findAndReplaceTranslations),
```

## Other
* code-input.js has supported text bidirectionality using the HTML `dir` attribute since version 2.5.
