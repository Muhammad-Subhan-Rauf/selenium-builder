import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';
import './Nodes.css';

const CustomCommandNode = ({ data, selected }) => {
    const args = data.arguments ? data.arguments.split(',').map(a => a.trim()).filter(Boolean) : [];

    return (
        <div
            className={`custom-node ${selected ? 'selected' : ''}`}
            style={{ borderColor: selected ? undefined : '#10b981' }}
        >
            <div className="custom-node-header">
                <Zap size={14} color="#10b981" />
                <span>Custom Command</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Command</div>
                    <div className="node-value" style={{ color: '#10b981' }}>
                        cy.{data.commandName || 'myCommand'}()
                    </div>
                </div>
                {args.length > 0 && (
                    <div>
                        <div className="node-label">Arguments</div>
                        <div className="node-value">{args.length} arg(s)</div>
                    </div>
                )}
            </div>

            <Handle
                type="target"
                position={Position.Top}
                id="flow-in"
                style={{ background: '#94a3b8', width: 10, height: 10 }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="flow-out"
                style={{ background: '#94a3b8', width: 10, height: 10 }}
            />
        </div>
    );
};

export default memo(CustomCommandNode);
