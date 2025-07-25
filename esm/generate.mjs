// NOTICE: This is a build script; do not try to import it.

// Generate ESM modules and modular TS definitions
// Dependency: Node.js
console.log("Generating ECMAScript modules using Node");

import { open, mkdir, access, constants } from 'node:fs/promises';

const AUTOGENERATED_NOTICE = "// NOTICE: This code is @generated from code outside the esm directory. Please do not edit it to contribute!\n\n";

// Main file
//  code-input.mjs: (../code-input.js without the templates) + ESM
{
    const codeInputJs = await open("../code-input.js", "r");
    const codeInputMjs = await open("code-input.mjs", "w");
    await codeInputMjs.writeFile(AUTOGENERATED_NOTICE);
    // Imports: Nothing
    // Miss out templates
    let copyingCode = true;
    for await (const line of codeInputJs.readLines()) {
        if(line.includes("ESM-SUPPORT-START-TEMPLATES-BLOCK-1") || line.includes("ESM-SUPPORT-START-TEMPLATES-BLOCK-2")) {
            copyingCode = false;
        }
        if(copyingCode) {
            await codeInputMjs.writeFile(line+"\n");
        }
        if(line.includes("ESM-SUPPORT-END-TEMPLATES-BLOCK-1") || line.includes("ESM-SUPPORT-END-TEMPLATES-BLOCK-2")) {
            copyingCode = true; // After code to copy - this line missed out
        }
    }
    // Exports
    await codeInputMjs.writeFile("export const Plugin = codeInput.Plugin;\n");
    await codeInputMjs.writeFile("export const Template = codeInput.Template;\n");
    await codeInputMjs.writeFile("export const CodeInput = codeInput.CodeInput;\n");
    await codeInputMjs.writeFile("export const registerTemplate = codeInput.registerTemplate;\n");
    await codeInputMjs.writeFile("export default { Plugin, Template, CodeInput, registerTemplate };\n");

    codeInputJs.close();
    codeInputMjs.close();
}

//   code-input.d.mts: (../code-input.d.ts without the plugin/template namespaces) + ESM
{
    const codeInputDTs = await open("../code-input.d.ts", "r");
    const codeInputDMts = await open("code-input.d.mts", "w");
    await codeInputDMts.writeFile(AUTOGENERATED_NOTICE);
    // Miss out no-ESM specific code at the top
    // Code before first namespace, after no-ESM specific code
    let copyingCode = false;
    for await (const line of codeInputDTs.readLines()) {
        if(line.includes("ESM-SUPPORT-START-NAMESPACE-1") || line.includes("ESM-SUPPORT-START-NAMESPACE-2")) {
            copyingCode = false;
        }
        if(copyingCode) {
            await codeInputDMts.writeFile(line+"\n");
        }
        if(line.includes("ESM-SUPPORT-END-NOESM-SPECIFIC") || line.includes("ESM-SUPPORT-END-NAMESPACE-1") || line.includes("ESM-SUPPORT-END-NAMESPACE-2")) {
            copyingCode = true; // After is code to copy - this line missed out
        }
    }
    await codeInputDMts.writeFile("export default { Plugin, Template, CodeInput, registerTemplate };\n");

    await codeInputDTs.close();
    await codeInputDMts.close();
}

// Templates
{
    try {
        await mkdir("templates");
    } catch(error) {
        if(error.code !== "EEXIST") {
            // Ignore directory already existing; throw all other errors.
            throw error;
        }
    }

    let codeInputDTs = await open("../code-input.d.ts", "r");
    // For each template name prepared for ESM support from the d.ts file:
    const templateNames = [];
    for await (const line of codeInputDTs.readLines()) {
        const templatesOnThisLine = line.match(/(?<=ESM\-SUPPORT\-START\-TEMPLATE\-)[A-Za-z]+/g);
        if(templatesOnThisLine !== null) {
            for(const templateName of templatesOnThisLine) {
                templateNames.push(templateName);
            }
        }
    }
    await codeInputDTs.close();

    //   templates/*.mjs
    templateNames.forEach(async (templateName) => {
        const codeInputJs = await open("../code-input.js", "r");
        const templateMjs = await open("templates/"+templateName+".mjs", "w")
        await templateMjs.writeFile(AUTOGENERATED_NOTICE);
        // Imports
        await templateMjs.writeFile("import { Template } from \"../code-input.mjs\";\n");
        // Code after start and before end of this template, making use of the imported Template, not codeInput.Template
        let copyingCode = false;
        let templateClassName = null;
        for await (const line of codeInputJs.readLines()) {
            if(line.includes("ESM-SUPPORT-END-TEMPLATE-"+templateName)) {
                break;
            }
            if(copyingCode) {
                if(templateClassName === null) {
                    const templateClassNameThisLine = line.match(/(?<=class )[A-Za-z]+(?= extends codeInput.Template)/);
                    if(templateClassNameThisLine !== null && templateClassNameThisLine.length > 0) {
                        templateClassName = templateClassNameThisLine;
                    }
                }
                await templateMjs.writeFile(line.replaceAll("codeInput.Template", "Template")+"\n");
            }
            if(line.includes("ESM-SUPPORT-START-TEMPLATE-"+templateName)) {
                copyingCode = true; // After is code to copy - this line missed out
            }
        }
        // Export, assuming the name of the function is the same as the name of the file.
        await templateMjs.writeFile("export default "+templateClassName+";\n");
        await codeInputJs.close();
        await templateMjs.close();
    });

    //   templates/*.d.mts
    templateNames.forEach(async (templateName) => {
        const codeInputDTs = await open("../code-input.d.ts", "r");
        const templateDMts = await open("templates/"+templateName+".d.mts", "w")
        await templateDMts.writeFile(AUTOGENERATED_NOTICE);
        // Imports
        await templateDMts.writeFile("import { Template, Plugin } from \"../code-input.d.mts\";\n");
        // Code after start and before end of this template, making use of the imported Template, not codeInput.Template
        let copyingCode = false;
        let classSeen = false;
        for await (let line of codeInputDTs.readLines()) {
            if(line.includes("ESM-SUPPORT-END-TEMPLATE-"+templateName)) {
                break;
            }
            if(copyingCode) {
                if(/( |\t)*class.*/.test(line) && !classSeen) {
                    // Replace only first occurrence
                    line = line.replace("class", "export default class");
                    classSeen = true;
                }
                await templateDMts.writeFile(line.replaceAll("codeInput.Template", "Template").replaceAll("codeInput.Plugin", "Plugin")+"\n");
            }
            if(line.includes("ESM-SUPPORT-START-TEMPLATE-"+templateName)) {
                copyingCode = true; // After is code to copy - this line missed out
            }
        }
        await codeInputDTs.close();
        await templateDMts.close();
    });
}

