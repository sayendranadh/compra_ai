export default function WireframePreview({ layout }) {
  const rootId = layout.rootNodes[0];
  const artboard = layout.nodes[rootId];
  const aspectRatio = artboard.height / artboard.width;

  return (
    <section className="panel preview-panel">
      <div className="panel-title">Wireframe Preview</div>
      <div className="preview-shell">
        <div
          className="wireframe"
          style={{
            paddingBottom: `${aspectRatio * 100}%`,
            background: artboard.data?.backgroundColor || '#f4f5f7'
          }}
        >
          {artboard.children.map((id) => {
            const node = layout.nodes[id];
            return <PreviewNode key={id} node={node} />;
          })}
        </div>
      </div>
    </section>
  );
}

function PreviewNode({ node }) {
  const label = getLabel(node);
  const style = {
    left: `${node.nx * 100}%`,
    top: `${node.ny * 100}%`,
    width: `${node.nw * 100}%`,
    height: `${node.nh * 100}%`,
    background: getBackground(node),
    color: getTextColor(node),
    borderRadius: getBorderRadius(node),
    borderColor: getBorderColor(node),
    fontSize: getPreviewFontSize(node),
    fontWeight: node.style?.visual?.fontWeight || 600,
    fontStyle: node.style?.visual?.fontStyle || 'normal'
  };

  return (
    <div className={`preview-node preview-${node.type}`} style={style} title={`${node.name || node.type}: ${label}`}>
      <span>{label}</span>
    </div>
  );
}

function getLabel(node) {
  if (node.data?.content) return node.data.content.replace(/\s+/g, ' ').trim();
  if (node.name) return node.name;
  return node.type;
}

function getBackground(node) {
  const fill = node.style?.visual?.fill;
  if (node.type === 'shape' && fill?.type === 'solid') return fill.value;
  if (node.type === 'text') return 'rgba(255, 214, 102, 0.72)';
  if (node.type === 'image') return 'rgba(85, 132, 255, 0.34)';
  return '#d8dee9';
}

function getTextColor(node) {
  if (node.type === 'text') return node.style?.visual?.color?.value || '#172033';
  return '#172033';
}

function getBorderColor(node) {
  if (node.type === 'shape') return node.style?.visual?.stroke?.value || 'rgba(0, 0, 0, 0.2)';
  if (node.type === 'image') return 'rgba(36, 78, 180, 0.55)';
  return 'rgba(115, 89, 8, 0.45)';
}

function getBorderRadius(node) {
  if (node.data?.shapeType === 'circle') return '999px';
  return `${node.style?.visual?.borderRadius || 4}px`;
}

function getPreviewFontSize(node) {
  if (node.type !== 'text') return '10px';
  const raw = node.style?.visual?.fontSize || 36;
  return `${Math.max(9, Math.min(18, raw / 4))}px`;
}

