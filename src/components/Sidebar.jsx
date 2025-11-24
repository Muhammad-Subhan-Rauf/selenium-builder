import React from 'react';
import { Play, MousePointer, Hand, CheckCircle, GitFork, Repeat } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar glass-panel">
      <h2 className="sidebar-title">Toolbox</h2>
      
      <div className="sidebar-section">
        <div className="sidebar-section-title">Setup</div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'start_session')} draggable>
          <Play size={18} color="#4ade80" />
          <span>Start Session</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Components</div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'element')} draggable>
          <MousePointer size={18} color="#60a5fa" />
          <span>Element</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Logic</div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'condition')} draggable>
          <GitFork size={18} color="#f59e0b" />
          <span>Condition</span>
        </div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'loop')} draggable>
          <Repeat size={18} color="#8b5cf6" />
          <span>Loop</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Actions</div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'interact')} draggable>
          <Hand size={18} color="#fb923c" />
          <span>Interact</span>
        </div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'assert')} draggable>
          <CheckCircle size={18} color="#c084fc" />
          <span>Assert</span>
        </div>
      </div>
    </aside>
  );
}