// Plugins
{
    try {
        await mkdir("plugins");
    } catch(error) {
        if(error.code !== "EEXIST") {
            // Ignore directory already existing; throw all other errors.
            throw error;
        }
    }

    let codeInputDTs = await open("../code-input.d.ts", "r");
    // For each plugin name prepared for ESM support from the d.ts file:
    const pluginNames = [];
    for await (const line of codeInputDTs.readLines()) {
        const pluginsOnThisLine = line.match(/(?<=ESM\-SUPPORT\-START\-PLUGIN\-)[A-Za-z\-]+/g);
        if(pluginsOnThisLine !== null) {
            for(const templateName of pluginsOnThisLine) {
                pluginNames.push(templateName);
            }
        }
    }
    await codeInputDTs.close();

    //   plugins/*.mjs
    for(let i = 0; i < pluginNames.length; i++) {
        const pluginName = pluginNames[i];
        const pluginJs = await open("../plugins/"+pluginName+".js", "r");
        const pluginMjs = await open("plugins/"+pluginName+".mjs", "w")
        await pluginMjs.writeFile(AUTOGENERATED_NOTICE);
        // Imports
        await pluginMjs.writeFile("import { Plugin } from \"../code-input.mjs\";\n")
        // Plugin syntax is to be stored in an object; do so temporarily.
        await pluginMjs.writeFile("const plugins = {};\n");
        // Code from this plugin"s file, making use of the imported Plugin, not codeInput.Plugin, and of the created plugins object, not codeInput.plugins
        let pluginClassName = null;
        for await (const line of pluginJs.readLines()) {
            if(pluginClassName === null) {
                const pluginClassNameThisLine = line.match(/(?<=codeInput\.plugins\.)[A-Za-z]+/);
                if(pluginClassNameThisLine !== null && pluginClassNameThisLine.length > 0) {
                    pluginClassName = pluginClassNameThisLine;
                }
            }

            await pluginMjs.writeFile(line.replaceAll("codeInput.Plugin", "Plugin").replaceAll("codeInput.plugins", "plugins")+"\n");
        }

        // Export, assuming the name of the function is the same as the name of the file.
        await pluginMjs.writeFile("export default plugins."+pluginClassName+";\n");

        await pluginJs.close();
        await pluginMjs.close();
    }

    //   plugins/*.d.mts
    for(let i = 0; i < pluginNames.length; i++) {
        const pluginName = pluginNames[i];
        const codeInputDTs = await open("../code-input.d.ts", "r");
        const pluginDMts = await open("plugins/"+pluginName+".d.mts", "w")
        await pluginDMts.writeFile(AUTOGENERATED_NOTICE);
        // Imports
        await pluginDMts.writeFile("import { Plugin, CodeInput } from \"../code-input.d.mts\";\n");
        // Code after start and before end of this plugin, making use of the imported Template, not codeInput.Template
        let copyingCode = false;
        let functionSeen = false;
        for await (let line of codeInputDTs.readLines()) {
            if(line.includes("ESM-SUPPORT-END-PLUGIN-"+pluginName)) {
                break;
            }
            if(copyingCode) {
                if(/( |\t)*class.*/.test(line) && !functionSeen) {
                    // Replace only first occurrence
                    line = line.replace("class", "export default class");
                    functionSeen = true;
                }
                await pluginDMts.writeFile(line.replaceAll("codeInput.Plugin", "Plugin").replaceAll("codeInput.CodeInput", "CodeInput")+"\n");
            }
            if(line.includes("ESM-SUPPORT-START-PLUGIN-"+pluginName)) {
                copyingCode = true; // After is code to copy - this line missed out
            }
        }
        await codeInputDTs.close();
        await pluginDMts.close();
    }
}
