import React, { useState, useCallback, useRef } from 'react';
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

import StartNode from './nodes/StartNode';
import ElementNode from './nodes/ElementNode';
import InteractNode from './nodes/InteractNode';
import AssertNode from './nodes/AssertNode';

import { generateCode } from './utils/codeGenerator';

const nodeTypes = {
  start_session: StartNode,
  element: ElementNode,
  interact: InteractNode,
  assert: AssertNode,
};

const initialNodes = [];
const id = () => `dndnode_${Date.now()}`;

// Custom TopBar with Navigation
function TopBarWithNav({ onExport }) {
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

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

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodeDataChange = useCallback((id, data) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onExport = useCallback(() => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    const code = generateCode(currentNodes, currentEdges);

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
      <TopBarWithNav onExport={onExport} />
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
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
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
