// To check for bugs in code-input.d.ts, and in ESM generation of d.ts files:
// 1. Generate ECMAScript modules in the esm/ directory, using esm/README.md
// 2. Compile this TypeScript file, by changing to its directory and running `tsc example.ts --lib dom,es6`
// 3. Fix any compilation bugs that occur


import { registerTemplate, CodeInput, Template, Plugin } from "../../esm/code-input.mjs";

// Check CodeInput extends HTMLElement; in real usage use document.createElement("code-input")
// rather than this constructor.
(new CodeInput()) as HTMLElement;

import HLJSTemplate from "../../esm/templates/hljs.mjs";
import PrismTemplate from "../../esm/templates/prism.mjs";

import AutoCloseBrackets from "../../esm/plugins/auto-close-brackets.mjs";
import Autocomplete from "../../esm/plugins/autocomplete.mjs";
import Autodetect from "../../esm/plugins/autodetect.mjs";
import FindAndReplace from "../../esm/plugins/find-and-replace.mjs";
import GoToLine from "../../esm/plugins/go-to-line.mjs";
import Indent from "../../esm/plugins/indent.mjs";
import SelectTokenCallbacks from "../../esm/plugins/select-token-callbacks.mjs";
import SpecialChars from "../../esm/plugins/special-chars.mjs";
import Test from "../../esm/plugins/test.mjs";

const stubHLJS = { highlightElement: function(codeElement) {} };
const stubPrism = { highlightElement: function(codeElement) {} };

const findAndReplaceTranslations = {
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
const goToLineTranslations = {
    closeDialog: "Cerrar el Diálogo y Regresar al Editor",
    input: "Línea:Columno o Línea luego Retorno",
    guidanceFormat: "Formato incorrecto. Ingresa un número de línea (por ej. 1) o un número de línea luego dos puntos luego un número de columno (por ej. 1:3).",
    guidanceLineRange: (current, max) => `Número de línea (actualmente ${current}) debería ser entre 1 y ${max}.`,
    guidanceColumnRange: (line, current, max) => `En la línea número ${line}, número de columno (actualmente ${current}) debería ser entre 1 y ${max}.`,
    guidanceValidLine: (line) => `Tecla Retorno para ir a línea número ${line}.`,
    guidanceValidColumn: (line, column) => `Tecla Retorno para ir a línea número ${line}, columno número ${column}.`,
};
const indentTranslations = {
    tabForIndentation: "Tabulador y Mayús-Tabulador actualmente para la indentación. Tecla Escape para activar la navegación por el teclado.",
    tabForNavigation: "Tabulador y Mayús-Tabulador actualmente para la navegación por el teclado. Tecla para activar la indentación.",
};

const tokenSelectorCallbacks1 = new SelectTokenCallbacks.TokenSelectorCallbacks(
    function(token: HTMLElement) {
        // Stub
    },
    function(tokenContainer: HTMLElement) {
        // Stub
    }
);
const tokenSelectorCallbacks2 = SelectTokenCallbacks.TokenSelectorCallbacks.createClassSynchronisation("selected");

const plugins1: Array<Plugin> = [
    new AutoCloseBrackets({"(": ")"}),
    new Autocomplete(function(popupElem: HTMLElement, textareaElem: HTMLTextAreaElement, selectionEnd: number, selectionStart: number) {
        popupElem.textContent = textareaElem.value.substring(selectionStart, selectionEnd);
    }),
    new Autodetect(),
    new FindAndReplace(false, false, findAndReplaceTranslations),
    new GoToLine(false, goToLineTranslations),
    new Indent(true, 4, {"(": ")"}, true, indentTranslations),
    new SelectTokenCallbacks(tokenSelectorCallbacks1, true, true, true, false, true, false),
    new SpecialChars(true, false, /(?!\n)(?!\t)[\u{0000}-\u{001F}]|[\u{007F}-\u{009F}]|[\u{0200}-\u{FFFF}]/ug),
    new Test()
];

const plugins2: Array<Plugin> = [
    new AutoCloseBrackets(),
    new Autocomplete(function(popupElem: HTMLElement, textareaElem: HTMLTextAreaElement, selectionEnd: number) {
        popupElem.textContent = textareaElem.value.substring(0, selectionEnd);
    }),
    // No Autodetect, since passed to Prism.js
    new FindAndReplace(),
    new GoToLine(),
    new Indent(),
    new SelectTokenCallbacks(tokenSelectorCallbacks2),
    new SpecialChars(),
    new Test()
];

const hljsTemplate: Template = new HLJSTemplate(stubHLJS, plugins1);
const prismTemplate: Template = new PrismTemplate(stubPrism, plugins2);

registerTemplate("hljs", hljsTemplate);
registerTemplate("prism", prismTemplate);
