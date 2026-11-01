# Reporting Security Vulnerabilities

If you find a sensitive security vulnerability in the code-input.js library, please email the maintainer Oliver Geer at [security@webcoder49.dev](mailto:security@webcoder49.dev), optionally using [this encryption key](https://ogeer.org#pgp). GitHub security advisories (different to the more general "issues") are also accepted.

## Threat Model

Except for the exception below, please report all security vulnerabilities in code-input.js and its code, that could arise in any plausible way of using the code-input.js library. This includes but is not limited to use with web frameworks, with Typescript, with and without ECMAScript Modules.

Security issues in the files under `tests/` (that is not run by end users), **if they would only arise by someone changing the test file's contents,** are not considered vulnerabilities.

Security issues under `docs/` and `tests/` directories, that could be construed as recommended usage of the code-input.js library, are considered vulnerabilities.
