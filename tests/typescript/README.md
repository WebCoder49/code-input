# Typescript Type Declaration Testing

To check for bugs in code-input.d.ts, and in ESM generation of d.ts files:

1. Generate ECMAScript modules in the esm/ directory, using esm/README.md.
2. Compile each TypeScript file, by changing to this directory and running `tsc example1.ts ; tsc example2.ts` in the terminal.
3. If any compilation bugs appear in the terminal, fix them.
4. If nothing appears in the terminal, this test passed.
