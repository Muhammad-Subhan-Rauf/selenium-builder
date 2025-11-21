import React, { useState } from 'react';

export default function TestPage() {
    const [message, setMessage] = useState('Waiting for action...');
    const [clickCount, setClickCount] = useState(0);

    const handleClick = () => {
        setMessage('Button Clicked Successfully!');
        setClickCount(prev => prev + 1);
    };

    const handleHover = () => {
        setMessage('Mouse is hovering!');
    };

    const handleLeave = () => {
        setMessage('Mouse left the area.');
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: 'white',
            gap: '2rem'
        }}>
            <h1 id="page-title">Selenium Test Page</h1>

            <div style={{
                padding: '2rem',
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '1rem',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                minWidth: '300px',
                alignItems: 'center'
            }}>
                <div id="status-message" style={{ fontSize: '1.2rem', color: '#4ade80', minHeight: '1.5em' }}>
                    {message}
                </div>

                <button
                    id="test-button"
                    onClick={handleClick}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Click Me
                </button>

                <div style={{ color: '#94a3b8' }}>
                    Click Count: <span id="click-count" style={{ color: 'white', fontWeight: 'bold' }}>{clickCount}</span>
                </div>

                <input
                    id="test-input"
                    type="text"
                    placeholder="Type something here..."
                    style={{
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #334155',
                        background: '#1e293b',
                        color: 'white',
                        width: '100%'
                    }}
                />
            </div>

            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none', marginTop: '2rem' }}>
                ← Back to Builder
            </a>
        </div>
    );
}
