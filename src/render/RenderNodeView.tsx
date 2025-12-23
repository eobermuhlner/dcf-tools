import React from 'react';
import { RenderNode } from './RenderAst.js';
import { renderNodeToCss } from './renderNodeToCss.js';

export function RenderNodeView({ node }: { node: RenderNode }) {
  if (node.kind === "frame") {
    return (
      <div style={renderNodeToCss(node)} data-nodeid={node.id}>
        {node.children.map((ch) => (
          <RenderNodeView key={ch.id} node={ch} />
        ))}
      </div>
    );
  }

  if (node.kind === "text") {
    return <div style={renderNodeToCss(node)}>{node.text}</div>;
  }

  if (node.kind === "image") {
    return <img style={renderNodeToCss(node)} src={node.src} alt="" />;
  }

  return (
    <div style={renderNodeToCss(node)}>
      <div style={{ fontSize: 12, opacity: 0.6, padding: 4 }}>
        [{node.label}]
      </div>
      {node.children?.map((ch) => (
        <RenderNodeView key={ch.id} node={ch} />
      ))}
    </div>
  );
}