+++
title = 'Using code-input.js with highlight.js in projects which use modules or frameworks'
+++
# Using code-input.js with highlight.js in projects which use modules or frameworks

> Contributors: 2025 Oliver Geer

## Quickstart
* [Vue](vue)
* [Nuxt](nuxt)

## ESM: Technical Details
Since v2.6.0 `code-input.js` exposes ECMAScript modules in the `esm` directory, which allows importing the core functions from the module root or `code-input.mjs`, plugins from `plugins/name.mjs` as default exports and templates from `templates/name.mjs` as default exports. This allows easier integration with larger, more modular projects, including those that use front-end frameworks. See the `.d.mts` files in that directory for more details.
<!--TODO: Page on ESM API-->
