/* This file contains the main code to test the code-input library with Prism.js and highlight.js. */

/* --- Test running functions --- */
var testsFailed = false;

/* Add data to the tests list under a specific group and test description (usually the plugin name then the functionality description) */
function testData(group, test, data) {
    let resultElem = document.getElementById("test-results");
    let groupElem = resultElem.querySelector("#test-"+group);
    if(groupElem == undefined) {
        groupElem = document.createElement("span");
        groupElem.innerHTML = `Group <b>${group}</b>:\n`
        groupElem.id = "test-" + group;
        resultElem.append(groupElem);
    }
    groupElem.innerHTML += `\t${test}: ${data}\n`;
}

/* Add a test to the tests list, saying if it has passed (passed parameter), and if it has failed giving a message (messageIfFailed parameter) */
function testAssertion(group, test, passed, messageIfFailed) {
    let resultElem = document.getElementById("test-results");
    let groupElem = resultElem.querySelector("#test-"+group);
    if(groupElem == undefined) {
        groupElem = document.createElement("span");
        groupElem.innerHTML = `Group <b>${group}</b>:\n`
        groupElem.id = "test-" + group;
        resultElem.append(groupElem);
    }
    groupElem.innerHTML += `\t${test}: ${passed ? '<b style="color: darkgreen;">passed</b>' : '<b style="color: red;">failed</b> ('+messageIfFailed+')' }\n`;

    if(!passed) testsFailed = true;
}

/* Run a test that passes if the givenOutput == correctOutput */
function assertEqual(group, test, givenOutput, correctOutput) {
    let equal = givenOutput == correctOutput;
    testAssertion(group, test, equal, "see console output");
    if(!equal) {
        console.error(group, test, givenOutput, "should be", correctOutput);
    }
}

/* Test whether adding text to the textarea (with keyboard events emitted, therefore interacting with plugins) gives the correct output and selection start/end. */
function testAddingText(group, textarea, action, correctOutput, correctLengthToSelectionStart, correctLengthToSelectionEnd) {
    let origSelectionStart = textarea.selectionStart;
    let origValueBefore = textarea.value.substring(0, textarea.selectionStart);
    let origValueAfter = textarea.value.substring(textarea.selectionEnd);
    action(textarea);

    let correctOutputValue = origValueBefore+correctOutput+origValueAfter;
    assertEqual(group, "Text Output", textarea.value, correctOutputValue);
    assertEqual(group, "Code-Input Value JS Property Output", textarea.parentElement.value, correctOutputValue);
    assertEqual(group, "Selection Start", textarea.selectionStart, origSelectionStart+correctLengthToSelectionStart);
    assertEqual(group, "Selection End", textarea.selectionEnd, origSelectionStart+correctLengthToSelectionEnd);
}

/* --- Test helper functions --- */

/* Assuming the textarea is focused, add the given text to it, emitting 'input' and 'beforeinput' keyboard events (and 'keydown'/'keyup' Enter on newlines, if enterEvents is true) which plugins can handle */
function addText(textarea, text, enterEvents=false) {
    for(let i = 0; i < text.length; i++) {
        if(enterEvents && text[i] == "\n") {
            textarea.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
            textarea.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
        } else {
            let beforeInputEvt = new InputEvent("beforeinput", { "cancelable": true, "data": text[i] });
            textarea.dispatchEvent(beforeInputEvt);
            if(!beforeInputEvt.defaultPrevented) {
                textarea.dispatchEvent(new InputEvent("input", { "data": text[i] }));
            }
        }
    }
}

/* Emit the necessary events to simulate a backspace keypress in the textarea. */
function backspace(textarea) {
    let keydownEvt = new KeyboardEvent("keydown", { "cancelable": true, "key": "Backspace" });
    textarea.dispatchEvent(keydownEvt);
    let keyupEvt = new KeyboardEvent("keyup", { "cancelable": true, "key": "Backspace" });
    textarea.dispatchEvent(keyupEvt);
    if(!keydownEvt.defaultPrevented) {
        if(textarea.selectionEnd == textarea.selectionStart) {
            textarea.selectionEnd = textarea.selectionStart;
            textarea.selectionStart--;
        }
        document.execCommand("delete", false, null);
    }
}

