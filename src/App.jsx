// Original relative path: App.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  useReactFlow,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Upload, Save, FileJson, RotateCcw, RotateCw, FolderOutput } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import JSZip from 'jszip'; // Make sure to install: npm install jszip

import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import TestPage from './pages/TestPage';
import ButtonEdge from './components/ButtonEdge';
import ContextMenu from './components/ContextMenu';
import './components/TopBar.css';

// Nodes imports (keep existing imports)
import StartNode from './nodes/StartNode';
import ElementNode from './nodes/ElementNode';
import InteractNode from './nodes/InteractNode';
import AssertNode from './nodes/AssertNode';
import ConditionNode from './nodes/ConditionNode';
import LoopNode from './nodes/LoopNode';
import WaitNode from './nodes/WaitNode';
import ScreenshotNode from './nodes/ScreenshotNode';
import SetVarNode from './nodes/SetVarNode';
import NetworkNode from './nodes/NetworkNode';
import LoadFixtureNode from './nodes/LoadFixtureNode';
import CustomCommandNode from './nodes/CustomCommandNode';

import { generateSuite } from './utils/codeGenerator'; // CHANGED THIS IMPORT
import { exportFlowToFile, importFlowFromFile } from './utils/fileManager';
import useUndoRedo from './hooks/useUndoRedo';

// ... (keep nodeTypes, edgeTypes, STORAGE_KEY, id helper) ...
const nodeTypes = {
  start_session: StartNode,
  element: ElementNode,
  interact: InteractNode,
  assert: AssertNode,
  condition: ConditionNode,
  loop: LoopNode,
  wait: WaitNode,
  screenshot: ScreenshotNode,
  set_variable: SetVarNode,
  network: NetworkNode,
  load_fixture: LoadFixtureNode,
  custom_command: CustomCommandNode,
};

const edgeTypes = {
  'button-edge': ButtonEdge,
};

