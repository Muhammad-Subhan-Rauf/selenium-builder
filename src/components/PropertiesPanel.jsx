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
                <h2 className="panel-title">{data.label || selectedNode.type.replace('_', ' ')}</h2>
                <div className="panel-subtitle">ID: {selectedNode.id}</div>
            </div>

            <div className="panel-content">
                
                {/* --- START SESSION --- */}
                {selectedNode.type === 'start_session' && (
                    <>
                        <div className="form-group">
                            <label>Test Name</label>
                            <input type="text" value={data.testName || ''} onChange={(e) => handleChange('testName', e.target.value)} placeholder="MyTest" />
                        </div>
                        
                        {/* NEW: Framework Selector */}
                        <div className="form-group">
                            <label>Framework</label>
                            <select value={data.framework || 'selenium'} onChange={(e) => handleChange('framework', e.target.value)}>
                                <option value="selenium">Selenium (Python)</option>
                                <option value="cypress">Cypress (JS)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Browser</label>
                            <select value={data.browser || 'Chrome'} onChange={(e) => handleChange('browser', e.target.value)}>
                                <option value="Chrome">Chrome</option>
                                <option value="Firefox">Firefox</option>
                                <option value="Electron">Electron (Cypress Only)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Base URL</label>
                            <input type="text" value={data.url || ''} onChange={(e) => handleChange('url', e.target.value)} placeholder="https://example.com" />
                        </div>

                        {/* Setup / Teardown Hooks */}
                        <div className="form-group" style={{marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '12px'}}>
                            <label style={{fontWeight: 'bold', marginBottom: '8px', display: 'block'}}>
                                Setup / Teardown {data.framework === 'cypress' ? '(beforeEach)' : '(setUp)'}
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={data.clearCookies || false}
                                    onChange={(e) => handleChange('clearCookies', e.target.checked)}
                                />
                                Clear Cookies
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={data.clearLocalStorage || false}
                                    onChange={(e) => handleChange('clearLocalStorage', e.target.checked)}
                                />
                                Clear Local Storage
                            </label>
                        </div>
                        {data.framework === 'cypress' && (
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={data.clearSessionStorage || false}
                                        onChange={(e) => handleChange('clearSessionStorage', e.target.checked)}
                                    />
                                    Clear Session Storage
                                </label>
                            </div>
                        )}
                    </>
                )}

                {/* --- SET VARIABLE --- */}
                {selectedNode.type === 'set_variable' && (
                    <>
                        <div className="form-group">
                            <label>Variable Name (Key)</label>
                            <input 
                                type="text" 
                                value={data.varName || ''} 
                                onChange={(e) => handleChange('varName', e.target.value)} 
                                placeholder="e.g. counter" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Value or Formula</label>
                            <input 
                                type="text" 
                                value={data.varValue || ''} 
                                onChange={(e) => handleChange('varValue', e.target.value)} 
                                placeholder="10, ${other_var}, or =${count}+1" 
                            />
                            <div style={{fontSize:'0.7rem', color:'#64748b', marginTop:'4px'}}>
                                Start with <b>=</b> to do math (e.g. <code>=${'{i}'} + 1</code>)
                            </div>
                        </div>
                    </>
                )}

                {/* --- ELEMENT --- */}
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
                            <input 
                                type="text" 
                                value={data.selectorValue || ''} 
                                onChange={(e) => handleChange('selectorValue', e.target.value)} 
                                placeholder="#login-btn or ${btn_id}" 
                            />
                        </div>
                    </>
                )}

                {/* --- INTERACT --- */}
                {selectedNode.type === 'interact' && (
                    <>
                        <div className="form-group">
                            <label>Action</label>
                            <select value={data.action || 'Click'} onChange={(e) => handleChange('action', e.target.value)}>
                                <option value="Click">Click</option>
                                <option value="Type">Type / Send Keys</option>
                                <option value="Clear">Clear</option>
                                <option value="Hover">Hover</option>
                                <option value="Get Text">Get Text (Save to Var)</option>
                            </select>
                        </div>
                        
                        {data.action === 'Type' && (
                            <div className="form-group">
                                <label>Value to Type</label>
                                <input 
                                    type="text" 
                                    value={data.value || ''} 
                                    onChange={(e) => handleChange('value', e.target.value)} 
                                    placeholder="Hello or ${my_var}" 
                                />
                            </div>
                        )}

                        {data.action === 'Get Text' && (
                            <div className="form-group">
                                <label>Save Result To (Variable Name)</label>
                                <input 
                                    type="text" 
                                    value={data.saveTo || ''} 
                                    onChange={(e) => handleChange('saveTo', e.target.value)} 
                                    placeholder="e.g. order_id" 
                                />
                            </div>
                        )}
                    </>
                )}

                {/* --- WAIT --- */}
                {selectedNode.type === 'wait' && (
                    <>
                        <div className="form-group">
                            <label>Wait Type</label>
                            <select value={data.waitType || 'time'} onChange={(e) => handleChange('waitType', e.target.value)}>
                                <option value="time">Time (Seconds)</option>
                                <option value="network">Network Alias (Cypress)</option>
                            </select>
                        </div>
                        {(data.waitType || 'time') === 'time' ? (
                            <div className="form-group">
                                <label>Duration (Seconds)</label>
                                <input
                                    type="text"
                                    value={data.duration || '1'}
                                    onChange={(e) => handleChange('duration', e.target.value)}
                                    placeholder="1 or ${wait_time}"
                                />
                                <small style={{color:'#64748b'}}>Number or ${'{variable}'}</small>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Network Alias</label>
                                <input
                                    type="text"
                                    value={data.networkAlias || ''}
                                    onChange={(e) => handleChange('networkAlias', e.target.value)}
                                    placeholder="loginRequest"
                                />
                                <small style={{color:'#64748b'}}>Without @ prefix. Use with Intercept node.</small>
                            </div>
                        )}
                    </>
                )}

                {/* --- SCREENSHOT --- */}
                {selectedNode.type === 'screenshot' && (
                    <>
                        <div className="form-group">
                            <label>Directory (Python Only)</label>
                            <input 
                                type="text" 
                                value={data.directory || './screenshots'} 
                                onChange={(e) => handleChange('directory', e.target.value)} 
                                placeholder="./screenshots"
                            />
                        </div>
                        <div className="form-group">
                            <label>Filename</label>
                            <input 
                                type="text" 
                                value={data.filename || 'screenshot'} 
                                onChange={(e) => handleChange('filename', e.target.value)} 
                                placeholder="login_page"
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={data.autoIncrement || false} 
                                    onChange={(e) => handleChange('autoIncrement', e.target.checked)} 
                                />
                                Auto Increment Counter (Python)
                            </label>
                        </div>
                    </>
                )}

                {/* --- ASSERT & CONDITION --- */}
                {['assert', 'condition'].includes(selectedNode.type) && (
                    <>
                        <div className="form-group">
                            <label>Condition</label>
                            <select value={data.condition || 'Is Visible'} onChange={(e) => handleChange('condition', e.target.value)}>
                                <option value="Is Visible">Is Element Visible?</option>
                                <option value="Contains Text">Element Contains Text</option>
                                <option value="URL Contains">URL Contains</option>
                                <option value="URL Matches Regex">URL Matches Regex</option>
                                <option value="Has Class">Element Has Class</option>
                                <option value="Property Equals">Element Property Equals</option>
                                {selectedNode.type === 'assert' && (
                                    <option value="Network Status">Network Response Status</option>
                                )}
                            </select>
                        </div>

                        {/* Value input for text-based conditions */}
                        {['Contains Text', 'URL Contains', 'URL Matches Regex', 'Has Class'].includes(data.condition) && (
                            <div className="form-group">
                                <label>
                                    {data.condition === 'URL Matches Regex' ? 'Regex Pattern' :
                                     data.condition === 'Has Class' ? 'Class Name' : 'Expected Value'}
                                </label>
                                <input
                                    type="text"
                                    value={data.value || ''}
                                    onChange={(e) => handleChange('value', e.target.value)}
                                    placeholder={
                                        data.condition === 'URL Matches Regex' ? '/dashboard$/' :
                                        data.condition === 'Has Class' ? 'active' : 'Value or ${expected_val}'
                                    }
                                />
                                {data.condition === 'URL Matches Regex' && (
                                    <small style={{color:'#64748b'}}>JavaScript regex without slashes</small>
                                )}
                            </div>
                        )}

                        {/* Property Equals needs property name and value */}
                        {data.condition === 'Property Equals' && (
                            <>
                                <div className="form-group">
                                    <label>Property Name</label>
                                    <input
                                        type="text"
                                        value={data.propertyName || ''}
                                        onChange={(e) => handleChange('propertyName', e.target.value)}
                                        placeholder="value, checked, disabled"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Expected Value</label>
                                    <input
                                        type="text"
                                        value={data.value || ''}
                                        onChange={(e) => handleChange('value', e.target.value)}
                                        placeholder="Expected property value"
                                    />
                                </div>
                            </>
                        )}

                        {/* Network Status needs alias and expected status */}
                        {data.condition === 'Network Status' && (
                            <>
                                <div className="form-group">
                                    <label>Network Alias</label>
                                    <input
                                        type="text"
                                        value={data.networkAlias || ''}
                                        onChange={(e) => handleChange('networkAlias', e.target.value)}
                                        placeholder="loginRequest"
                                    />
                                    <small style={{color:'#64748b'}}>Without @ prefix</small>
                                </div>
                                <div className="form-group">
                                    <label>Expected Status Code</label>
                                    <input
                                        type="number"
                                        value={data.expectedStatus || 200}
                                        onChange={(e) => handleChange('expectedStatus', parseInt(e.target.value))}
                                    />
                                </div>
                            </>
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

                {/* --- LOOP --- */}
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
                                <input 
                                    type="text" 
                                    value={data.count || 1} 
                                    onChange={(e) => handleChange('count', e.target.value)} 
                                    placeholder="5 or ${max_loops}"
                                />
                             </div>
                        ) : (
                            <div className="form-group">
                                <label>While Condition</label>
                                <select value={data.condition || 'Is Visible'} onChange={(e) => handleChange('condition', e.target.value)}>
                                    <option value="Is Visible">Element Is Visible</option>
                                </select>
                            </div>
                        )}
                    </>
                )}

                {/* --- NETWORK INTERCEPT --- */}
                {selectedNode.type === 'network' && (
                    <>
                        <div className="form-group">
                            <label>HTTP Method</label>
                            <select value={data.method || 'GET'} onChange={(e) => handleChange('method', e.target.value)}>
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                <option value="PATCH">PATCH</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>URL Matcher</label>
                            <input
                                type="text"
                                value={data.urlPattern || ''}
                                onChange={(e) => handleChange('urlPattern', e.target.value)}
                                placeholder="**/api/login or /users/*"
                            />
                            <small style={{color:'#64748b'}}>Glob pattern or exact path</small>
                        </div>
                        <div className="form-group">
                            <label>Alias Name</label>
                            <input
                                type="text"
                                value={data.alias || ''}
                                onChange={(e) => handleChange('alias', e.target.value)}
                                placeholder="loginRequest"
                            />
                            <small style={{color:'#64748b'}}>Used with cy.wait('@alias')</small>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={data.mockResponse || false}
                                    onChange={(e) => handleChange('mockResponse', e.target.checked)}
                                />
                                Mock Response
                            </label>
                        </div>
                        {data.mockResponse && (
                            <>
                                <div className="form-group">
                                    <label>Status Code</label>
                                    <input
                                        type="number"
                                        value={data.statusCode || 200}
                                        onChange={(e) => handleChange('statusCode', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Response Body (JSON)</label>
                                    <textarea
                                        rows={4}
                                        value={data.responseBody || ''}
                                        onChange={(e) => handleChange('responseBody', e.target.value)}
                                        placeholder='{"success": true, "data": {}}'
                                        style={{fontFamily: 'monospace', fontSize: '11px'}}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* --- LOAD FIXTURE --- */}
                {selectedNode.type === 'load_fixture' && (
                    <>
                        <div className="form-group">
                            <label>Fixture File Path</label>
                            <input
                                type="text"
                                value={data.filePath || ''}
                                onChange={(e) => handleChange('filePath', e.target.value)}
                                placeholder="users.json or fixtures/data.json"
                            />
                            <small style={{color:'#64748b'}}>Path relative to cypress/fixtures/ (Cypress) or project root (Python)</small>
                        </div>
                        <div className="form-group">
                            <label>Store As Variable</label>
                            <input
                                type="text"
                                value={data.varName || ''}
                                onChange={(e) => handleChange('varName', e.target.value)}
                                placeholder="userData"
                            />
                            <small style={{color:'#64748b'}}>Access with ${'{varName.property}'}</small>
                        </div>
                    </>
                )}

                {/* --- CUSTOM COMMAND --- */}
                {selectedNode.type === 'custom_command' && (
                    <>
                        <div className="form-group">
                            <label>Command Name</label>
                            <input
                                type="text"
                                value={data.commandName || ''}
                                onChange={(e) => handleChange('commandName', e.target.value)}
                                placeholder="login"
                            />
                            <small style={{color:'#64748b'}}>Without 'cy.' prefix (Cypress) or function name (Python)</small>
                        </div>
                        <div className="form-group">
                            <label>Arguments (comma-separated)</label>
                            <input
                                type="text"
                                value={data.arguments || ''}
                                onChange={(e) => handleChange('arguments', e.target.value)}
                                placeholder="user@test.com, password123"
                            />
                            <small style={{color:'#64748b'}}>Supports ${'{variable}'} syntax</small>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}