// relative path: utils/generator/cypressHandlers.js

import { getConnectedElement, getOutgoerByHandle } from './helpers';

// Helper to convert variable path to Cypress accessor
// Supports dot notation: ${user.email} -> Cypress.env("user").email
// Supports nested paths: ${user.profile.name} -> Cypress.env("user").profile.name
const formatVarAccess = (varPath) => {
    const parts = varPath.split('.');
    if (parts.length === 1) {
        return `Cypress.env("${parts[0]}")`;
    }
    // For nested access: user.profile.email -> Cypress.env("user").profile.email
    const rootVar = parts[0];
    const nestedPath = parts.slice(1).join('.');
    return `Cypress.env("${rootVar}").${nestedPath}`;
};

// Helper to format values for Cypress
const formatCyValue = (value) => {
    if (value === undefined || value === null) return '""';
    let strVal = String(value).trim();

    // Variable reference with dot notation support: ${varName} or ${user.email}
    if (strVal.includes('${')) {
        const replaced = strVal.replace(/\$\{([^}]+)\}/g, (_, varPath) => {
            return `" + ${formatVarAccess(varPath)} + "`;
        });
        return `"${replaced}"`.replace(/"" \+ /g, '').replace(/ \+ ""/g, '');
    }

    // Math expression starting with =
    if (strVal.startsWith('=')) {
        let expression = strVal.substring(1);
        expression = expression.replace(/\$\{([^}]+)\}/g, (_, varPath) => {
            return formatVarAccess(varPath);
        });
        return expression;
    }

    // Numeric
    if (!isNaN(parseFloat(strVal)) && isFinite(strVal)) {
        return strVal;
    }

    return `"${strVal}"`;
};

// UPDATED: Selector Logic
const getCySelector = (type, value) => {
    // FIX: Default to 'ID' if type is undefined (happens if user drags node but doesn't change dropdown)
    const selectorType = type || 'ID';
    let selector = value;

    // Handle variables in selector
    if (String(value).includes('${')) {
        selector = value.replace(/\$\{([^}]+)\}/g, '" + Cypress.env("$1") + "');
    }

    if (selectorType === 'ID') return `"#${selector.replace('#', '')}"`;
    if (selectorType === 'CSS') return `"${selector}"`;
    if (selectorType === 'Name') return `"[name='${selector}']"`;
    
    // XPath requires plugin
    if (selectorType === 'XPath') return `// Note: requires 'cypress-xpath'\ncy.xpath("${selector}")`;
    
    // Fallback
    return `"${selector}"`;
};

