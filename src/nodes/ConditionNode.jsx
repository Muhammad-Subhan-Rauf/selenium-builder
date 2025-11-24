import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitFork } from 'lucide-react';
import './Nodes.css';

export default memo(({ data, selected }) => {
    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ borderColor: selected ? undefined : '#f59e0b' }}>
            <div className="custom-node-header">
                <GitFork size={14} color="#f59e0b" />
                <span>Condition</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Check</div>
                    <div className="node-value">{data.condition || 'Is Visible'}</div>
                </div>
                {data.value && (
                    <div>
                        <div className="node-label">Value</div>
                        <div className="node-value">{data.value}</div>
                    </div>
                )}
            </div>

            {/* Flow Input */}
            <Handle type="target" position={Position.Top} id="flow-in" style={{ background: '#94a3b8' }} />

            {/* Data Input (Element) */}
            <Handle type="target" position={Position.Left} id="data-in" style={{ background: '#60a5fa' }} />

            {/* True Output */}
            <div style={{ position: 'absolute', bottom: -20, left: '25%', fontSize: '10px', color: '#4ade80' }}>True</div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="true-out"
                style={{ background: '#4ade80', left: '30%' }}
            />

            {/* False Output */}
            <div style={{ position: 'absolute', bottom: -20, left: '65%', fontSize: '10px', color: '#f87171' }}>False</div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="false-out"
                style={{ background: '#f87171', left: '70%' }}
            />
        </div>
    );
});