/* Main testing code */

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
            new codeInput.plugins.GoToLine(),
            new codeInput.plugins.Indent(true, 2),
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
            new codeInput.plugins.GoToLine(),
            new codeInput.plugins.Indent(true, 2),
            new codeInput.plugins.SpecialChars(true),
        ]));
    }
    startLoad(codeInputElem, isHLJS);
}

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
}

function assertEqual(group, test, givenOutput, correctOutput) {
    let equal = givenOutput == correctOutput;
    testAssertion(group, test, equal, "see console output");
    if(!equal) {
        console.error(group, test, givenOutput, "should be", correctOutput)
    }
}

function testAddingText(group, textarea, action, correctOutput, correctLengthToSelectionStart, correctLengthToSelectionEnd) {
    let origSelectionStart = textarea.selectionStart;
    let origValueBefore = textarea.value.substring(0, textarea.selectionStart);
    let origValueAfter = textarea.value.substring(textarea.selectionEnd);
    action(textarea);

    let correctOutputValue = origValueBefore+correctOutput+origValueAfter;
    assertEqual(group, "Text Output", textarea.value, correctOutputValue)
    assertEqual(group, "Code-Input Value JS Property Output", textarea.parentElement.value, correctOutputValue)
    assertEqual(group, "Selection Start", textarea.selectionStart, origSelectionStart+correctLengthToSelectionStart)
    assertEqual(group, "Selection End", textarea.selectionEnd, origSelectionStart+correctLengthToSelectionEnd)
}

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

function move(textarea, numMovesRight) {
    textarea.selectionStart += numMovesRight;
    textarea.selectionEnd = textarea.selectionStart;
}

function waitAsync(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

async function startTests(textarea, isHLJS) {
    // Make input events trusted - thanks for this SO answer: https://stackoverflow.com/a/49519772/21785620
    textarea.addEventListener('input', function(e){
        if(!e.isTrusted){
            //Manually triggered
            document.execCommand("insertText", false, e.data);
        }
    }, false);

    textarea.focus();

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
// A third line with &lt;html&gt; tags`);


    // Update code-input value with JavaScript, new value should be correct.
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
console.log("I've got another line!", 2 &lt; 3, "should be true.");`);
    
    // Changing language should be correct
    if(!isHLJS) {
        // Highlight.js has autodetect plugin that should make this fail, so don't run this test.
        testAssertion("Core", "Language attribute Initial value", 
            codeInputElement.codeElement.classList.contains("language-javascript")
            && !codeInputElement.codeElement.classList.contains("language-html"), 
            `Language set to JavaScript but code element's class name is ${codeInputElement.codeElement.className}.`);

        codeInputElement.setAttribute("language", "HTML");
    
        await waitAsync(50); // Wait for attribute change to be handled

        // Highlight.js has autodetect plugin that should make this fail, so don't run this test.
        testAssertion("Core", "Language attribute Changed value 1", 
            codeInputElement.codeElement.classList.contains("language-html")
            && !codeInputElement.codeElement.classList.contains("language-javascript"), 
            `Language set to HTML but code element's class name is ${codeInputElement.codeElement.className}.`);
        
        codeInputElement.setAttribute("language", "JavaScript");

        await waitAsync(50); // Wait for attribute change to be handled

        // Highlight.js has autodetect plugin that should make this fail, so don't run this test.
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
// A third line with &lt;html&gt; tags`);

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

    // GoToLine
    // Replace all code
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;
    backspace(textarea);
    addText(textarea, "// 7 times table\nlet i = 1;\nwhile(i <= 12) { console.log(`7 x ${i} = ${7*i}`) }\n// That's my code.\n// This is another comment\n// Another\n// Line");
    
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    let dialog = codeInputElement.querySelector(".code-input_go-to_dialog input");
    dialog.value = "1";
    dialog.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    dialog.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Line Only", textarea.selectionStart, 0);

    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    dialog = codeInputElement.querySelector(".code-input_go-to_dialog input");
    dialog.value = "3:18";
    dialog.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    dialog.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Line and Column", textarea.selectionStart, 45);
    
    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    dialog = codeInputElement.querySelector(".code-input_go-to_dialog input");
    dialog.value = "10";
    dialog.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    dialog.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Rejects Out-of-range Line", dialog.classList.contains("code-input_go-to_error"), true);

    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    dialog = codeInputElement.querySelector(".code-input_go-to_dialog input");
    dialog.value = "2:12";
    dialog.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    dialog.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Rejects Out-of-range Column", dialog.classList.contains("code-input_go-to_error"), true);

    textarea.dispatchEvent(new KeyboardEvent("keydown", { "cancelable": true, "key": "g", "ctrlKey": true }));
    dialog = codeInputElement.querySelector(".code-input_go-to_dialog input");
    dialog.value = "sausages";
    dialog.dispatchEvent(new KeyboardEvent("keydown", { "key": "Enter" }));
    dialog.dispatchEvent(new KeyboardEvent("keyup", { "key": "Enter" }));
    assertEqual("GoToLine", "Rejects Invalid Input", dialog.classList.contains("code-input_go-to_error"), true);
    assertEqual("GoToLine", "Stays open when Rejects Input", dialog.parentElement.classList.contains("code-input_go-to_hidden-dialog"), false);

    dialog.dispatchEvent(new KeyboardEvent("keydown", { "key": "Escape" }));
    dialog.dispatchEvent(new KeyboardEvent("keyup", { "key": "Escape" }));
    assertEqual("GoToLine", "Exits when Esc pressed", dialog.parentElement.classList.contains("code-input_go-to_hidden-dialog"), true);

    // Indent
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    addText(textarea, "\nfor(let i = 0; i < 100; i++) {\n  for(let j = i; j < 100; j++) {\n    // Here's some code\n    console.log(i,j);\n  }\n}\n{\n  // This is indented\n}")
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
        addText(textarea, `function printTriples(max) {\nfor(let i = 0; i < max-2; i++) {\nfor(let j = 0; j < max-1; j++) {\nfor(let k = 0; k < max; k++) {\nconsole.log(i,j,k);\n}\n//Hmmm...`, true)
    }, 'function printTriples(max) {\n  for(let i = 0; i < max-2; i++) {\n    for(let j = 0; j < max-1; j++) {\n      for(let k = 0; k < max; k++) {\n        console.log(i,j,k);\n      }\n      //Hmmm...\n      }\n    }\n  }\n}', 189, 189);

    // Special Chars
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
}