export const cypressHandlers = {

    // --- START SESSION ---
    start_session: (node, context) => {
        return context.processNext(node);
    },

    // --- SET VARIABLE ---
    set_variable: (node, context) => {
        const { indent } = context;
        const name = node.data.varName || 'my_var';
        const val = formatCyValue(node.data.varValue);
        
        return `${indent}Cypress.env("${name}", ${val});\n` + context.processNext(node);
    },

    // --- INTERACT ---
    interact: (node, context) => {
        const { edges, nodes, indent } = context;
        const el = getConnectedElement(node, edges, nodes);
        
        if (!el) return `${indent}// Warning: No element connected\n` + context.processNext(node);

        const sel = getCySelector(el.selectorType, el.selectorValue);
        const action = node.data.action || "Click";
        const val = formatCyValue(node.data.value);
        const saveTo = node.data.saveTo;

        let output = "";
        const isXPath = el.selectorType === 'XPath';
        const base = isXPath ? `cy.xpath(${sel.split('cy.xpath(')[1]}` : `cy.get(${sel})`;

        switch (action) {
            case "Click":
                output += `${indent}${base}.click();\n`;
                break;
            case "Type":
                output += `${indent}${base}.type(${val});\n`;
                break;
            case "Clear":
                output += `${indent}${base}.clear();\n`;
                break;
            case "Hover":
                output += `${indent}${base}.trigger('mouseover');\n`;
                break;
            case "Get Text":
                if(saveTo) {
                    output += `${indent}${base}.invoke('text').then((txt) => Cypress.env("${saveTo}", txt));\n`;
                }
                break;
            default:
                output += `${indent}// Unknown action ${action}\n`;
        }

        return output + context.processNext(node);
    },

    // --- WAIT ---
    wait: (node, context) => {
        const { indent } = context;
        const waitType = node.data.waitType || 'time';

        if (waitType === 'network') {
            const alias = node.data.networkAlias || 'request';
            return `${indent}cy.wait('@${alias}');\n` + context.processNext(node);
        }

        const rawDuration = node.data.duration || 1;
        const ms = `(${formatCyValue(rawDuration)}) * 1000`;
        return `${indent}cy.wait(${ms});\n` + context.processNext(node);
    },

    // --- SCREENSHOT ---
    screenshot: (node, context) => {
        const { indent } = context;
        const filename = node.data.filename || 'screenshot';
        return `${indent}cy.screenshot("${filename}");\n` + context.processNext(node);
    },

    // --- ASSERT ---
    assert: (node, context) => {
        const { edges, nodes, indent } = context;
        const el = getConnectedElement(node, edges, nodes);
        const cond = node.data.condition || 'Is Visible';
        const val = formatCyValue(node.data.value);

        let output = "";

        // URL-based assertions (no element needed)
        if (cond === 'URL Contains') {
            output += `${indent}cy.url().should('include', ${val});\n`;
        } else if (cond === 'URL Matches Regex') {
            // Remove surrounding slashes if present
            let pattern = node.data.value || '';
            if (pattern.startsWith('/') && pattern.endsWith('/')) {
                pattern = pattern.slice(1, -1);
            }
            output += `${indent}cy.url().should('match', /${pattern}/);\n`;
        } else if (cond === 'Network Status') {
            // Network response status assertion
            const alias = node.data.networkAlias || 'request';
            const expectedStatus = node.data.expectedStatus || 200;
            output += `${indent}cy.wait('@${alias}').its('response.statusCode').should('eq', ${expectedStatus});\n`;
        } else if (el) {
            // Element-based assertions
            const sel = getCySelector(el.selectorType, el.selectorValue);
            const isXPath = el.selectorType === 'XPath';
            const base = isXPath ? `cy.xpath(${sel.split('cy.xpath(')[1]}` : `cy.get(${sel})`;

            if (cond === 'Is Visible') {
                output += `${indent}${base}.should('be.visible');\n`;
            } else if (cond === 'Contains Text') {
                output += `${indent}${base}.should('contain.text', ${val});\n`;
            } else if (cond === 'Has Class') {
                const className = node.data.value || '';
                output += `${indent}${base}.should('have.class', '${className}');\n`;
            } else if (cond === 'Property Equals') {
                const propName = node.data.propertyName || 'value';
                output += `${indent}${base}.should('have.prop', '${propName}', ${val});\n`;
            }
        }

        return output + context.processNext(node);
    },

    // --- CONDITION ---
    condition: (node, context) => {
        const { edges, nodes, indent, indentLevel, processNodeFn } = context;
        const el = getConnectedElement(node, edges, nodes);
        const cond = node.data.condition || 'Is Visible';
        
        let output = `${indent}// Condition Check: ${cond}\n`;
        let checkLogic = "";

        if (cond === 'URL Contains') {
            const val = formatCyValue(node.data.value);
            checkLogic = `cy.url().then(url => { return url.includes(${val}); })`;
        } else if (el) {
            const sel = getCySelector(el.selectorType, el.selectorValue);
            // Check length and visibility without failing test if element missing
            if (cond === 'Is Visible') {
                checkLogic = `cy.get('body').then($body => { 
        return $body.find(${sel}).length > 0 && $body.find(${sel}).is(':visible'); 
    })`;
            } else if (cond === 'Contains Text') {
                const val = formatCyValue(node.data.value);
                checkLogic = `cy.get('body').then($body => { 
        return $body.find(${sel}).text().includes(${val}); 
    })`;
            }
        }

        output += `${indent}${checkLogic}.then(isTrue => {\n`;
        output += `${indent}    if (isTrue) {\n`;
        
        const trueNode = getOutgoerByHandle(node, edges, nodes, 'true-out');
        if (trueNode) output += processNodeFn(trueNode, indentLevel + 2);
        
        output += `${indent}    } else {\n`;

        const falseNode = getOutgoerByHandle(node, edges, nodes, 'false-out');
        if (falseNode) output += processNodeFn(falseNode, indentLevel + 2);

        output += `${indent}    }\n`;
        output += `${indent}});\n`;

        return output; 
    },

    // --- LOOP ---
    loop: (node, context) => {
        const { edges, nodes, indent, indentLevel, processNodeFn } = context;
        const loopType = node.data.loopType || 'Counter';

        let output = "";

        if (loopType === 'Counter') {
            const count = node.data.count || 1;
            output += `${indent}Cypress._.times(${count}, (i) => {\n`;
            output += `${indent}    cy.log('Loop iteration ' + (i+1));\n`;

            const bodyNode = getOutgoerByHandle(node, edges, nodes, 'loop-body');
            if(bodyNode) output += processNodeFn(bodyNode, indentLevel + 1);

            output += `${indent}});\n`;
        } else {
             output += `${indent}// While loops not supported in this Cypress generator\n`;
        }

        const doneNode = getOutgoerByHandle(node, edges, nodes, 'loop-done');
        if (doneNode) output += processNodeFn(doneNode, indentLevel);

        return output;
    },

    // --- NETWORK INTERCEPT ---
    network: (node, context) => {
        const { indent } = context;
        const method = node.data.method || 'GET';
        const urlPattern = node.data.urlPattern || '**/api/*';
        const alias = node.data.alias || 'request';
        const mockResponse = node.data.mockResponse || false;

        let output = '';

        if (mockResponse) {
            const statusCode = node.data.statusCode || 200;
            let body = node.data.responseBody || '{}';

            // Try to parse and re-stringify for proper formatting
            try {
                body = JSON.stringify(JSON.parse(body));
            } catch {
                body = '{}';
            }

            output += `${indent}cy.intercept('${method}', '${urlPattern}', {\n`;
            output += `${indent}    statusCode: ${statusCode},\n`;
            output += `${indent}    body: ${body}\n`;
            output += `${indent}}).as('${alias}');\n`;
        } else {
            output += `${indent}cy.intercept('${method}', '${urlPattern}').as('${alias}');\n`;
        }

        return output + context.processNext(node);
    },

    // --- LOAD FIXTURE ---
    load_fixture: (node, context) => {
        const { indent } = context;
        const filePath = node.data.filePath || 'data.json';
        const varName = node.data.varName || 'fixtureData';

        let output = '';
        output += `${indent}cy.fixture('${filePath}').then((data) => {\n`;
        output += `${indent}    Cypress.env('${varName}', data);\n`;
        output += `${indent}});\n`;

        return output + context.processNext(node);
    },

    // --- CUSTOM COMMAND ---
    custom_command: (node, context) => {
        const { indent } = context;
        const commandName = node.data.commandName || 'myCommand';
        const rawArgs = node.data.arguments || '';

        // Parse and format arguments
        const args = rawArgs.split(',')
            .map(arg => arg.trim())
            .filter(Boolean)
            .map(arg => formatCyValue(arg))
            .join(', ');

        const output = `${indent}cy.${commandName}(${args});\n`;

        return output + context.processNext(node);
    }
};