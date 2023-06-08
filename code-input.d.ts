export as namespace codeInput; // TODO: Complete + Test + Add to repo+npm

export class Plugin {}

// Templates
export class Template {}
export namespace templates { 
  function custom(highlight: (code: HTMLElement) => void, preElementStyled: boolean, isCode: boolean, includeCodeInputInHighlightFunc: false, plugins: Plugin[]): Template
  function prism(prism: Object, plugins: Plugin[]): Template
  function hljs(hljs: Object, plugins: Plugin[]): Template
  function characterLimit(plugins: Plugin[]): Template
  function rainbowText(rainbowColors: string[], delimiter: string, plugins: Plugin[]): Template
}

// Main
export class CodeInput {}
export function registerTemplate(name: "syntax-highlighted", template: Template): void;