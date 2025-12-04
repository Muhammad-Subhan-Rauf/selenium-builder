import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle } from 'lucide-react';
import './Nodes.css';

export default memo(({ data, selected }) => {
    const condition = data.condition || 'Is Visible';
    const isNetworkAssertion = condition === 'Network Status';

    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ borderColor: selected ? undefined : '#c084fc' }}>
            <div className="custom-node-header">
                <CheckCircle size={14} color="#c084fc" />
                <span>Assert</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Condition</div>
                    <div className="node-value">{condition}</div>
                </div>
                {isNetworkAssertion ? (
                    <div>
                        <div className="node-label">Alias / Status</div>
                        <div className="node-value" style={{ color: '#06b6d4' }}>
                            @{data.networkAlias || 'request'}: {data.expectedStatus || 200}
                        </div>
                    </div>
                ) : (
                    <>
                        {data.value && (
                            <div>
                                <div className="node-label">Value</div>
                                <div className="node-value">{data.value}</div>
                            </div>
                        )}
                        {data.propertyName && condition === 'Property Equals' && (
                            <div>
                                <div className="node-label">Property</div>
                                <div className="node-value">{data.propertyName}</div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Flow Input (Top) */}
            <Handle
                type="target"
                position={Position.Top}
                id="flow-in"
                style={{ background: '#94a3b8', width: 10, height: 10 }}
            />

            {/* Data Input (Left) - From Element (Optional depending on assertion) */}
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
