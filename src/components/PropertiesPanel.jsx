// Original relative path: components/PropertiesPanel.jsx

import React, { useEffect, useState } from 'react';
import './PropertiesPanel.css';

export default function PropertiesPanel({ selectedNode, onChange }) {
    const [data, setData] = useState({});

    useEffect(() => {
        if (selectedNode) {
            setData(selectedNode.data);
        }
    }, [selectedNode]);

    const handleChange = (field, value) => {
        const newData = { ...data, [field]: value };
        setData(newData);
        onChange(selectedNode.id, newData);
    };

    if (!selectedNode) {
        return (
            <aside className="properties-panel glass-panel">
                <div className="panel-header">
                    <h2 className="panel-title">Properties</h2>
                </div>
                <div className="empty-state">
                    Select a node on the canvas to view and edit its properties.
                </div>
            </aside>
        );
    }

    return (
        <aside className="properties-panel glass-panel">
            <div className="panel-header">
                <h2 className="panel-title">{data.label || selectedNode.type}</h2>
                <div className="panel-subtitle">ID: {selectedNode.id}</div>
            </div>

            <div className="panel-content">
                {/* START SESSION */}
                {selectedNode.type === 'start_session' && (
                    <>
                        <div className="form-group">
                            <label>Test Name</label>
                            <input type="text" value={data.testName || ''} onChange={(e) => handleChange('testName', e.target.value)} placeholder="MyTest" />
                        </div>
                        <div className="form-group">
                            <label>Browser</label>
                            <select value={data.browser || 'Chrome'} onChange={(e) => handleChange('browser', e.target.value)}>
                                <option value="Chrome">Chrome</option>
                                <option value="Firefox">Firefox</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Base URL</label>
                            <input type="text" value={data.url || ''} onChange={(e) => handleChange('url', e.target.value)} placeholder="https://example.com" />
                        </div>
                    </>
                )}

                {/* ELEMENT */}
                {selectedNode.type === 'element' && (
                    <>
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" value={data.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Login Button" />
                        </div>
                        <div className="form-group">
                            <label>Selector Type</label>
                            <select value={data.selectorType || 'ID'} onChange={(e) => handleChange('selectorType', e.target.value)}>
                                <option value="ID">ID</option>
                                <option value="CSS">CSS Selector</option>
                                <option value="XPath">XPath</option>
                                <option value="Name">Name</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Selector Value</label>
                            <input type="text" value={data.selectorValue || ''} onChange={(e) => handleChange('selectorValue', e.target.value)} placeholder="#login-btn" />
                        </div>
                    </>
                )}

                {/* INTERACT */}
                {selectedNode.type === 'interact' && (
                    <>
                        <div className="form-group">
                            <label>Action</label>
                            <select value={data.action || 'Click'} onChange={(e) => handleChange('action', e.target.value)}>
                                <option value="Click">Click</option>
                                <option value="Type">Type / Send Keys</option>
                                <option value="Clear">Clear</option>
                                <option value="Hover">Hover</option>
                            </select>
                        </div>
                        {(data.action === 'Type') && (
                            <div className="form-group">
                                <label>Value to Type</label>
                                <input type="text" value={data.value || ''} onChange={(e) => handleChange('value', e.target.value)} placeholder="Hello World" />
                            </div>
                        )}
                    </>
                )}

                {/* ASSERT & CONDITION */}
                {['assert', 'condition'].includes(selectedNode.type) && (
                    <>
                        <div className="form-group">
                            <label>Condition</label>
                            <select value={data.condition || 'Is Visible'} onChange={(e) => handleChange('condition', e.target.value)}>
                                <option value="Is Visible">Is Element Visible?</option>
                                <option value="Contains Text">Element Contains Text</option>
                                <option value="URL Contains">URL Contains</option>
                            </select>
                        </div>
                        {['Contains Text', 'URL Contains'].includes(data.condition) && (
                            <div className="form-group">
                                <label>Expected Value</label>
                                <input type="text" value={data.value || ''} onChange={(e) => handleChange('value', e.target.value)} placeholder="Expected value..." />
                            </div>
                        )}
                        {selectedNode.type === 'assert' && (
                            <div className="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" checked={data.printResults || false} onChange={(e) => handleChange('printResults', e.target.checked)} />
                                    Print Results
                                </label>
                            </div>
                        )}
                    </>
                )}

                {/* LOOP */}
                {selectedNode.type === 'loop' && (
                    <>
                        <div className="form-group">
                            <label>Loop Type</label>
                            <select value={data.loopType || 'Counter'} onChange={(e) => handleChange('loopType', e.target.value)}>
                                <option value="Counter">Counter (For i in range)</option>
                                <option value="While">While (Condition)</option>
                            </select>
                        </div>
                        {data.loopType === 'Counter' ? (
                             <div className="form-group">
                                <label>Iteration Count</label>
                                <input type="number" value={data.count || 1} onChange={(e) => handleChange('count', parseInt(e.target.value))} />
                             </div>
                        ) : (
                            <div className="form-group">
                                <label>While Condition</label>
                                <select value={data.condition || 'Is Visible'} onChange={(e) => handleChange('condition', e.target.value)}>
                                    <option value="Is Visible">Element Is Visible</option>
                                </select>
                                <small style={{color:'#64748b'}}>Connect an element to check visibility</small>
                            </div>
                        )}
                    </>
                )}
            </div>
        </aside>
    );
}