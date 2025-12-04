import React from 'react';
import { Download, Workflow } from 'lucide-react';
import './TopBar.css';

export default function TopBar({ onExport }) {
    return (
        <header className="topbar">
            <div className="logo">
                <div className="logo-icon">
                    <Workflow size={18} color="#fff" />
                </div>
                <span>Visual Test Builder</span>
            </div>
            <div className="topbar-actions">
                <button
                    className="btn-primary"
                    onClick={onExport}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Download size={16} />
                    Generate Code
                </button>
            </div>
        </header>
    );
}
