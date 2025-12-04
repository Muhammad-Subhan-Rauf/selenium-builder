import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Variable } from 'lucide-react';
import './Nodes.css';

// 1. Give the component a name
const SetVarNode = ({ data, selected }) => {
    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ borderColor: selected ? undefined : '#22d3ee' }}>
            <div className="custom-node-header">
                <Variable size={14} color="#22d3ee" />
                <span>Set Variable</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Variable Name</div>
                    <div className="node-value">{data.varName || 'my_var'}</div>
                </div>
                <div>
                    <div className="node-label">Value</div>
                    <div className="node-value">{data.varValue || '...'}</div>
                </div>
            </div>

            <Handle type="target" position={Position.Top} id="flow-in" style={{ background: '#94a3b8', width: 10, height: 10 }} />
            <Handle type="source" position={Position.Bottom} id="flow-out" style={{ background: '#94a3b8', width: 10, height: 10 }} />
        </div>
    );
};

// 2. Export the named component
export default memo(SetVarNode);