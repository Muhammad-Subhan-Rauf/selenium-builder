import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import './Nodes.css';

const WaitNode = ({ data, selected }) => {
    const isNetworkWait = data.waitType === 'network';

    return (
        <div
            className={`custom-node ${selected ? 'selected' : ''}`}
            style={{ borderColor: selected ? undefined : '#a8a29e' }}
        >
            <div className="custom-node-header">
                <Clock size={14} color="#a8a29e" />
                <span>Wait</span>
            </div>

            <div className="custom-node-body">
                {isNetworkWait ? (
                    <div>
                        <div className="node-label">Network Alias</div>
                        <div className="node-value" style={{ color: '#06b6d4' }}>
                            @{data.networkAlias || 'request'}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="node-label">Duration (s)</div>
                        <div className="node-value">{data.duration || 1}s</div>
                    </div>
                )}
            </div>

            <Handle type="target" position={Position.Top} id="flow-in"
                style={{ background: '#94a3b8', width: 10, height: 10 }} />

            <Handle type="source" position={Position.Bottom} id="flow-out"
                style={{ background: '#94a3b8', width: 10, height: 10 }} />
        </div>
    );
};

export default memo(WaitNode);