const STORAGE_KEY = 'selenium_builder_flow_v3';
const id = () => `dndnode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


function TopBarWithNav({ onExportCode, onSaveFile, onLoadFile, onClear, onUndo, onRedo, canUndo, canRedo }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try { await onLoadFile(file); } catch (err) { alert("Error: " + err.message); }
      e.target.value = null;
  };

  return (
    <header className="topbar">
      <div className="topbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="topbar-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v10"/>
            <path d="M21 12h-6m-6 0H1"/>
            <path d="m19.07 4.93-4.24 4.24M9.17 14.83l-4.24 4.24"/>
            <path d="m4.93 4.93 4.24 4.24M14.83 14.83l4.24 4.24"/>
          </svg>
        </div>
        <span className="topbar-title">Visual Test Builder</span>
      </div>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />

      <div className="topbar-actions">
        <div className="topbar-group">
            <button className="topbar-btn icon-only" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                <RotateCcw size={16} />
            </button>
            <button className="topbar-btn icon-only" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                <RotateCw size={16} />
            </button>
        </div>

        <div className="topbar-divider" />

        <button className="topbar-btn" onClick={() => navigate('/test')}>Test Page</button>

        <div className="topbar-divider" />

        <div className="topbar-group">
          <button className="topbar-btn" onClick={() => fileInputRef.current.click()}>
            <Upload size={15} />
            <span>Load</span>
          </button>
          <button className="topbar-btn" onClick={onSaveFile}>
            <Save size={15} />
            <span>Save</span>
          </button>
        </div>

        <div className="topbar-divider" />

        <button className="topbar-btn danger" onClick={onClear}>Reset</button>

        <button className="topbar-btn primary" onClick={onExportCode}>
          <FolderOutput size={16} />
          <span>Export Tests</span>
        </button>
      </div>
    </header>
  );
}

function DnDFlow() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, getNodes, getEdges, setViewport, getViewport } = useReactFlow();
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [menu, setMenu] = useState(null);
  const [clipboard, setClipboard] = useState(null);

  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo();

  // ... (keep useEffect for LocalStorage, saveFlow) ...
  useEffect(() => {
    const savedFlow = localStorage.getItem(STORAGE_KEY);
    if (savedFlow) {
      try {
        const flow = JSON.parse(savedFlow);
        if (flow.nodes) setNodes(flow.nodes);
        if (flow.edges) setEdges(flow.edges);
        if (flow.viewport) setViewport(flow.viewport);
      } catch (e) { console.error("Auto-load failed", e); }
    }
  }, [setNodes, setEdges, setViewport]);

  useEffect(() => {
    const saveFlow = () => {
      const flow = { nodes, edges, viewport: getViewport() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
    };
    saveFlow();
  }, [nodes, edges, getViewport]);

  const performActionWithSnapshot = useCallback((action) => {
      takeSnapshot(getNodes(), getEdges());
      action();
  }, [getNodes, getEdges, takeSnapshot]);


  // ... (keep clipboard actions: handleCopy, handleCut, handlePaste, handleDelete) ...
  // (Assuming you have the previous code for these, omitted for brevity to focus on Export)
  const handleCopy = useCallback(() => { /* ... */ }, [getNodes, getEdges]);
  const handleCut = useCallback(() => { /* ... */ }, [getNodes, getEdges, setNodes, setEdges, performActionWithSnapshot]);
  const handlePaste = useCallback((pos) => { /* ... */ }, [clipboard, screenToFlowPosition, setNodes, setEdges, performActionWithSnapshot]);
  const handleDelete = useCallback(() => { /* ... */ }, [getNodes, setNodes, setEdges, performActionWithSnapshot]);


  // ... (keep keyboard shortcuts) ...

  // ... (keep standard event handlers onConnect, onDrop, etc) ...
  const onConnect = useCallback((params) => {
      takeSnapshot(getNodes(), getEdges());
      setEdges((eds) => addEdge({ ...params, type: 'button-edge' }, eds));
  }, [setEdges, getNodes, getEdges, takeSnapshot]);

    const onEdgeDoubleClick = useCallback((event, edge) => {
        event.stopPropagation();
        takeSnapshot(getNodes(), getEdges());
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }, [setEdges, getNodes, getEdges, takeSnapshot]);

    const onNodeDragStart = useCallback(() => {
        takeSnapshot(getNodes(), getEdges());
    }, [getNodes, getEdges, takeSnapshot]);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;
        takeSnapshot(getNodes(), getEdges());
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode = { id: id(), type, position, data: { label: `${type} node` } };
        setNodes((nds) => nds.concat(newNode));
    }, [screenToFlowPosition, setNodes, getNodes, getEdges, takeSnapshot]);

  // Wrappers
  const onUndoHandler = () => { const prev = undo(getNodes(), getEdges()); if(prev) { setNodes(prev.nodes); setEdges(prev.edges); } };
  const onRedoHandler = () => { const next = redo(getNodes(), getEdges()); if(next) { setNodes(next.nodes); setEdges(next.edges); } };
  const onSaveHandler = () => exportFlowToFile(getNodes(), getEdges(), getViewport());
  const onLoadHandler = async (f) => { performActionWithSnapshot(async () => { const d = await importFlowFromFile(f); setNodes([]); setEdges([]); setTimeout(() => { setNodes(d.nodes); setEdges(d.edges); setViewport(d.viewport); }, 50); }); };
  const onClearHandler = () => { if(confirm("Clear all?")) performActionWithSnapshot(() => { setNodes([]); setEdges([]); }); };

  // --- NEW EXPORT HANDLER WITH DIRECTORY SUPPORT ---
  const onExportCodeHandler = useCallback(async () => {
    const files = generateSuite(getNodes(), getEdges());
    
    if (files.length === 0) {
        alert("No 'Start Session' blocks found.");
        return;
    }

    // Try to use File System Access API (Chrome/Edge/Opera)
    if ('showDirectoryPicker' in window) {
        try {
            const dirHandle = await window.showDirectoryPicker();
            
            for (const file of files) {
                // Create file in the chosen directory
                const fileHandle = await dirHandle.getFileHandle(file.filename, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(file.content);
                await writable.close();
            }
            alert(`Successfully saved ${files.length} files to selected folder.`);
            return;
        } catch (err) {
            // User cancelled or error, fall back to Zip
            console.log("Directory picker cancelled or failed, falling back to ZIP download.", err);
        }
    }

    // Fallback: Download as ZIP (Firefox, Safari, or if user cancelled folder picker)
    const zip = new JSZip();
    files.forEach(f => {
        zip.file(f.filename, f.content);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = "selenium_tests_export.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  }, [getNodes, getEdges]);


  // Context Menu handlers (keep existing)
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    if (!node.selected) {
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
      setSelectedNode(node);
    } else {
      setSelectedNode(node); 
    }
    setMenu({ id: node.id, top: event.clientY, left: event.clientX });
  }, [setNodes]);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    setMenu({ id: null, top: event.clientY, left: event.clientX });
  }, []);

  const onPaneClick = useCallback(() => {
    setMenu(null);
    setSelectedNode(null);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <TopBarWithNav 
        onExportCode={onExportCodeHandler} 
        onSaveFile={onSaveHandler}
        onLoadFile={onLoadHandler}
        onClear={onClearHandler}
        onUndo={onUndoHandler}
        onRedo={onRedoHandler}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, height: '100%', position: 'relative' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onNodeClick={(e, node) => setSelectedNode(node)}
            onPaneClick={onPaneClick}
            onNodeDragStart={onNodeDragStart}
            onNodeContextMenu={onNodeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={null} 
            fitView
            colorMode="dark"
            selectionKeyCode="Shift" 
            multiSelectionKeyCode="Control"
            selectionMode={SelectionMode.Partial}
            selectionOnDrag={false} 
            panOnDrag={[1, 2]} 
          >
            <Controls />
            <MiniMap style={{ backgroundColor: 'var(--node-bg)' }} nodeColor="var(--accent-color)" maskColor="rgba(0, 0, 0, 0.3)" />
            <Background color="#334155" gap={16} />
            
            {menu && (
                <ContextMenu
                    id={menu.id}
                    top={menu.top}
                    left={menu.left}
                    onCopy={handleCopy}
                    onCut={handleCut}
                    onPaste={() => {
                        const pos = screenToFlowPosition({ x: menu.left, y: menu.top });
                        handlePaste(pos);
                    }}
                    onDelete={handleDelete}
                    hasClipboard={!!(clipboard && clipboard.nodes.length > 0)}
                />
            )}
          </ReactFlow>
        </div>
        <PropertiesPanel selectedNode={selectedNode} onChange={(id, data) => {
             setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data } : node));
        }} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReactFlowProvider><DnDFlow /></ReactFlowProvider>} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}