import React from 'react';
import { Play, MousePointer, Hand, CheckCircle, GitFork, Repeat, Clock, Camera, Variable, Wifi, FileJson, Zap } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar glass-panel overflow-y-auto">
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

        {/* Set Variable Node */}
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'set_variable')} draggable>
          <Variable size={18} color="#22d3ee" />
          <span>Set Variable</span>
        </div>

        {/* Load Fixture Node */}
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'load_fixture')} draggable>
          <FileJson size={18} color="#eab308" />
          <span>Load Fixture</span>
        </div>

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
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'wait')} draggable>
          <Clock size={18} color="#a8a29e" />
          <span>Wait</span>
        </div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'screenshot')} draggable>
          <Camera size={18} color="#ec4899" />
          <span>Screenshot</span>
        </div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'assert')} draggable>
          <CheckCircle size={18} color="#c084fc" />
          <span>Assert</span>
        </div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'custom_command')} draggable>
          <Zap size={18} color="#10b981" />
          <span>Custom Command</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Network</div>
        <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'network')} draggable>
          <Wifi size={18} color="#06b6d4" />
          <span>Intercept</span>
        </div>
      </div>
    </aside>
  );
}