# (Semi-)Automated Tests

Carries out partially automated user interface tests to check that both the core components and the plugins work in some ways. It doesn't fully cover every scenario so you should test any code you change by hand, but it's good for quickly checking a wide range of functionality works.

For each of `prism.html` and `hljs.html`, open the page, answer the browser popups you get, and see the results of testing at the end.

The code currently relies on hardcoded wait periods, assuming the interface will respond in time, and meaning that if they don't, tests can fail. If tests fail unexpectedly, free up memory etc. on your computer, reload, and try again.
