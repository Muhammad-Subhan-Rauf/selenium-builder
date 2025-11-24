import React, { useCallback } from 'react';
import { Copy, Scissors, Clipboard, Trash2 } from 'lucide-react';

export default function ContextMenu({ 
    id, 
    top, 
    left, 
    right, 
    bottom, 
    onCopy, 
    onCut, 
    onPaste, 
    onDelete, 
    hasClipboard 
}) {
    // If id is present, we clicked a Node. If null, we clicked the Pane.
    const isNode = !!id;

    return (
        <div
            style={{
                top,
                left,
                right,
                bottom,
                position: 'fixed', // Use fixed to position relative to viewport
                zIndex: 1000,
            }}
            className="glass-panel context-menu"
        >
            <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0', minWidth: '150px' }}>
                
                {isNode && (
                    <>
                        <button className="ctx-menu-btn" onClick={onCopy}>
                            <Copy size={14} /> Copy
                        </button>
                        <button className="ctx-menu-btn" onClick={onCut}>
                            <Scissors size={14} /> Cut
                        </button>
                    </>
                )}
                
                <button className="ctx-menu-btn" onClick={onPaste} disabled={!hasClipboard}>
                    <Clipboard size={14} /> Paste
                </button>

                {isNode && (
                    <>
                         <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
                        <button className="ctx-menu-btn delete-btn" onClick={onDelete}>
                            <Trash2 size={14} /> Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}