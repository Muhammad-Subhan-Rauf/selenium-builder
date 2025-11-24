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
import { Download } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import TestPage from './pages/TestPage';
import ButtonEdge from './components/ButtonEdge'; // Import the new Edge

import StartNode from './nodes/StartNode';
import ElementNode from './nodes/ElementNode';
import InteractNode from './nodes/InteractNode';
import AssertNode from './nodes/AssertNode';
import ConditionNode from './nodes/ConditionNode'; // Ensure these are imported
import LoopNode from './nodes/LoopNode';           // Ensure these are imported

import { generateCode } from './utils/codeGenerator';

// Register Node Types
const nodeTypes = {
  start_session: StartNode,
  element: ElementNode,
  interact: InteractNode,
  assert: AssertNode,
  condition: ConditionNode,
  loop: LoopNode,
};

// Register Edge Types
const edgeTypes = {
  'button-edge': ButtonEdge,
};

const STORAGE_KEY = 'selenium_builder_flow_v1';
const id = () => `dndnode_${Date.now()}`;

function TopBarWithNav({ onExport, onClear }) {
  const navigate = useNavigate();
  return (
    <header className="topbar glass-panel">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Visual Selenium Builder
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          className="btn-primary"
          onClick={() => navigate('/test')}
          style={{ background: 'transparent', border: '1px solid var(--accent-color)' }}
        >
          Open Test Page
        </button>
        <button
           className="btn-primary"
           onClick={onClear}
           style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
        >
           Reset
        </button>
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

function DnDFlow() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, getNodes, getEdges, setViewport } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState(null);

  // --- LOCAL STORAGE ---
  useEffect(() => {
    const savedFlow = localStorage.getItem(STORAGE_KEY);
    if (savedFlow) {
      try {
        const flow = JSON.parse(savedFlow);
        if (flow.nodes) setNodes(flow.nodes);
        if (flow.edges) {
            // Migrate edges to use the new 'button-edge' type so they have the X button
            const migratedEdges = flow.edges.map(e => ({
                ...e,
                type: 'button-edge'
            }));
            setEdges(migratedEdges);
        }
        if(flow.viewport) setViewport(flow.viewport);
      } catch (e) {
        console.error("Failed to load flow", e);
      }
    }
  }, [setNodes, setEdges, setViewport]);

  useEffect(() => {
    const saveFlow = () => {
      const flow = { nodes, edges };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
    };
    // Debounce could be added here, but standard save is fine for this size
    saveFlow();
  }, [nodes, edges]);

  // --- HANDLERS ---

  // Use 'button-edge' type when connecting
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'button-edge' }, eds)),
    [],
  );

  // Allow double-click to remove edge
  const onEdgeDoubleClick = useCallback((event, edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) return;

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
    },
    [screenToFlowPosition, setNodes],
  );

  const onNodeClick = useCallback((event, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const onNodeDataChange = useCallback((id, data) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data } : node));
  }, [setNodes]);

  const onClear = useCallback(() => {
      if(window.confirm("Clear all?")) {
          setNodes([]);
          setEdges([]);
          localStorage.removeItem(STORAGE_KEY);
      }
  }, [setNodes, setEdges]);

  const onExport = useCallback(() => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <TopBarWithNav onExport={onExport} onClear={onClear} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, height: '100%', position: 'relative' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onEdgeDoubleClick={onEdgeDoubleClick} // Double click deletes
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes} // Register custom edge
            fitView
            colorMode="dark"
          >
            <Controls />
            <MiniMap
              style={{ backgroundColor: 'var(--node-bg)' }}
              nodeColor="var(--accent-color)"
              maskColor="rgba(0, 0, 0, 0.3)"
            />
            <Background color="#334155" gap={16} />
          </ReactFlow>
        </div>
        <PropertiesPanel selectedNode={selectedNode} onChange={onNodeDataChange} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ReactFlowProvider>
            <DnDFlow />
          </ReactFlowProvider>
        } />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}