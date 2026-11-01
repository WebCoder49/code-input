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
            new codeInput.plugins.Autocomplete(function(popupElem, textarea, selectionEnd) {
                if(textarea.value.substring(selectionEnd-5, selectionEnd) == "popup") {
                    // Show popup
                    popupElem.style.display = "block";
                    popupElem.innerHTML = "Here's your popup!";
                } else {
                    popupElem.style.display = "none";
                }
            }),
            new codeInput.plugins.Indent(true, 2),
            new codeInput.plugins.SpecialChars(true),
        ]));
    } else {
        codeInput.registerTemplate("code-editor", codeInput.templates.prism(Prism, [
            new codeInput.plugins.Autocomplete(function(popupElem, textarea, selectionEnd) {
                if(textarea.value.substring(selectionEnd-5, selectionEnd) == "popup") {
                    // Show popup
                    popupElem.style.display = "block";
                    popupElem.innerHTML = "Here's your popup!";
                } else {
                    popupElem.style.display = "none";
                }
            }),
            new codeInput.plugins.Indent(true, 2),
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

    /*--- Tests for security ---*/
    {
        const codeInputElem = document.getElementById("ci1");
        document.body.appendChild(codeInputElem);

        try {
            codeInputElem.value = '<img src=x onerror="document.title=\'XSS\'">';
        } catch(err) {
            if(err instanceof TypeError) {
                console.log("Failed to set value IDL Attribute of Pre-Registration code-input Element (expected that 'can't access property ''value'', this.textareaElement is null'):", err);
            } else {
                throw err;
            }
        }
        await waitAsync(200);

        let gotXSS = false;
        if(document.title == "XSS") {
            gotXSS = true;
            alert("⚠️ SECURITY VULNERABILITY PRESENT: Cross-Site Scripting for value Attribute of Pre-Registration code-input Element")
            document.title = "code-input.js Tester";
        }
        testAssertion("Security", "No XSS after 200ms for value Attribute of Pre-Registration code-input Element", !gotXSS, `⚠️ SECURITY VULNERABILITY PRESENT`);
    }
    {
        const codeInputElem = document.getElementById("ci2");

        let loaded = false
        document.body.appendChild(codeInputElem);

        await waitAsync(100);
        // Wait until textarea should be fully loaded.
        codeInputElem.value = '<img src=x onerror="document.title=\'XSS\'">';

        await waitAsync(200);

        let gotXSS = false;
        if(document.title == "XSS") {
            gotXSS = true;
            alert("⚠️ SECURITY VULNERABILITY PRESENT: Cross-Site Scripting for value Attribute of Post-Registration code-input")
            document.title = "code-input.js Tester";
        }
        testAssertion("Security", "No XSS after 200ms for value Attribute of Post-Registration code-input With Fallback Textarea", !gotXSS, `⚠️ SECURITY VULNERABILITY PRESENT`);
    }
    codeInput.registerTemplate("character-limit", codeInput.templates.characterLimit([]));
    {
        const codeInputElem = document.getElementById("ci3");
        codeInputElem.setAttribute("data-overflow-msg", '<img src=x onerror="document.title=\'XSS\'">');

        await waitAsync(100);
        // Wait until textarea should be fully loaded.
        codeInputElem.value = "####";

        await waitAsync(200);

        let gotXSS = false;
        if(document.title == "XSS") {
            gotXSS = true;
            alert("⚠️ SECURITY VULNERABILITY PRESENT: Cross-Site Scripting for (deprecated) characterLimit template, through data-overflow-msg");
            document.title = "code-input.js Tester";
        }
        testAssertion("Security", "No XSS after 200ms for (deprecated) characterLimit template, through data-overflow-msg", !gotXSS, `⚠️ SECURITY VULNERABILITY PRESENT`);

    }
    codeInput.registerTemplate("rainbow-colors", codeInput.templates.rainbowText(["red", "orange", '"><img src=x onerror="document.title=\'XSS\'"><span class="'], "\n"));
    {
        const codeInputElem = document.getElementById("ci4");

        await waitAsync(100);
        // Wait until textarea should be fully loaded.
        codeInputElem.value = "OK\nOK\nvulnerable";

        await waitAsync(200);

        let gotXSS = false;
        if(document.title == "XSS") {
            gotXSS = true;
            alert("⚠️ SECURITY VULNERABILITY PRESENT: Cross-Site Scripting for (deprecated) rainbowColors template, through color name")
            document.title = "code-input.js Tester";
        }
        testAssertion("Security", "No XSS after 200ms for (deprecated) rainbowColors template, through color name", !gotXSS, `⚠️ SECURITY VULNERABILITY PRESENT`);
    }
    codeInput.registerTemplate("rainbow-colors-2", codeInput.templates.rainbowText(["red", "orange"], '<img src=x onerror="document.title=\'XSS\'">'));
    {
        const codeInputElem = document.getElementById("ci5");

        let loaded = false

        await waitAsync(100);
        // Wait until textarea should be fully loaded.
        codeInputElem.value = '<img src=x onerror="document.title=\'XSS\'">';

        await waitAsync(200);

        let gotXSS = false;
        if(document.title == "XSS") {
            gotXSS = true;
            alert("⚠️ SECURITY VULNERABILITY PRESENT: Cross-Site Scripting for (deprecated) rainbowColors template, through delimiter")
            document.title = "code-input.js Tester";
        }
        testAssertion("Security", "No XSS after 200ms for (deprecated) rainbowColors template, through delimiter", !gotXSS, `⚠️ SECURITY VULNERABILITY PRESENT`);
    }

    codeInput.registerTemplate("no-op", codeInput.templates.custom(function(result_element) {}, true, true, false, []));
    for (const templateDetails of [
        {template: "character-limit", readable: "(deprecated) characterLimit template"},
        {template: "rainbow-colors", readable: "(deprecated) rainbowColors template"},
        {template: "code-editor", readable: "the Prism or highlight.js template loaded on this page"},
        {template: "no-op", readable: "custom template that does no highlighting"},
    ]) {
        const codeInputElem = document.getElementById("ci-value-test-"+templateDetails.template);

        await waitAsync(100);
        // Wait until textarea should be fully loaded.

        // Keep "####" here to ensure that for the characterLimit template the payload
        // HTML is all in one element.
        codeInputElem.value = '#### <img src=x onerror="document.title=\'XSS\'">';

        await waitAsync(200);

        let gotXSS = false;
        if(document.title == "XSS") {
            gotXSS = true;
            alert("⚠️ SECURITY VULNERABILITY PRESENT: Cross-Site Scripting for "+templateDetails.readable+", through value")
            document.title = "code-input.js Tester";
        }
        testAssertion("Security", "No XSS after 200ms for "+templateDetails.readable+", through value", !gotXSS, `⚠️ SECURITY VULNERABILITY PRESENT`);
    }

    /* Make it clear if any tests have failed */
    if(testsFailed) {
        document.querySelector("h2").style.backgroundColor = "red";
        document.querySelector("h2").textContent = "Some Tests have Failed.";
    } else {
        document.querySelector("h2").style.backgroundColor = "lightgreen";
        document.querySelector("h2").textContent = "All Tests have Passed.";
    }
}
