import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Repeat } from 'lucide-react';
import './Nodes.css';

export default memo(({ data, selected }) => {
    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ borderColor: selected ? undefined : '#8b5cf6' }}>
            <div className="custom-node-header">
                <Repeat size={14} color="#8b5cf6" />
                <span>Loop</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Type</div>
                    <div className="node-value">{data.loopType || 'Counter'}</div>
                </div>
                {data.loopType === 'Counter' ? (
                    <div>
                        <div className="node-label">Iterations</div>
                        <div className="node-value">{data.count || 1}</div>
                    </div>
                ) : (
                     <div>
                        <div className="node-label">While</div>
                        <div className="node-value">{data.condition || 'Visible'}</div>
                    </div>
                )}
            </div>

            {/* Flow Input */}
            <Handle type="target" position={Position.Top} id="flow-in" style={{ background: '#94a3b8' }} />

            {/* Data Input (Element - for While loops) */}
            <Handle type="target" position={Position.Left} id="data-in" style={{ background: '#60a5fa' }} />

            {/* Loop Body Output */}
            <div style={{ position: 'absolute', bottom: -20, left: '15%', fontSize: '10px', color: '#fbbf24' }}>Loop Body</div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="loop-body"
                style={{ background: '#fbbf24', left: '30%' }}
            />

            {/* Done Output */}
            <div style={{ position: 'absolute', bottom: -20, left: '65%', fontSize: '10px', color: '#94a3b8' }}>Done</div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="loop-done"
                style={{ background: '#94a3b8', left: '70%' }}
            />
        </div>
    );
});