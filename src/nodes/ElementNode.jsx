import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MousePointer } from 'lucide-react';
import './Nodes.css';

export default memo(({ data, selected }) => {
    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ borderColor: selected ? undefined : '#60a5fa' }}>
            <div className="custom-node-header">
                <MousePointer size={14} color="#60a5fa" />
                <span>{data.name || 'Element'}</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Selector</div>
                    <div className="node-value">{data.selectorType || 'ID'}</div>
                </div>
                <div>
                    <div className="node-label">Value</div>
                    <div className="node-value">{data.selectorValue || '...'}</div>
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                style={{ background: '#60a5fa', width: 10, height: 10 }}
            />
        </div>
    );
});