/* Move the caret numMovesRight characters to the right, in the textarea. */
function move(textarea, numMovesRight) {
    textarea.selectionStart += numMovesRight;
    textarea.selectionEnd = textarea.selectionStart;
}

/* Wait in an asynchronous function for a specified number of milliseconds by using `await waitAsync(milliseconds)`. */
function waitAsync(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

/* --- Running the tests --- */

/* Start the test, for Prism.js if isHLJS is false, or for highlight.js if isHLJS is true. */
function beginTest(isHLJS) {
    let codeInputElem = document.querySelector("code-input");
    if(isHLJS) {
        codeInput.registerTemplate("code-editor", codeInput.templates.hljs(hljs, [
            new codeInput.plugins.AutoCloseBrackets(), 
            new codeInput.plugins.Autocomplete(function(popupElem, textarea, selectionEnd) {
                if(textarea.value.substring(selectionEnd-5, selectionEnd) == "popup") {
                    // Show popup
                    popupElem.style.display = "block";
                    popupElem.innerHTML = "Here's your popup!";
                } else {
                    popupElem.style.display = "none";
                }
            }),
            new codeInput.plugins.Autodetect(),
            new codeInput.plugins.FindAndReplace(),
            new codeInput.plugins.GoToLine(),
            new codeInput.plugins.Indent(true, 2),
            new codeInput.plugins.SelectTokenCallbacks(codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks.createClassSynchronisation("in-selection"), false, true, true, true, true, false),
            new codeInput.plugins.SpecialChars(true),
        ]));
    } else {
        codeInput.registerTemplate("code-editor", codeInput.templates.prism(Prism, [
            new codeInput.plugins.AutoCloseBrackets(), 
            new codeInput.plugins.Autocomplete(function(popupElem, textarea, selectionEnd) {
                if(textarea.value.substring(selectionEnd-5, selectionEnd) == "popup") {
                    // Show popup
                    popupElem.style.display = "block";
                    popupElem.innerHTML = "Here's your popup!";
                } else {
                    popupElem.style.display = "none";
                }
            }),
            new codeInput.plugins.FindAndReplace(),
            new codeInput.plugins.GoToLine(),
            new codeInput.plugins.Indent(true, 2),
            new codeInput.plugins.SelectTokenCallbacks(new codeInput.plugins.SelectTokenCallbacks.TokenSelectorCallbacks(selectBrace, deselectAllBraces), true),
            new codeInput.plugins.SpecialChars(true),
        ]));
    }
    startLoad(codeInputElem, isHLJS);
}

/* Start loading the tests, using the codeInput load time as one of the tests. */
function startLoad(codeInputElem, isHLJS) {
    let textarea;
    let timeToLoad = 0;
    let interval = window.setInterval(() => {
        textarea = codeInputElem.querySelector("textarea");
        if(textarea != null) window.clearInterval(interval);
        timeToLoad += 10;
        testData("TimeTaken", "Textarea Appears", timeToLoad+"ms (nearest 10)");
        startTests(textarea, isHLJS);
    }, 10);
}

/* Make input events work and be trusted in the inputElement - thanks for this SO answer: https://stackoverflow.com/a/49519772/21785620 */
function allowInputEvents(inputElement) {
    inputElement.addEventListener('input', function(e){
        if(!e.isTrusted){
            e.preventDefault();
            // Manually trigger
            document.execCommand("insertText", false, e.data);
        }
    }, false);
}

/* Start the tests using the textarea inside the code-input element and whether highlight.js is being used (as the Autodetect plugin only works with highlight.js, for example) */
async function startTests(textarea, isHLJS) {
    textarea.focus();
    allowInputEvents(textarea);

    codeInputElement = textarea.parentElement;

    /*--- Tests for core functionality ---*/

    // Textarea's initial value should be correct.
    assertEqual("Core", "Initial Textarea Value", textarea.value, `console.log("Hello, World!");
// A second line
// A third line with <html> tags`);
    // Code element's displayed value, ignoring appearance with HTML tags, should be the initial value but HTML-escaped
    let renderedValue = codeInputElement.codeElement.innerHTML.replace(/<[^>]+>/g, "");
    assertEqual("Core", "Initial Rendered Value", renderedValue, `console.log("Hello, World!");
// A second line
// A third line with &lt;html&gt; tags
`); // Extra newline so line numbers visible if enabled


    // Update code-input value with JavaScript, new value and num events should be correct.
    codeInputElement.value += `
console.log("I've got another line!", 2 < 3, "should be true.");`;

    await waitAsync(50); // Wait for rendered value to update

    // Textarea's value once updated with JavaScript should be correct.
    assertEqual("Core", "JS-updated Textarea Value", textarea.value, `console.log("Hello, World!");
// A second line
// A third line with <html> tags
console.log("I've got another line!", 2 < 3, "should be true.");`);
    // Code element's displayed value, ignoring appearance with HTML tags, should be the initial value but HTML-escaped
    renderedValue = codeInputElement.codeElement.innerHTML.replace(/<[^>]+>/g, "");
    assertEqual("Core", "JS-updated Rendered Value", renderedValue, `console.log("Hello, World!");
// A second line
// A third line with &lt;html&gt; tags
console.log("I've got another line!", 2 &lt; 3, "should be true.");
`); // Extra newline so line numbers visible if enabled

    // Event Listener Tests
    // Function type listeners
    let numTimesInputCalled = 0;
    let numTimesChangeCalled = 0;

    let inputListener = (evt) => {
        if(!evt.isTrusted) { // To prevent duplicate calling due to allowInputEvents hack
            numTimesInputCalled++;
        }
    };
    codeInputElement.addEventListener("input", inputListener);
    let changeListener = () => {
        numTimesChangeCalled++;
    };
    codeInputElement.addEventListener("change", changeListener);

    let inputDeletedListenerCalled = false;
    let deletedListener = () => {
        inputDeletedListenerCalled = true;
    };
    codeInputElement.addEventListener("input", deletedListener);
    codeInputElement.removeEventListener("input", deletedListener);

    // Make listeners be called
    textarea.focus(); // Focus textarea
    addText(textarea, " // Hi");
    textarea.blur(); // Unfocus textarea - calls change event
    textarea.focus();

    assertEqual("Core", "Function Event Listeners: Input Called Right Number of Times", numTimesInputCalled, 6);
    assertEqual("Core", "Function Event Listeners: Change Called Right Number of Times", numTimesChangeCalled, 1);
    testAssertion("Core", "Function Event Listeners: Input Removed Listener Not Called", !inputDeletedListenerCalled, "(code-input element).removeEventListener did not work.");
    
    codeInputElement.removeEventListener("input", inputListener);
    codeInputElement.removeEventListener("change", changeListener);

    // Repeat for Object type listeners
    numTimesInputCalled = 0;
    numTimesChangeCalled = 0;
    codeInputElement.addEventListener("input", {handleEvent: (evt) => {
        if(!evt.isTrusted) { // To prevent duplicate calling due to allowInputEvents hack
            numTimesInputCalled++;
        }
    }});
    codeInputElement.addEventListener("change", {handleEvent: () => {
        numTimesChangeCalled++;
    }});

    inputDeletedListenerCalled = false;
    deletedListener = {handleEvent: () => {
        inputDeletedListenerCalled = true;
    }};
    codeInputElement.addEventListener("input", deletedListener);
    codeInputElement.removeEventListener("input", deletedListener);

    // Make listeners be called
    textarea.focus(); // Focus textarea
    addText(textarea, " // Hi");
    textarea.blur(); // Unfocus textarea - calls change event
    textarea.focus();

    assertEqual("Core", "Object Event Listeners: Input Called Right Number of Times", numTimesInputCalled, 6);
    assertEqual("Core", "Object Event Listeners: Change Called Right Number of Times", numTimesChangeCalled, 1);
    testAssertion("Core", "Object Event Listeners: Input Removed Listener Not Called", !inputDeletedListenerCalled, "(code-input element).removeEventListener did not work.");
    
    // Changing language should be correct
    if(!isHLJS) {
        // Highlight.js has autodetect plugin that should make this fail, so don't run these tests with it.
        testAssertion("Core", "Language attribute Initial value", 
            !codeInputElement.codeElement.classList.contains("language-javascript")
            && !codeInputElement.codeElement.classList.contains("language-html"), 
            `Language unset but code element's class name is ${codeInputElement.codeElement.className}.`);

        codeInputElement.setAttribute("language", "HTML");
    
        await waitAsync(50); // Wait for attribute change to be handled

        testAssertion("Core", "Language attribute Changed value 1", 
            codeInputElement.codeElement.classList.contains("language-html")
            && !codeInputElement.codeElement.classList.contains("language-javascript"), 
            `Language set to HTML but code element's class name is ${codeInputElement.codeElement.className}.`);
        
        codeInputElement.setAttribute("language", "JavaScript");

        await waitAsync(50); // Wait for attribute change to be handled

        testAssertion("Core", "Language attribute Changed value 2", 
            codeInputElement.codeElement.classList.contains("language-javascript")
            && !codeInputElement.codeElement.classList.contains("language-html"), 
            `Language set to JavaScript but code element's class name is ${codeInputElement.codeElement.className}.`);
    }

    let formElement = codeInputElement.parentElement;
    formElement.reset();
    
    await waitAsync(50); // Wait for rendered value to update
    
    assertEqual("Core", "Form Reset resets Code-Input Value", codeInputElement.value, `console.log("Hello, World!");
// A second line
// A third line with <html> tags`);
    assertEqual("Core", "Form Reset resets Textarea Value", textarea.value, `console.log("Hello, World!");
// A second line
// A third line with <html> tags`);
    renderedValue = codeInputElement.codeElement.innerHTML.replace(/<[^>]+>/g, "");
    assertEqual("Core", "Form Reset resets Rendered Value", renderedValue, `console.log("Hello, World!");
// A second line
// A third line with &lt;html&gt; tags
`); // Extra newline so line numbers visible if enabled.

    /*--- Tests for plugins ---*/
    // AutoCloseBrackets
    testAddingText("AutoCloseBrackets", textarea, function(textarea) {
        addText(textarea, `\nconsole.log("A test message`);
        move(textarea, 2);
        addText(textarea, `;\nconsole.log("Another test message");\n{[{[]}(([[`);
        backspace(textarea);
        backspace(textarea);
        backspace(textarea);
        addText(textarea, `)`);
    }, '\nconsole.log("A test message");\nconsole.log("Another test message");\n{[{[]}()]}', 77, 77);
    
    // Autocomplete
    addText(textarea, "popup");
    
    await waitAsync(50); // Wait for popup to be rendered
        
    testAssertion("Autocomplete", "Popup Shows", confirm("Does the autocomplete popup display correctly? (OK=Yes)"), "user-judged");
    backspace(textarea);
    
    await waitAsync(50); // Wait for popup disappearance to be rendered
    
    testAssertion("Autocomplete", "Popup Disappears", confirm("Has the popup disappeared? (OK=Yes)"), "user-judged");
    backspace(textarea);
    backspace(textarea);
    backspace(textarea);
    backspace(textarea);

    // Autodetect - these tests have been made so the programming language is very obvious
    //  - the efficacy of autodetection is highlight.js' responsibility.
    if(isHLJS) {
        // Check detects XML - Replace all code with XML
        textarea.selectionStart = 0;
        textarea.selectionEnd = textarea.value.length;
        backspace(textarea);
        addText(textarea, 'console.log("Hello, World!");\nfunction sayHello(name) {\n  console.log("Hello, " + name + "!");\n}\nsayHello("code-input");');
        await waitAsync(50); // Wait for highlighting so language attribute updates
        assertEqual("Autodetect", "Detects JavaScript", codeInputElement.getAttribute("language"), "javascript");
    
        // Check detects Python - Replace all code with Python
        textarea.selectionStart = 0;
        textarea.selectionEnd = textarea.value.length;
        backspace(textarea);
        addText(textarea, '#!/usr/bin/python\nprint("Hello, World!")\nfor i in range(5):\n  print(i)');
        await waitAsync(50); // Wait for highlighting so language attribute updates
        assertEqual("Autodetect", "Detects Python", codeInputElement.getAttribute("language"), "python");

        // Check detects CSS - Replace all code with CSS
        textarea.selectionStart = 0;
        textarea.selectionEnd = textarea.value.length;
        backspace(textarea);
        addText(textarea, "body, html {\n  height: 100%;\n  background-color: blue;\n  color: red;\n}");
        await waitAsync(50); // Wait for highlighting so language attribute updates
        assertEqual("Autodetect", "Detects CSS", codeInputElement.getAttribute("language"), "css");
    }

    // FindAndReplace
    // Replace all code
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;
    backspace(textarea);
    addText(textarea, "// hello /\\S/g\nhe('llo', /\\s/g);\nhello");
    textarea.selectionStart = textarea.selectionEnd = 0; // So focuses on first match

    await waitAsync(50); // Wait for highlighting so text updates

    // Open dialog and get interactive elements
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "f", "ctrlKey": true }));
    let inputBoxes = codeInputElement.querySelectorAll(".code-input_find-and-replace_dialog input");
    let findInput = inputBoxes[0];
    let regExpCheckbox = inputBoxes[1];
    let caseSensitiveCheckbox = inputBoxes[2];
    let replaceInput = inputBoxes[3];

    let buttons = codeInputElement.querySelectorAll(".code-input_find-and-replace_dialog button");
    let nextMatchButton = buttons[0];
    let previousMatchButton = buttons[1];
    let replaceButton = buttons[2];
    let replaceAllButton = buttons[3];

    let replaceDropdown = codeInputElement.querySelector(".code-input_find-and-replace_dialog details summary");

    // Run find/replace tests
    findInput.value = "/\\s/g";
    caseSensitiveCheckbox.click(); // Now case-sensitive
    await waitAsync(150); // Wait for highlighting so matches update
    testAssertion("FindAndReplace", "Finds Case-Sensitive Matches Correctly", confirm("Is there a match on only the lowercase '/\\s/g'?"), "user-judged");

    findInput.value = "he[^l]*llo";
    regExpCheckbox.click(); // Now regex
    caseSensitiveCheckbox.click(); // Now not case-sensitive
    await waitAsync(150); // Wait for highlighting so matches update
    // Focuses on next match after /\s/g, therefore third he...llo
    testAssertion("FindAndReplace", "Finds RegExp Matches Correctly", confirm("Are there matches on all 'he...llo's?"), "user-judged");

    replaceDropdown.click();
    previousMatchButton.click();
    replaceInput.value = "do('hello";
    replaceButton.click();
    await waitAsync(50); // Wait for buttons to work
    assertEqual("FindAndReplace", "Replaces Once Correctly", textarea.value, "// hello /\\S/g\ndo('hello', /\\s/g);\nhello");
    nextMatchButton.click(); // Back to first match

    // Exit find input box
    codeInputElement.querySelector(".code-input_find-and-replace_dialog").dispatchEvent(new KeyboardEvent("keydown", { "key": "Escape" }));
    codeInputElement.querySelector(".code-input_find-and-replace_dialog").dispatchEvent(new KeyboardEvent("keyup", { "key": "Escape" }));

    // Check first hello now selected
    assertEqual("FindAndReplace", "Selection Start on Focused Match when Dialog Exited", textarea.selectionStart, 3);
    assertEqual("FindAndReplace", "Selection End on Focused Match when Dialog Exited", textarea.selectionEnd, 8);
    
    // Open replace dialog; conduct a find and replace
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "h", "ctrlKey": true }));
    findInput.value = "";
    findInput.focus();
    allowInputEvents(findInput);
    addText(findInput, "hello");
    await waitAsync(150); // Wait for highlighting so matches update

    replaceInput.value = "hi";
    replaceAllButton.click();
    assertEqual("FindAndReplace", "Replaces All Correctly", textarea.value, "// hi /\\S/g\ndo('hi', /\\s/g);\nhi");

    // Exit find input box
    codeInputElement.querySelector(".code-input_find-and-replace_dialog").dispatchEvent(new KeyboardEvent("keydown", { "key": "Escape" }));
    codeInputElement.querySelector(".code-input_find-and-replace_dialog").dispatchEvent(new KeyboardEvent("keyup", { "key": "Escape" }));

    // GoToLine
    // Replace all code
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;
    backspace(textarea);
    addText(textarea, "// 7 times table\nlet i = 1;\nwhile(i <= 12) { console.log(`7 x ${i} = ${7*i}`) }\n// That's my code.\n// This is another comment\n// Another\n// Line");
    
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    let lineInput = codeInputElement.querySelector(".code-input_go-to-line_dialog input");
    lineInput.value = "1";
    lineInput.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    lineInput.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Line Only", textarea.selectionStart, 0);

    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    lineInput.value = "3:18";
    lineInput.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    lineInput.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Line and Column", textarea.selectionStart, 45);
    
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    lineInput.value = "10";
    lineInput.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    lineInput.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Rejects Out-of-range Line", lineInput.classList.contains("code-input_go-to-line_error"), true);

    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    lineInput.value = "2:12";
    lineInput.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    lineInput.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Rejects Out-of-range Column", lineInput.classList.contains("code-input_go-to-line_error"), true);

    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    lineInput.value = "sausages";
    lineInput.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    lineInput.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Rejects Invalid Input", lineInput.classList.contains("code-input_go-to-line_error"), true);
    assertEqual("GoToLine", "Stays open when Rejects Input", lineInput.parentElement.classList.contains("code-input_go-to-line_hidden-dialog"), false);

    lineInput.dispatchEvent(new KeyboardEvent("keydown", { "key": "Escape" }));
    lineInput.dispatchEvent(new KeyboardEvent("keyup", { "key": "Escape" }));
    assertEqual("GoToLine", "Exits when Esc pressed", lineInput.parentElement.classList.contains("code-input_go-to-line_hidden-dialog"), true);

    // Indent
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    addText(textarea, "\nfor(let i = 0; i < 100; i++) {\n  for(let j = i; j < 100; j++) {\n    // Here's some code\n    console.log(i,j);\n  }\n}\n{\n  // This is indented\n}");
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "key": "Tab", "shiftKey": false }));
    textarea.dispatchEvent(new KeyboardEvent("keyup", { "key": "Tab", "shiftKey": false }));
    assertEqual("Indent", "Indents Lines", textarea.value, "  // 7 times table\n  let i = 1;\n  while(i <= 12) { console.log(`7 x ${i} = ${7*i}`) }\n  // That's my code.\n  // This is another comment\n  // Another\n  // Line\n  for(let i = 0; i < 100; i++) {\n    for(let j = i; j < 100; j++) {\n      // Here's some code\n      console.log(i,j);\n    }\n  }\n  {\n    // This is indented\n  }");
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "key": "Tab", "shiftKey": true }));
    textarea.dispatchEvent(new KeyboardEvent("keyup", { "key": "Tab", "shiftKey": true }));
    assertEqual("Indent", "Unindents Lines", textarea.value, "// 7 times table\nlet i = 1;\nwhile(i <= 12) { console.log(`7 x ${i} = ${7*i}`) }\n// That's my code.\n// This is another comment\n// Another\n// Line\nfor(let i = 0; i < 100; i++) {\n  for(let j = i; j < 100; j++) {\n    // Here's some code\n    console.log(i,j);\n  }\n}\n{\n  // This is indented\n}");
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "key": "Tab", "shiftKey": true }));
    textarea.dispatchEvent(new KeyboardEvent("keyup", { "key": "Tab", "shiftKey": true }));
    assertEqual("Indent", "Unindents Lines where some are already fully unindented", textarea.value, "// 7 times table\nlet i = 1;\nwhile(i <= 12) { console.log(`7 x ${i} = ${7*i}`) }\n// That's my code.\n// This is another comment\n// Another\n// Line\nfor(let i = 0; i < 100; i++) {\nfor(let j = i; j < 100; j++) {\n  // Here's some code\n  console.log(i,j);\n}\n}\n{\n// This is indented\n}");
    
    textarea.selectionStart = 255;
    textarea.selectionEnd = 274;
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "key": "Tab", "shiftKey": false }));
    textarea.dispatchEvent(new KeyboardEvent("keyup", { "key": "Tab", "shiftKey": false }));
    assertEqual("Indent", "Indents Lines by Selection", textarea.value, "// 7 times table\nlet i = 1;\nwhile(i <= 12) { console.log(`7 x ${i} = ${7*i}`) }\n// That's my code.\n// This is another comment\n// Another\n// Line\nfor(let i = 0; i < 100; i++) {\nfor(let j = i; j < 100; j++) {\n  // Here's some code\n  console.log(i,j);\n}\n}\n{\n  // This is indented\n}");

    textarea.selectionStart = 265;
    textarea.selectionEnd = 265;
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "key": "Tab", "shiftKey": true }));
    textarea.dispatchEvent(new KeyboardEvent("keyup", { "key": "Tab", "shiftKey": true }));
    assertEqual("Indent", "Unindents Lines by Selection", textarea.value, "// 7 times table\nlet i = 1;\nwhile(i <= 12) { console.log(`7 x ${i} = ${7*i}`) }\n// That's my code.\n// This is another comment\n// Another\n// Line\nfor(let i = 0; i < 100; i++) {\nfor(let j = i; j < 100; j++) {\n  // Here's some code\n  console.log(i,j);\n}\n}\n{\n// This is indented\n}");

    // Indent+AutoCloseBrackets
    // Clear all code
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;
    backspace(textarea);

    testAddingText("Indent-AutoCloseBrackets", textarea, function(textarea) {
        addText(textarea, `function printTriples(max) {\nfor(let i = 0; i < max-2; i++) {\nfor(let j = 0; j < max-1; j++) {\nfor(let k = 0; k < max; k++) {\nconsole.log(i,j,k);\n}\n//Hmmm...`, true);
    }, 'function printTriples(max) {\n  for(let i = 0; i < max-2; i++) {\n    for(let j = 0; j < max-1; j++) {\n      for(let k = 0; k < max; k++) {\n        console.log(i,j,k);\n      }\n      //Hmmm...\n      }\n    }\n  }\n}', 189, 189);

    // SelectTokenCallbacks
    if(isHLJS) {
        addText(textarea, "\nlet x = 1;\nlet y = 2;\nconsole.log(`${x} + ${y} = ${x+y}`);");
        move(textarea, -4); // Ends at |: "${x+y|}`);"
        textarea.selectionStart -= 35; // Starts at |: "let y = |2;"
        await waitAsync(50); // Wait for highlighting so text updates
        assertEqual("SelectTokenCallbacks", "Number of Selected Tokens", codeInputElement.querySelectorAll(".in-selection").length, 13);
        assertEqual("SelectTokenCallbacks", "Number of Selected .hljs-string Tokens", codeInputElement.querySelectorAll(".hljs-string.in-selection").length, 0); // Since parentTokensAreSelected set to false    
        assertEqual("SelectTokenCallbacks", "Number of Selected .hljs-subst Tokens", codeInputElement.querySelectorAll(".hljs-subst.in-selection").length, 2);    
    } else {
        // Combined with compatiblity-added match-braces plugin
        addText(textarea, "\n[(),((),'Hi')]");
        await waitAsync(50); // Wait for highlighting so text updates
        // Move back 2 characters so just after 'Hi'
        move(textarea, -2);
        await waitAsync(50); // Wait for highlighting so text updates
        assertEqual("SelectTokenCallbacks", "Number of Selected Braces 1", codeInputElement.getElementsByClassName("brace-hover").length, 2);
        // Move forward 1 character so between )]
        move(textarea, 1);
        await waitAsync(50); // Wait for highlighting so text updates
        assertEqual("SelectTokenCallbacks", "Number of Selected Braces 2", codeInputElement.getElementsByClassName("brace-hover").length, 4);    
    }

    // SpecialChars
    // Clear all code
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;
    backspace(textarea);

    addText(textarea, '"Some special characters: \u0096,\u0001\u0003,\u0002..."');
    textarea.selectionStart = textarea.value.length-4;
    textarea.selectionEnd = textarea.value.length;

    await waitAsync(50); // Wait for special characters to be rendered
    
    testAssertion("SpecialChars", "Displays Correctly", confirm("Do the special characters read (0096),(0001)(0003),(0002) and align with the ellipsis? (OK=Yes)"), "user-judged");

    // Large amounts of code
    // Clear all code
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;
    backspace(textarea);
    fetch(new Request("https://cdn.jsdelivr.net/gh/webcoder49/code-input@2.1/code-input.js"))
    .then((response) => response.text())
    .then((code) => {
        textarea.value = "// code-input v2.1: A large code file (not the latest version!)\n// Editing this here should give little latency.\n\n"+code;
        
        textarea.selectionStart = 112;
        textarea.selectionEnd = 112;
        addText(textarea, "\n", true);

        document.getElementById("collapse-results").setAttribute("open", true);
    });

    /* Make it clear if any tests have failed */
    if(testsFailed) {
        document.querySelector("h2").style.backgroundColor = "red";
        document.querySelector("h2").textContent = "Some Tests have Failed.";
    } else {
        document.querySelector("h2").style.backgroundColor = "lightgreen";
        document.querySelector("h2").textContent = "All Tests have Passed.";
    }
}