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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Download, Upload, Save, FileJson, RotateCcw, RotateCw } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import TestPage from './pages/TestPage';
import ButtonEdge from './components/ButtonEdge';
import ContextMenu from './components/ContextMenu';

import StartNode from './nodes/StartNode';
import ElementNode from './nodes/ElementNode';
import InteractNode from './nodes/InteractNode';
import AssertNode from './nodes/AssertNode';
import ConditionNode from './nodes/ConditionNode';
import LoopNode from './nodes/LoopNode';
import WaitNode from './nodes/WaitNode';
import ScreenshotNode from './nodes/ScreenshotNode';

import { generateCode } from './utils/codeGenerator';
import { exportFlowToFile, importFlowFromFile } from './utils/fileManager';
import useUndoRedo from './hooks/useUndoRedo';

const nodeTypes = {
  start_session: StartNode,
  element: ElementNode,
  interact: InteractNode,
  assert: AssertNode,
  condition: ConditionNode,
  loop: LoopNode,
  wait: WaitNode,
  screenshot: ScreenshotNode
};

const edgeTypes = {
  'button-edge': ButtonEdge,
};

const STORAGE_KEY = 'selenium_builder_flow_v3';
const id = () => `dndnode_${Date.now()}`;

function TopBarWithNav({ onExportCode, onSaveFile, onLoadFile, onClear, onUndo, onRedo, canUndo, canRedo }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
          await onLoadFile(file);
      } catch (err) {
          alert("Error loading file: " + err.message);
      }
      e.target.value = null; 
  };

  return (
    <header className="topbar glass-panel">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Visual Selenium Builder
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={handleFileChange}
      />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', marginRight: '1rem' }}>
            <button className="btn-secondary" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                <RotateCcw size={16} />
            </button>
            <button className="btn-secondary" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                <RotateCw size={16} />
            </button>
        </div>

        <button className="btn-secondary" onClick={() => navigate('/test')}>
          Test Page
        </button>

        <div style={{ width: '1px', background: '#475569', margin: '0 0.5rem' }}></div>

        <button className="btn-secondary" onClick={() => fileInputRef.current.click()} title="Load JSON">
           <Upload size={16} /> Load
        </button>
        <button className="btn-secondary" onClick={onSaveFile} title="Save JSON">
           <Save size={16} /> Save
        </button>

        <div style={{ width: '1px', background: '#475569', margin: '0 0.5rem' }}></div>

        <button className="btn-danger" onClick={onClear}>
           Reset
        </button>
        <button className="btn-primary" onClick={onExportCode}>
          <FileJson size={16} /> Code
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
  const [copiedNode, setCopiedNode] = useState(null);

  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo();

  // --- LOCAL STORAGE ---
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

  // --- ACTIONS ---

  const handleCopy = useCallback(() => {
      const selected = getNodes().find(n => n.selected);
      if (selected) {
          setCopiedNode({
              ...selected,
              id: null,
              selected: false,
              position: { ...selected.position }
          });
          setMenu(null);
      }
  }, [getNodes]);

  const handleCut = useCallback(() => {
      const selected = getNodes().find(n => n.selected);
      if (selected) {
          performActionWithSnapshot(() => {
            setCopiedNode({
                ...selected,
                id: null,
                selected: false,
                position: { ...selected.position }
            });
            setNodes(nds => nds.filter(n => n.id !== selected.id));
            setEdges(eds => eds.filter(e => e.source !== selected.id && e.target !== selected.id));
          });
          setMenu(null);
      }
  }, [getNodes, setNodes, setEdges, performActionWithSnapshot]);

  const handlePaste = useCallback((position) => {
      if (!copiedNode) return;

      performActionWithSnapshot(() => {
          const newId = id();
          let pastePos;

          if (position) {
              // Context Menu Position
              pastePos = position; 
          } else if (reactFlowWrapper.current) {
              // Ctrl+V: Center of visible canvas
              const { width, height, left, top } = reactFlowWrapper.current.getBoundingClientRect();
              const centerX = left + (width / 2);
              const centerY = top + (height / 2);
              
              pastePos = screenToFlowPosition({ x: centerX, y: centerY });
              
              // Add slight offset randomness so they don't stack perfectly
              pastePos.x += (Math.random() * 20 - 10);
              pastePos.y += (Math.random() * 20 - 10);
          } else {
              pastePos = { x: 0, y: 0 };
          }

          const newNode = {
              ...copiedNode,
              id: newId,
              position: pastePos,
              selected: true
          };

          setNodes(nds => nds.map(n => ({...n, selected: false})).concat(newNode));
      });
      setMenu(null);
  }, [copiedNode, screenToFlowPosition, setNodes, performActionWithSnapshot]);

  const handleDelete = useCallback(() => {
    const selected = getNodes().filter(n => n.selected);
    if(selected.length > 0) {
        performActionWithSnapshot(() => {
            setNodes(nds => nds.filter(n => !n.selected));
            setEdges(eds => eds.filter(e => !selected.find(n => n.id === e.source || n.id === e.target)));
        });
    }
    setMenu(null);
  }, [getNodes, setNodes, setEdges, performActionWithSnapshot]);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
      const handleKeyDown = (event) => {
          // 1. Ignore shortcuts if user is typing in an input
          const activeTag = document.activeElement?.tagName?.toUpperCase();
          if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
              return;
          }

          const isCtrl = event.ctrlKey || event.metaKey;

          if (isCtrl && event.key === 'c') {
              handleCopy();
          } else if (isCtrl && event.key === 'x') {
              handleCut();
          } else if (isCtrl && event.key === 'v') {
              handlePaste(); 
          } else if (isCtrl && event.key === 'z') {
              event.preventDefault();
              const prev = undo(getNodes(), getEdges());
              if (prev) {
                  setNodes(prev.nodes);
                  setEdges(prev.edges);
              }
          } else if (isCtrl && event.key === 'y') {
              event.preventDefault();
              const next = redo(getNodes(), getEdges());
              if (next) {
                  setNodes(next.nodes);
                  setEdges(next.edges);
              }
          } else if (event.key === 'Delete' || event.key === 'Backspace') {
              // 2. Handle Delete manually to support Undo/Redo
              handleDelete();
          }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handleCut, handlePaste, handleDelete, undo, redo, getNodes, getEdges, setNodes, setEdges]);

  // --- EVENT HANDLERS ---
  
  const onConnect = useCallback((params) => {
      takeSnapshot(getNodes(), getEdges());
      setEdges((eds) => addEdge({ ...params, type: 'button-edge' }, eds));
  }, [setEdges, getNodes, getEdges, takeSnapshot]);

  const onNodeDragStart = useCallback(() => {
      takeSnapshot(getNodes(), getEdges());
  }, [getNodes, getEdges, takeSnapshot]);

  const onDrop = useCallback((event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      takeSnapshot(getNodes(), getEdges());

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: id(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes, getNodes, getEdges, takeSnapshot]);

  // Wrappers for Toolbar Actions
  const onUndoHandler = () => {
      const prev = undo(getNodes(), getEdges());
      if (prev) { setNodes(prev.nodes); setEdges(prev.edges); }
  };
  const onRedoHandler = () => {
      const next = redo(getNodes(), getEdges());
      if (next) { setNodes(next.nodes); setEdges(next.edges); }
  };
  const onSaveHandler = () => exportFlowToFile(getNodes(), getEdges(), getViewport());
  const onLoadHandler = async (file) => {
      performActionWithSnapshot(async () => {
          const data = await importFlowFromFile(file);
          setNodes([]); setEdges([]);
          setTimeout(() => {
              setNodes(data.nodes);
              setEdges(data.edges);
              setViewport(data.viewport);
          }, 50);
      });
  };
  const onClearHandler = () => {
      if(window.confirm("Clear all?")) {
          performActionWithSnapshot(() => {
            setNodes([]); setEdges([]); localStorage.removeItem(STORAGE_KEY);
          });
      }
  };
  const onExportCodeHandler = useCallback(() => {
    const code = generateCode(getNodes(), getEdges());
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_script.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [getNodes, getEdges]);

  // Context Menu
  const onNodeContextMenu = useCallback((event, node) => {
      event.preventDefault();
      // Select the right-clicked node
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
      setSelectedNode(node);
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
            onNodeClick={(e, node) => setSelectedNode(node)}
            onPaneClick={onPaneClick}
            onNodeDragStart={onNodeDragStart}
            onNodeContextMenu={onNodeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={null} /* DISABLE NATIVE DELETE to use our custom handler */
            fitView
            colorMode="dark"
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
                    hasClipboard={!!copiedNode}
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