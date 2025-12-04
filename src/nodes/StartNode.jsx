import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import './Nodes.css';

export default memo(({ data, selected }) => {
    const hasHooks = data.clearCookies || data.clearLocalStorage || data.clearSessionStorage;

    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`} style={{ borderColor: selected ? undefined : '#4ade80' }}>
            <div className="custom-node-header">
                <Play size={14} color="#4ade80" />
                <span>Start Session</span>
            </div>
            <div className="custom-node-body">
                <div>
                    <div className="node-label">Browser</div>
                    <div className="node-value">{data.browser || 'Chrome'}</div>
                </div>
                <div>
                    <div className="node-label">URL</div>
                    <div className="node-value">{data.url || 'https://example.com'}</div>
                </div>
                {hasHooks && (
                    <div>
                        <div className="node-label">Hooks</div>
                        <div className="node-value" style={{color: '#4ade80'}}>
                            {data.framework === 'cypress' ? 'beforeEach' : 'setUp'} enabled
                        </div>
                    </div>
                )}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#4ade80', width: 10, height: 10 }}
            />
        </div>
    );
});
