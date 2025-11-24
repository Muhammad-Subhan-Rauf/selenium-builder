const FILE_VERSION = "1.0";

/**
 * Triggers a download of the current flow as a JSON file.
 * Optimizes size by removing runtime-only properties.
 */
export const exportFlowToFile = (nodes, edges, viewport) => {
    // 1. Sanitize Nodes: Remove UI state (selected, dragging, dimensions)
    const cleanNodes = nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position, // x, y
        data: node.data
    }));

    // 2. Sanitize Edges: Keep connectivity data
    const cleanEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type || 'button-edge'
    }));

    // 3. Construct the Payload
    const flowData = {
        meta: {
            version: FILE_VERSION,
            exportedAt: new Date().toISOString(),
            generator: "SeleniumVisualBuilder"
        },
        viewport,
        nodes: cleanNodes,
        edges: cleanEdges
    };

    // 4. Create Blob and Trigger Download
    const jsonString = JSON.stringify(flowData, null, 2); // Pretty print for readability (negligible size impact for this use case)
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename based on first test name or timestamp
    let filename = `test_flow_${Date.now()}.json`;
    const startNode = nodes.find(n => n.type === 'start_session');
    if (startNode && startNode.data && startNode.data.testName) {
        filename = `${startNode.data.testName}.json`;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Parses a JSON file and returns the nodes, edges, and viewport.
 * Includes basic validation.
 */
export const importFlowFromFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const flowData = JSON.parse(event.target.result);

                // Basic Validation
                if (!flowData.nodes || !flowData.edges) {
                    throw new Error("Invalid file structure: Missing nodes or edges.");
                }

                // Restore Edges (Ensure they have the correct type for the UI)
                const restoredEdges = flowData.edges.map(e => ({
                    ...e,
                    type: 'button-edge' // Ensure custom edge type is reapplied
                }));

                resolve({
                    nodes: flowData.nodes,
                    edges: restoredEdges,
                    viewport: flowData.viewport || { x: 0, y: 0, zoom: 1 }
                });
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
};