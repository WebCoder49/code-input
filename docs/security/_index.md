+++
title = 'Security'
+++

# Security

## Vulnerabilities disclosed 2026-11-17

Best mitigation: upgrade to code-input.js version 2.10.0 or later. (If you want to keep an older version of code-input.js, I have backported the fix: upgrade to another of the fixed versions listed in the advisories below.) Other mitigations, workarounds, and details are linked below.

1. Most likely to affect your code: [Setting .value on a code-input element writes this value as unescaped HTML in some conditions, allowing DOM XSS. Click for more details in the GitHub Advisory.](https://github.com/WebCoder49/code-input/security/advisories/GHSA-rv9c-r3v2-pwf3)
2. [code-input.js characterLimit template (deprecated in v2.9.0) writes data-overflow-msg as unescaped HTML, allowing DOM XSS. Click for more details in the GitHub Advisory.](https://github.com/WebCoder49/code-input/security/advisories/GHSA-hvf6-c8g4-g687)
3. [code-input.js rainbowText template (deprecated in v2.9.0) writes color names and delimiters as unescaped HTML, allowing DOM XSS. Click for more details in the GitHub Advisory.](https://github.com/WebCoder49/code-input/security/advisories/GHSA-2m96-6r3x-vvfr)

Reported by [uc.surf](https://uc.surf/) security research (GitHub: [ucsurf](https://github.com/ucsurf)).

## Reporting Security Vulnerabilities

If you find a sensitive security vulnerability in the code-input.js library, please email the maintainer Oliver Geer at [security@webcoder49.dev](mailto:security@webcoder49.dev), optionally using [this encryption key](https://ogeer.org#pgp). GitHub security advisories (different to the more general "issues") are also accepted.

### Threat Model

Except for the exception below, please report all security vulnerabilities in code-input.js and its code, that could arise in any plausible way of using the code-input.js library. This includes but is not limited to use with web frameworks, with Typescript, with and without ECMAScript Modules.

Security issues in the files under `tests/` (that is not run by end users), **if they would only arise by someone changing the test file's contents,** are not considered vulnerabilities.

Security issues under `docs/` and `tests/` directories, that could be construed as recommended usage of the code-input.js library, are considered vulnerabilities.
