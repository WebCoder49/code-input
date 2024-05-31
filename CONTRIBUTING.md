# Contributing to `code-input`

🎉**Here at `code-input`, contributions of all sizes are more than welcome. Below are some scenarios where you could contribute and how to do so.** Contributions are generally accepted when they help achieve at least one of our aims below, but others will be considered:

1. **📝 Just like a `<textarea>`:** The core `code-input` element acts *as much as possible* like a `textarea`, including HTML forms support, but supports syntax highlighting.
2. **🎨 Choose any highlighter:** This syntax highlighting can be implemented by *any available* library, such as Prism.js and highlight.js but including many more.
3. **🔌 Plug (your selected plugins) and play:** The core functionality and code of `code-input` are *as lean as possible* without compromising the first two aims, and extra features that might be wanted are available as plugins, including ones in this repository. The choice to select plugins and isolate them creates user freedom and helps developers / contributors.

We will generally *not* consider the contributions that place excess functionality in the `code-input.js` file rather than in a plugin. 

This said, if you're not sure whether your change will be accepted, please ask in an issue.


> To keep this community productive and enjoyable, please [don't break our code of conduct](https://github.com/WebCoder49/code-input/blob/main/CODE_OF_CONDUCT.md). I think it's mostly common sense.

# Ways you could contribute:

## Always start by submitting / finding an Issue

We have a guided process in place to let you submit bug reports and feature suggestions as GitHub Issues, which you should do whether you are going to contribute a solution through a Pull Request or not.

Firstly, [search the issues here](https://github.com/WebCoder49/code-input/issues) to check whether anyone else has already reported/suggested it. If so, comment that you have the same bug/idea and add any more details you think are useful.

If the issue doesn't exist, [create the issue from a template here](https://github.com/WebCoder49/code-input/issues/new/choose).

## Code contributions via Pull Requests

Firstly, thank you for doing this! This is probably the most time consuming way of contributing but is also the most rewarding for both you and me as a maintainer.

Once you have followed the steps above to get an Issue, check that nobody else is implementing it (i.e. it is not assigned to anyone), and comment on the Issue that you want to contribute to, notifying @WebCoder49. I will assign you to the Issue to welcome your contribution, while you [make a fork of the repo and submit a pull request](https://docs.github.com/en/get-started/quickstart/contributing-to-projects).

You can be pretty sure I'll accept contributions that match the main aims of `code-input`, but if you doubt they will be useful you can wait until I assign you and give you the go-ahead.

In the pull request, include the code updates for your feature / bug, and if you're adding a new feature make sure you comment your code so it's understandable to future contributors, and if you can, add unit tests for it in tests/tester.js. If you have any questions, just let me (@WebCoder49) know!