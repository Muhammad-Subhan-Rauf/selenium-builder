import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Wifi } from 'lucide-react';
import './Nodes.css';

const NetworkNode = ({ data, selected }) => {
    return (
        <div
            className={`custom-node ${selected ? 'selected' : ''}`}
            style={{ borderColor: selected ? undefined : '#06b6d4' }}
        >
            <div className="custom-node-header">
                <Wifi size={14} color="#06b6d4" />
                <span>Network Intercept</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Method</div>
                    <div className="node-value">{data.method || 'GET'}</div>
                </div>
                <div>
                    <div className="node-label">URL Pattern</div>
                    <div className="node-value" style={{ fontSize: '0.7rem' }}>
                        {data.urlPattern || '**/api/*'}
                    </div>
                </div>
                <div>
                    <div className="node-label">Alias</div>
                    <div className="node-value">@{data.alias || 'request'}</div>
                </div>
                {data.mockResponse && (
                    <div>
                        <div className="node-label">Mock</div>
                        <div className="node-value" style={{ color: '#f59e0b' }}>
                            Status: {data.statusCode || 200}
                        </div>
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

export default memo(NetworkNode);
