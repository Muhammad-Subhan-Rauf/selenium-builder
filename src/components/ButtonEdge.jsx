import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';

export default function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const { setEdges } = useReactFlow();
  // Calculate the path and the center position for the button
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt) => {
    evt.stopPropagation(); // Prevent clicking the pane
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all', // Ensure the button is clickable
            zIndex: 10,
          }}
          className="nopan"
        >
          {/* <button
            onClick={onEdgeClick}
            style={{
                width: '20px',
                height: '20px',
                background: '#ef4444',
                color: 'white',
                border: '2px solid #1e293b', // Dark border to match background
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
            }}
            className="delete-edge-btn"
            title="Remove Connection"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ×
          </button> */}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}