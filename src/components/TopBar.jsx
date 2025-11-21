import React from 'react';
import { Download } from 'lucide-react';
import './TopBar.css';

export default function TopBar({ onExport }) {
    return (
        <header className="topbar glass-panel">
            <div className="logo">Visual Selenium Builder</div>
            <button
                className="btn-primary"
                onClick={onExport}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <Download size={16} />
                Generate Code
            </button>
        </header>
    );
}
