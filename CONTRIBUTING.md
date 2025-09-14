# Contributing to `code-input`

🎉**Here at `code-input`, contributions of all sizes are more than welcome. Below are some scenarios where you could contribute and how to do so.** Contributions are generally accepted when they help achieve at least one of the aims below, but others will be considered:

* The `code-input` element should act like a normal HTML `textarea` in all browsers, working with all of the normal attributes, events and other types of behaviour.
* The `code-input` element should be easy to use with all popular syntax-highlighting libraries.
* Any modifications of `code-input` that would be useful for the open-source community but are not core to this functionality should be available as optional plugins in the `plugins` folder. Here's where most feature contributions will go.

We will generally *not* consider the following contributions:
* Excess functionality and/or complexity in the main code-input files - these types of contributions should go in the plugin folder instead.
* Issues that have been closed as not planned in the past (you can search the issue list to check), unless you bring a change that overcomes the reason they were not planned.

This said, if you're not sure whether your change will be accepted, please ask in an issue.

---

To keep this community productive and enjoyable, please [don't break our code of conduct](https://github.com/WebCoder49/code-input/blob/main/CODE_OF_CONDUCT.md).

---
# Ways you could contribute:
If you don't want to use GitHub, for all of these you can alternatively [get in touch via email so the maintainer can add your contribution for you](mailto:code-input-js@webcoder49.dev).

## 1. I've found a bug but don't know how / don't have time to fix it.
If you think you've found a bug, please [submit an issue](https://github.com/WebCoder49/code-input/issues) with screenshots, how you found the bug, and copies of the console's logs if an error is in them. Please also mention the template and plugins you used (your `codeInput.registerTemplate(...)` snippet). We'd be more than happy to help you fix it. A demo using [CodePen](https://codepen.io/) would be incredibly useful.

## 2. I have implemented a feature / have thought of a potential feature for the library and think it could be useful for others.
The best way to implement a feature is as a plugin like those in the `plugins` folder of `code-input`. If you do this, you could contribute it as in point 3 below.
Otherwise, if you do not have the time needed / do not want to implement it, any potential plugins would be [welcome as an Issue](https://github.com/WebCoder49/code-input/issues) which specifies the uses and desired characteristics.

## 3. I want to contribute code that I need / have seen in the Issues.
Firstly, thank you for doing this! This is probably the most time consuming way of contributing but is also the most rewarding for both you and me as a maintainer.

Please first open an issue if one doesn't already exist, and assign yourself to it. Then, [make a fork of the repo and submit a pull request](https://docs.github.com/en/get-started/quickstart/contributing-to-projects).

In the pull request, include the code updates for your feature / bug, and if you're adding a new feature make sure you comment your code so it's understandable to future contributors, and if you can, add unit tests for it in tests/tester.js. If you have any questions, just let me (@WebCoder49) know! 

If an issue is open but already assigned to someone, it is probably already being worked on - you could still suggest a method of fixing it in the comments but shouldn't open a pull request as it would waste your time.
