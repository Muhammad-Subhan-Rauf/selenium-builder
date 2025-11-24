import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Camera } from 'lucide-react';
import './Nodes.css';

export default memo(({ data, selected }) => {
    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ borderColor: selected ? undefined : '#ec4899' }}>
            <div className="custom-node-header">
                <Camera size={14} color="#ec4899" />
                <span>Screenshot</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Directory</div>
                    <div className="node-value">{data.directory || './screenshots'}</div>
                </div>
                <div>
                    <div className="node-label">Filename</div>
                    <div className="node-value">
                        {data.filename || 'img'}
                        {data.autoIncrement ? '_#' : ''}
                    </div>
                </div>
            </div>

            <Handle type="target" position={Position.Top} id="flow-in" style={{ background: '#94a3b8', width: 10, height: 10 }} />
            <Handle type="source" position={Position.Bottom} id="flow-out" style={{ background: '#94a3b8', width: 10, height: 10 }} />
        </div>
    );
});