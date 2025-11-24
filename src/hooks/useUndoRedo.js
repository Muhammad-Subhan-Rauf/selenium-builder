import { useState, useCallback } from 'react';

export default function useUndoRedo(initialNodes = [], initialEdges = []) {
    // History is an array of states: { nodes, edges }
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

    // We keep track of the "current" state externally via arguments to takeSnapshot
    // or we assume the caller passes the *current* state to be pushed to past.

    const takeSnapshot = useCallback((nodes, edges) => {
        setPast((prev) => {
            // Limit history to 50 steps to prevent memory issues
            const newPast = [...prev, { nodes, edges }];
            if (newPast.length > 50) newPast.shift();
            return newPast;
        });
        setFuture([]); // Clear future when a new action happens
    }, []);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const undo = useCallback((currentNodes, currentEdges) => {
        if (!canUndo) return null;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setPast(newPast);
        setFuture((prev) => [{ nodes: currentNodes, edges: currentEdges }, ...prev]);

        return previous; // Returns { nodes, edges } to set
    }, [past, canUndo]);

    const redo = useCallback((currentNodes, currentEdges) => {
        if (!canRedo) return null;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast((prev) => [...prev, { nodes: currentNodes, edges: currentEdges }]);
        setFuture(newFuture);

        return next; // Returns { nodes, edges } to set
    }, [future, canRedo]);

    return {
        takeSnapshot,
        undo,
        redo,
        canUndo,
        canRedo,
        past,     // Exported for debug/length checks if needed
        future
    };
}