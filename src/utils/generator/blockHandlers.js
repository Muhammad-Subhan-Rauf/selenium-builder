import { getConnectedElement, getOutgoerByHandle, getPythonSelector } from './helpers';

export const handlers = {

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
        const value = node.data.value || "";

        // ---------------------------
        // Helper to generate readable element name
        // ---------------------------
        const getReadableName = (el) => {
            let name = el.name?.trim();
            if (name) return name;

            const tag = el.tagName?.toLowerCase();
            const label = el.text || el.innerText || el.value || "";

            // Start forming a readable name
            if (tag) {
                name = label ? `${tag}: ${label}` : tag;
            } else {
                name = "element";
            }

            // Add selector details for uniqueness
            if (el.selectorType && el.selectorValue) {
                name += ` (${el.selectorType}: ${el.selectorValue})`;
            }

            return name;
        };

        const elName = getReadableName(el);

        // Log the action cleanly
        output += `${indent}log_step("Action: ${action} on '${elName}'")\n`;

        // ---------------------------
        // Python action generation
        // ---------------------------
        const base = `${indent}driver.find_element(${sel})`;

        switch (action) {

            case "Click":
                output += `${base}.click()\n`;
                break;

            case "Type":
                output += `${base}.send_keys("${value}")\n`;
                break;

            case "Clear":
                output += `${base}.clear()\n`;
                break;

            case "Hover":
                output += `${indent}element = ${base}\n`;
                output += `${indent}webdriver.ActionChains(driver).move_to_element(element).perform()\n`;
                break;

            default:
                output += `${indent}log_info("Unknown action '${action}' — no operation performed")\n`;
        }

        return output + context.processNext(node);
    },

    // --- WAIT / SLEEP ---
    wait: (node, context) => {
        const { indent } = context;
        const duration = node.data.duration || 1;

        // No need to spam logs for short waits, but useful for long ones
        output = '';
        if (duration >= 1) {
            output += `${indent}log_step("Waiting for ${duration} seconds...")\n`;
        }
        output += `${indent}time.sleep(${duration})\n`;

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
        const val = node.data.value || '';
        const printRes = node.data.printResults || false;

        let check = '';
        let msg = '';
        let output = '';

        if (cond === 'Is Visible' && el) {
            check = `driver.find_element(${getPythonSelector(el.selectorType, el.selectorValue)}).is_displayed()`;
            msg = `Element '${el.name || el.selectorValue}' is visible`;
        } else if (cond === 'Contains Text' && el) {
            const sel = getPythonSelector(el.selectorType, el.selectorValue);
            output += `${indent}el = driver.find_element(${sel})\n`;
            output += `${indent}txt = el.text or el.get_attribute("value") or ""\n`;
            check = `"${val}" in txt`;
            msg = `Element '${el.name || el.selectorValue}' contains '${val}'`;
        } else if (cond === 'URL Contains') {
            check = `"${val}" in driver.current_url`;
            msg = `URL contains '${val}'`;
        } else if (cond === 'Title Equals') {
            check = `driver.title == "${val}"`;
            msg = `Title is '${val}'`;
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
        const val = node.data.value || '';
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
            ifLine = `if "${val}" in el_txt:`;
        } else if (cond === 'URL Contains') {
            ifLine = `if "${val}" in driver.current_url:`;
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
            const count = node.data.count || 1;
            output += `${indent}log_info("Starting Loop (${count} iterations)")\n`;
            output += `${indent}for i in range(${count}):\n`;
            output += `${indent}    log_info(f"--- Loop Iteration {i+1}/{count} ---")\n`;
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
    }
};