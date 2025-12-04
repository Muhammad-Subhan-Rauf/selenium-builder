// Original relative path: utils/generator/blockHandlers.js

import { getConnectedElement, getOutgoerByHandle, getPythonSelector, formatPythonValue } from './helpers';

export const handlers = {

    // --- SET VARIABLE ---
    set_variable: (node, context) => {
        const { indent } = context;
        const name = node.data.varName || 'my_var';
        const rawVal = node.data.varValue || '';
        
        // Use formatPythonValue to handle strings vs expressions (=)
        const val = formatPythonValue(rawVal);
        
        return `${indent}self.vars["${name}"] = ${val}\n` + context.processNext(node);
    },

    // --- INTERACT ---
    interact: (node, context) => {
        const { edges, nodes, indent } = context;
        const el = getConnectedElement(node, edges, nodes);
        let output = "";

        if (!el) {
            output += `${indent}log_info("Warning: Interact node has no element connected")\n`;
            return output + context.processNext(node);
        }

        // Build Python selector
        const sel = getPythonSelector(el.selectorType, el.selectorValue);

        // Determine action
        const action = node.data.action || "Click";
        const rawValue = node.data.value || "";
        const saveTo = node.data.saveTo; // For "Get Text"

        // Format value for Type action (handle variables)
        const pyValue = formatPythonValue(rawValue);

        // Element Name for logging
        const elName = el.name || "element";

        output += `${indent}log_step("Action: ${action} on '${elName}'")\n`;
        const base = `${indent}driver.find_element(${sel})`;

        switch (action) {
            case "Click":
                output += `${base}.click()\n`;
                break;

            case "Type":
                output += `${base}.send_keys(${pyValue})\n`;
                break;

            case "Clear":
                output += `${base}.clear()\n`;
                break;

            case "Hover":
                output += `${indent}element = ${base}\n`;
                output += `${indent}webdriver.ActionChains(driver).move_to_element(element).perform()\n`;
                break;

            case "Get Text":
                output += `${indent}txt_val = ${base}.text\n`;
                if(saveTo) {
                    output += `${indent}self.vars["${saveTo}"] = txt_val\n`;
                    output += `${indent}log_info(f"Saved text '{txt_val}' to variable '${saveTo}'")\n`;
                }
                break;

            default:
                output += `${indent}log_info("Unknown action '${action}'")\n`;
        }

        return output + context.processNext(node);
    },

    // --- WAIT / SLEEP ---
    wait: (node, context) => {
        const { indent } = context;
        const waitType = node.data.waitType || 'time';

        let output = '';

        // Handle network wait type (Selenium doesn't support this natively)
        if (waitType === 'network') {
            const alias = node.data.networkAlias || 'request';
            output += `${indent}# Wait for network request '@${alias}'\n`;
            output += `${indent}# Note: Selenium does not support native network wait.\n`;
            output += `${indent}# Consider using selenium-wire or explicit waits instead.\n`;
            output += `${indent}time.sleep(1)  # Fallback: wait 1 second\n`;
            return output + context.processNext(node);
        }

        const rawDuration = node.data.duration || 1;
        const pyDuration = formatPythonValue(rawDuration);

        // If it's a hardcoded number, we can log a message. If it's a variable, difficult to know value at generation time.
        if (!String(rawDuration).includes('$')) {
             if (parseFloat(rawDuration) >= 1) {
                output += `${indent}log_step("Waiting for ${rawDuration} seconds...")\n`;
             }
        } else {
             output += `${indent}log_step(f"Waiting for {${pyDuration}} seconds...")\n`;
        }

        // Wrap in float() safely
        output += `${indent}time.sleep(float(${pyDuration}))\n`;

        return output + context.processNext(node);
    },

    // --- SCREENSHOT ---
    screenshot: (node, context) => {
        const { indent } = context;
        const directory = node.data.directory || './screenshots';
        const filename = node.data.filename || 'screenshot';
        const useCounter = node.data.autoIncrement || false;

        let output = `${indent}# Capture Screenshot\n`;
        output += `${indent}if not os.path.exists("${directory}"):\n`;
        output += `${indent}    os.makedirs("${directory}")\n`;

        if (useCounter) {
            output += `${indent}self.screenshot_counter += 1\n`;
            output += `${indent}save_path = f"${directory}/${filename}_{self.screenshot_counter}.png"\n`;
        } else {
            output += `${indent}save_path = f"${directory}/${filename}.png"\n`;
        }

        output += `${indent}driver.save_screenshot(save_path)\n`;
        output += `${indent}log_info(f"Screenshot saved: {save_path}")\n`;

        return output + context.processNext(node);
    },

    // --- ASSERT ---
    assert: (node, context) => {
        const { edges, nodes, indent } = context;
        const el = getConnectedElement(node, edges, nodes);
        const cond = node.data.condition || 'Is Visible';
        const rawVal = node.data.value || '';
        const pyVal = formatPythonValue(rawVal);
        const printRes = node.data.printResults || false;

        let check = '';
        let msg = '';
        let output = '';

        // Element-based assertions
        if (cond === 'Is Visible' && el) {
            check = `driver.find_element(${getPythonSelector(el.selectorType, el.selectorValue)}).is_displayed()`;
            msg = `Element visible`;
        } else if (cond === 'Contains Text' && el) {
            const sel = getPythonSelector(el.selectorType, el.selectorValue);
            output += `${indent}el = driver.find_element(${sel})\n`;
            output += `${indent}txt = el.text or el.get_attribute("value") or ""\n`;
            check = `str(${pyVal}) in txt`;
            msg = `Element contains text`;
        } else if (cond === 'Has Class' && el) {
            const sel = getPythonSelector(el.selectorType, el.selectorValue);
            const className = node.data.value || '';
            output += `${indent}el = driver.find_element(${sel})\n`;
            output += `${indent}el_classes = el.get_attribute("class") or ""\n`;
            check = `"${className}" in el_classes.split()`;
            msg = `Element has class '${className}'`;
        } else if (cond === 'Property Equals' && el) {
            const sel = getPythonSelector(el.selectorType, el.selectorValue);
            const propName = node.data.propertyName || 'value';
            output += `${indent}el = driver.find_element(${sel})\n`;
            output += `${indent}prop_val = el.get_attribute("${propName}")\n`;
            check = `str(prop_val) == str(${pyVal})`;
            msg = `Element property '${propName}' equals expected`;
        }
        // URL-based assertions
        else if (cond === 'URL Contains') {
            check = `str(${pyVal}) in driver.current_url`;
            msg = `URL contains text`;
        } else if (cond === 'URL Matches Regex') {
            let pattern = node.data.value || '';
            // Remove surrounding slashes if present
            if (pattern.startsWith('/') && pattern.endsWith('/')) {
                pattern = pattern.slice(1, -1);
            }
            output += `${indent}import re\n`;
            check = `re.search(r"${pattern}", driver.current_url)`;
            msg = `URL matches regex`;
        }
        // Network assertions (not supported in Selenium)
        else if (cond === 'Network Status') {
            const alias = node.data.networkAlias || 'request';
            const expectedStatus = node.data.expectedStatus || 200;
            output += `${indent}# Assert Network Status: @${alias} == ${expectedStatus}\n`;
            output += `${indent}# Note: Selenium does not support native network assertion.\n`;
            output += `${indent}# Consider using selenium-wire for network inspection.\n`;
            return output + context.processNext(node);
        }

        if (check) {
            output += `${indent}log_step("Asserting: ${cond}")\n`;
            output += `${indent}try:\n`;
            output += `${indent}    assert ${check}\n`;
            if (printRes) output += `${indent}    log_pass("${msg}")\n`;
            output += `${indent}except AssertionError:\n`;
            output += `${indent}    log_fail("${msg}")\n`;
            output += `${indent}    raise\n`;
        }

        return output + context.processNext(node);
    },

    // --- CONDITION ---
    condition: (node, context) => {
        const { edges, nodes, indent, indentLevel, processNodeFn } = context;
        const el = getConnectedElement(node, edges, nodes);
        const cond = node.data.condition || 'Is Visible';
        const rawVal = node.data.value || '';
        const pyVal = formatPythonValue(rawVal);
        let output = '';
        let ifLine = 'if True:';

        output += `${indent}log_info("Condition Check: ${cond}...")\n`;

        if (cond === 'Is Visible' && el) {
            const sel = getPythonSelector(el.selectorType, el.selectorValue);
            output += `${indent}elements = driver.find_elements(${sel})\n`;
            ifLine = `if len(elements) > 0 and elements[0].is_displayed():`;
        } else if (cond === 'Contains Text' && el) {
            const sel = getPythonSelector(el.selectorType, el.selectorValue);
            output += `${indent}try: el_txt = driver.find_element(${sel}).text\n`;
            output += `${indent}except: el_txt = ""\n`;
            ifLine = `if str(${pyVal}) in el_txt:`;
        } else if (cond === 'URL Contains') {
            ifLine = `if str(${pyVal}) in driver.current_url:`;
        }

        output += `${indent}${ifLine}\n`;
        output += `${indent}    log_info(">> Condition matched (TRUE)")\n`;

        const trueNode = getOutgoerByHandle(node, edges, nodes, 'true-out');
        if (trueNode) output += processNodeFn(trueNode, indentLevel + 1);
        else output += `${indent}    pass\n`;

        const falseNode = getOutgoerByHandle(node, edges, nodes, 'false-out');
        if (falseNode) {
            output += `${indent}else:\n`;
            output += `${indent}    log_info(">> Condition failed (FALSE)")\n`;
            output += processNodeFn(falseNode, indentLevel + 1);
        }
        return output;
    },

    // --- LOOP ---
    loop: (node, context) => {
        const { edges, nodes, indent, indentLevel, processNodeFn } = context;
        let output = '';
        const loopType = node.data.loopType || 'Counter';

        if (loopType === 'Counter') {
            const rawCount = node.data.count || 1;
            const pyCount = formatPythonValue(rawCount);
            
            output += `${indent}log_info(f"Starting Loop ({${pyCount}} iterations)")\n`;
            output += `${indent}for i in range(int(${pyCount})):\n`;
            output += `${indent}    log_info(f"--- Loop Iteration {i+1} ---")\n`;
        } else {
            output += `${indent}log_info("Starting While Loop")\n`;
            const cond = node.data.condition || 'Is Visible';
            const el = getConnectedElement(node, edges, nodes);
            if (cond === 'Is Visible' && el) {
                const sel = getPythonSelector(el.selectorType, el.selectorValue);
                output += `${indent}while True:\n`;
                output += `${indent}    try:\n`;
                output += `${indent}        if not driver.find_element(${sel}).is_displayed(): break\n`;
                output += `${indent}    except: break\n`;
            } else {
                output += `${indent}while True:\n`;
            }
        }

        const bodyNode = getOutgoerByHandle(node, edges, nodes, 'loop-body');
        if (bodyNode) {
            output += processNodeFn(bodyNode, indentLevel + 1);
        } else {
            output += `${indent}    pass\n`;
        }

        output += `${indent}log_info("Loop Finished")\n`;

        const doneNode = getOutgoerByHandle(node, edges, nodes, 'loop-done');
        if (doneNode) {
            output += processNodeFn(doneNode, indentLevel);
        }

        return output;
    },

    // --- START SESSION ---
    start_session: (node, context) => {
        return context.processNext(node);
    },

    // --- NETWORK INTERCEPT ---
    // Note: Selenium doesn't have native network interception like Cypress
    // This generates a comment placeholder for manual implementation
    network: (node, context) => {
        const { indent } = context;
        const method = node.data.method || 'GET';
        const urlPattern = node.data.urlPattern || '**/api/*';
        const alias = node.data.alias || 'request';
        const mockResponse = node.data.mockResponse || false;

        let output = '';
        output += `${indent}# Network Intercept: ${method} ${urlPattern} (alias: ${alias})\n`;
        output += `${indent}# Note: Selenium does not support native network interception.\n`;
        output += `${indent}# Consider using selenium-wire or mitmproxy for request mocking.\n`;

        if (mockResponse) {
            const statusCode = node.data.statusCode || 200;
            output += `${indent}# Mock Response: Status ${statusCode}\n`;
        }

        return output + context.processNext(node);
    },

    // --- LOAD FIXTURE ---
    load_fixture: (node, context) => {
        const { indent } = context;
        const filePath = node.data.filePath || 'data.json';
        const varName = node.data.varName || 'fixtureData';

        let output = '';
        output += `${indent}# Load fixture from ${filePath}\n`;
        output += `${indent}import json\n`;
        output += `${indent}with open("${filePath}", "r") as f:\n`;
        output += `${indent}    self.vars["${varName}"] = json.load(f)\n`;
        output += `${indent}log_step(f"Loaded fixture '{filePath}' into variable '${varName}'")\n`;

        return output + context.processNext(node);
    },

    // --- CUSTOM COMMAND ---
    // For Python/Selenium, this generates a function call
    // Assumes the function is defined elsewhere in the test file or imported
    custom_command: (node, context) => {
        const { indent } = context;
        const commandName = node.data.commandName || 'my_command';
        const rawArgs = node.data.arguments || '';

        // Parse and format arguments
        const args = rawArgs.split(',')
            .map(arg => arg.trim())
            .filter(Boolean)
            .map(arg => formatPythonValue(arg))
            .join(', ');

        let output = '';
        output += `${indent}# Custom command: ${commandName}\n`;
        output += `${indent}${commandName}(${args})\n`;

        return output + context.processNext(node);
    }
};