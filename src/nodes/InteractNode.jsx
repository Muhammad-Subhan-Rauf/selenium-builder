import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Hand } from 'lucide-react';
import './Nodes.css';

export default memo(({ data, selected }) => {
    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ borderColor: selected ? undefined : '#fb923c' }}>
            <div className="custom-node-header">
                <Hand size={14} color="#fb923c" />
                <span>Interact</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Action</div>
                    <div className="node-value">{data.action || 'Click'}</div>
                </div>
                {data.value && (
                    <div>
                        <div className="node-label">Value</div>
                        <div className="node-value">{data.value}</div>
                    </div>
                )}
            </div>

            {/* Flow Input (Top) */}
            <Handle
                type="target"
                position={Position.Top}
                id="flow-in"
                style={{ background: '#94a3b8', width: 10, height: 10 }}
            />

            {/* Data Input (Left) - From Element */}
            <Handle
                type="target"
                position={Position.Left}
                id="data-in"
                style={{ background: '#60a5fa', width: 10, height: 10 }}
            />

            {/* Flow Output (Bottom) */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="flow-out"
                style={{ background: '#94a3b8', width: 10, height: 10 }}
            />
        </div>
    );
});
