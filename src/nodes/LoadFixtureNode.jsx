import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileJson } from 'lucide-react';
import './Nodes.css';

const LoadFixtureNode = ({ data, selected }) => {
    return (
        <div
            className={`custom-node ${selected ? 'selected' : ''}`}
            style={{ borderColor: selected ? undefined : '#eab308' }}
        >
            <div className="custom-node-header">
                <FileJson size={14} color="#eab308" />
                <span>Load Fixture</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">File Path</div>
                    <div className="node-value" style={{ fontSize: '0.7rem' }}>
                        {data.filePath || 'data.json'}
                    </div>
                </div>
                <div>
                    <div className="node-label">Store As</div>
                    <div className="node-value" style={{ color: '#22d3ee' }}>
                        ${'{' + (data.varName || 'fixtureData') + '}'}
                    </div>
                </div>
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

export default memo(LoadFixtureNode);
