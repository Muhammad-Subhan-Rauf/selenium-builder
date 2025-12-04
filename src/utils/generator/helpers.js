/**
 * Traverses React Flow edges to find the target node connected to a specific handle.
 */
export const getOutgoerByHandle = (node, edges, nodes, handleId) => {
    const edge = edges.find(e => e.source === node.id && e.sourceHandle === handleId);
    if (!edge) return null;
    return nodes.find(n => n.id === edge.target);
};

/**
 * Finds the next logical execution step (Flow Output).
 */
export const getNextNode = (node, edges, nodes) => {
    const edge = edges.find(e =>
        e.source === node.id &&
        (e.sourceHandle === 'flow-out' ||
         node.type === 'start_session' ||
         node.type === 'wait' ||
         node.type === 'screenshot' ||
         node.type === 'set_variable' ||
         node.type === 'network' ||
         node.type === 'load_fixture' ||
         node.type === 'custom_command')
    );
    if (!edge) return null;
    return nodes.find(n => n.id === edge.target);
};

/**
 * Finds the Element data connected to a logic node's input.
 */
export const getConnectedElement = (node, edges, nodes) => {
    const connectedEdge = edges.find(e => e.target === node.id && e.targetHandle === 'data-in');
    if (!connectedEdge) return null;
    const elementNode = nodes.find(n => n.id === connectedEdge.source);
    return elementNode ? elementNode.data : null;
};

/**
 * Helper to convert variable path to Python accessor
 * Supports dot notation: ${user.email} -> self.vars.get("user")["email"]
 * Supports nested paths: ${user.profile.name} -> self.vars.get("user")["profile"]["name"]
 */
const formatPyVarAccess = (varPath) => {
    const parts = varPath.split('.');
    if (parts.length === 1) {
        return `self.vars.get("${parts[0]}")`;
    }
    // For nested access: user.profile.email -> self.vars.get("user")["profile"]["email"]
    const rootVar = parts[0];
    const nestedAccess = parts.slice(1).map(p => `["${p}"]`).join('');
    return `self.vars.get("${rootVar}")${nestedAccess}`;
};

/**
 * Formats a value for Python.
 * - Handles Math/Expressions starting with '=': =${i}+1 -> self.vars.get("i")+1
 * - Handles Variables: ${varName} -> self.vars.get("varName")
 * - Handles Dot Notation: ${user.email} -> self.vars.get("user")["email"]
 * - Handles Strings/Numbers
 */
export const formatPythonValue = (value) => {
    if (value === undefined || value === null) return '""';

    let strVal = String(value).trim();

    // CASE 1: Expression (Math) -> Starts with '='
    // Example: =${i} + 1  --->  self.vars.get("i") + 1
    // Example: =${user.count} + 1  --->  self.vars.get("user")["count"] + 1
    if (strVal.startsWith('=')) {
        let expression = strVal.substring(1); // Remove '='
        // Replace all ${varName} or ${var.path} with proper accessor
        expression = expression.replace(/\$\{([^}]+)\}/g, (_, varPath) => {
            return formatPyVarAccess(varPath);
        });
        return expression;
    }

    // CASE 2: Single Variable Reference -> ${my_var} or ${user.email}
    // We treat this as a direct variable access (preserving its type, e.g. int vs string)
    if (strVal.startsWith('${') && strVal.endsWith('}') && strVal.match(/\$\{([^}]+)\}/g).length === 1) {
        const varPath = strVal.slice(2, -1);
        return formatPyVarAccess(varPath);
    }

    // CASE 3: Standard Value (String Interpolation)
    // Check if it contains ANY variable interpolation, e.g. "User: ${name}" or "Email: ${user.email}"
    // If so, we use an f-string in Python
    if (strVal.includes('${')) {
        const fString = strVal.replace(/\$\{([^}]+)\}/g, (_, varPath) => {
            return `{${formatPyVarAccess(varPath)}}`;
        });
        return `f"${fString}"`;
    }

    // CASE 4: Numeric Check (loose check for simple numbers)
    // If it looks like a clean number, return it as a number so math works later
    if (!isNaN(parseFloat(strVal)) && isFinite(strVal)) {
        return strVal;
    }

    // Default: Return as string
    return `"${strVal}"`;
};

/**
 * Generates the Python Selenium "By" tuple.
 * Supports variables in the selector value (e.g. ID = ${btn_id})
 */
export const getPythonSelector = (type, value) => {
    let pyValue;
    const strVal = String(value);
    
    // If selector value is just a variable reference ${var}
    if (strVal.startsWith('${') && strVal.endsWith('}')) {
        const varName = strVal.slice(2, -1);
        pyValue = `self.vars.get("${varName}")`;
    } else {
        // Otherwise, quote it
        pyValue = `"${value}"`;
    }

    switch (type) {
        case 'ID': return `By.ID, ${pyValue}`;
        case 'CSS': return `By.CSS_SELECTOR, ${pyValue}`;
        case 'XPath': return `By.XPATH, ${pyValue}`;
        case 'Name': return `By.NAME, ${pyValue}`;
        case 'Link Text': return `By.LINK_TEXT, ${pyValue}`;
        default: return `By.ID, ${pyValue}`;
    }
};