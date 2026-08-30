# Typescript Type Declaration Testing

To check for bugs in code-input.d.ts, and in ESM generation of d.ts files:

1. Generate ECMAScript modules in the esm/ directory, using esm/README.md
2. Compile this TypeScript file, by changing to its directory and running `tsc example.ts --lib dom,es6`
3. Fix any compilation bugs that occur
