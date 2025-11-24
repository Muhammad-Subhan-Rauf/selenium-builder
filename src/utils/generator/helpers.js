export const getOutgoerByHandle = (node, edges, nodes, handleId) => {
    const edge = edges.find(e => e.source === node.id && e.sourceHandle === handleId);
    if (!edge) return null;
    return nodes.find(n => n.id === edge.target);
};

export const getNextNode = (node, edges, nodes) => {
    const edge = edges.find(e => 
        e.source === node.id && 
        (e.sourceHandle === 'flow-out' || node.type === 'start_session' || node.type === 'wait' || node.type === 'screenshot')
    );
    if (!edge) return null;
    return nodes.find(n => n.id === edge.target);
};

export const getConnectedElement = (node, edges, nodes) => {
    const connectedEdge = edges.find(e => e.target === node.id && e.targetHandle === 'data-in');
    if (!connectedEdge) return null;
    const elementNode = nodes.find(n => n.id === connectedEdge.source);
    return elementNode ? elementNode.data : null;
};

export const getPythonSelector = (type, value) => {
    switch (type) {
        case 'ID': return `By.ID, "${value}"`;
        case 'CSS': return `By.CSS_SELECTOR, "${value}"`;
        case 'XPath': return `By.XPATH, "${value}"`;
        case 'Name': return `By.NAME, "${value}"`;
        case 'Link Text': return `By.LINK_TEXT, "${value}"`;
        default: return `By.ID, "${value}"`;
    }
};