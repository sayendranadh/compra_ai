const ASPECT_PRESETS = {
  '1:1': { width: 1080, height: 1080, preset: 'instagram-post' },
  '9:16': { width: 1080, height: 1920, preset: 'story-reel' },
  '16:9': { width: 1920, height: 1080, preset: 'youtube' },
  '4:5': { width: 1080, height: 1350, preset: 'instagram-portrait' }
};

export function resizeArtboard(layout, newWidth, newHeight) {
  const updated = structuredClone(layout);
  const { artboard } = getArtboard(updated);
  artboard.width = newWidth;
  artboard.height = newHeight;

  for (const childId of artboard.children) {
    const node = updated.nodes[childId];
    syncAbsoluteFromNormalized(node, artboard);
  }

  return updated;
}

export function convertAspectRatio(layout, ratio) {
  const target = ASPECT_PRESETS[ratio];
  if (!target) throw new Error(`Unsupported aspect ratio: ${ratio}`);

  const updated = resizeArtboard(layout, target.width, target.height);
  const { artboard } = getArtboard(updated);
  artboard.data = { ...artboard.data, preset: target.preset };
  artboard.name = ratio === '9:16' ? 'Story / Reel' : artboard.name;

  for (const childId of artboard.children) {
    const node = updated.nodes[childId];

    if (isBackground(node)) {
      node.x = 0;
      node.y = 0;
      node.width = artboard.width;
      node.height = artboard.height;
      syncNormalizedFromAbsolute(node, artboard);
    }

    if (isCenterAnchored(node)) {
      centerNodeHorizontally(node, artboard);
      syncNormalizedFromAbsolute(node, artboard);
    }
  }

  return updated;
}

export function moveNode(layout, nodeId, position) {
  const updated = structuredClone(layout);
  const { artboard } = getArtboard(updated);
  const node = updated.nodes[nodeId];
  if (!node) throw new Error(`Node not found: ${nodeId}`);

  const marginX = Math.round(artboard.width * 0.08);
  const marginY = Math.round(artboard.height * 0.08);

  if (position === 'top') node.y = marginY;
  if (position === 'bottom') node.y = artboard.height - node.height - marginY;
  if (position === 'left') node.x = marginX;
  if (position === 'right') node.x = artboard.width - node.width - marginX;
  if (position === 'center') {
    centerNodeHorizontally(node, artboard);
    node.y = (artboard.height - node.height) / 2;
  }
  if (position === 'higher') node.y = Math.max(0, node.y - artboard.height * 0.08);
  if (position === 'lower') node.y = Math.min(artboard.height - node.height, node.y + artboard.height * 0.08);

  syncNormalizedFromAbsolute(node, artboard);
  return updated;
}

export function resizeNode(layout, nodeId, scale) {
  const updated = structuredClone(layout);
  const { artboard } = getArtboard(updated);
  const node = updated.nodes[nodeId];
  if (!node) throw new Error(`Node not found: ${nodeId}`);

  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;

  node.width *= scale;
  node.height *= scale;
  node.x = centerX - node.width / 2;
  node.y = centerY - node.height / 2;

  const visual = node.style?.visual;
  if (node.type === 'text' && visual?.fontSize) {
    visual.fontSize = Math.max(8, Math.round(visual.fontSize * scale));
    node.fontSizeRatio = visual.fontSize / artboard.width;
  }

  syncNormalizedFromAbsolute(node, artboard);
  return updated;
}

export function changeNodeColor(layout, nodeId, color) {
  const updated = structuredClone(layout);
  const node = updated.nodes[nodeId];
  if (!node) throw new Error(`Node not found: ${nodeId}`);

  node.style = node.style || {};
  node.style.visual = node.style.visual || {};

  if (node.type === 'shape') {
    node.style.visual.fill = { type: 'solid', value: color };
  } else {
    node.style.visual.color = { type: 'solid', value: color };
  }

  return updated;
}

export function applyDeterministicInstruction(layout, message, lastModifiedElement) {
  const text = message.toLowerCase();
  const ratio = parseRatio(text);

  if (ratio && (text.includes('convert') || text.includes('resize') || text.includes('change'))) {
    return buildResult(
      convertAspectRatio(layout, ratio),
      `I converted the artboard to ${ratio} and preserved the layout using normalized coordinates.`,
      getArtboard(layout).artboard
    );
  }

  if (text.includes('headline') && text.includes('top')) {
    const node = findNodeByRole(layout, 'headline');
    return buildResult(moveNode(layout, node.id, 'top'), 'I moved the headline to the top of the design.', node);
  }

  if ((text.includes('offer badge') || text.includes('discount badge')) && text.includes('higher')) {
    const node = findNodeByRole(layout, 'badge-group');
    return buildResult(moveBadgeGroup(layout, 'higher'), 'I moved the offer badge higher.', node);
  }

  if (text.includes('headline') && (text.includes('smaller') || text.includes('reduce') || text.includes('shrink'))) {
    const node = findNodeByRole(layout, 'headline');
    return buildResult(resizeNode(layout, node.id, 0.82), 'I made the headline smaller.', node);
  }

  if (text.includes('headline') && text.includes('red')) {
    const node = findNodeByRole(layout, 'headline');
    return buildResult(changeNodeColor(layout, node.id, '#D62828'), 'I changed the headline color to red.', node);
  }

  if ((text.includes('discount badge') || text.includes('offer badge')) && (text.includes('bigger') || text.includes('larger'))) {
    const node = findNodeByRole(layout, 'badge-group');
    return buildResult(resizeBadgeGroup(layout, 1.18), 'I made the discount badge bigger.', node);
  }

  if (text.includes('product') && text.includes('center')) {
    const node = findNodeByRole(layout, 'product');
    return buildResult(moveNode(layout, node.id, 'center'), 'I centered the product on the artboard.', node);
  }

  if (text.includes('product') && text.includes('large')) {
    const node = findNodeByRole(layout, 'product');
    return buildResult(resizeNode(layout, node.id, 1.08), 'I kept the product visually large.', node);
  }

  if (lastModifiedElement && (text.includes('bigger') || text.includes('larger'))) {
    const node = layout.nodes[lastModifiedElement.id];
    if (node) return buildResult(resizeNode(layout, node.id, 1.12), `I made ${node.name || 'that element'} bigger.`, node);
  }

  if (lastModifiedElement && (text.includes('smaller') || text.includes('shrink'))) {
    const node = layout.nodes[lastModifiedElement.id];
    if (node) return buildResult(resizeNode(layout, node.id, 0.88), `I made ${node.name || 'that element'} smaller.`, node);
  }

  return null;
}

export function findNodeByRole(layout, role) {
  const nodes = Object.values(layout.nodes);
  const textNodes = nodes.filter((node) => node.type === 'text');

  if (role === 'headline') {
    return (
      textNodes.find((node) => node.data?.content?.toLowerCase().includes('luxury comfort')) ||
      textNodes.sort((a, b) => (b.style?.visual?.fontSize || 0) - (a.style?.visual?.fontSize || 0))[0]
    );
  }

  if (role === 'product') {
    return (
      nodes.find((node) => node.name?.toLowerCase().includes('product')) ||
      nodes.filter((node) => node.type === 'image').sort((a, b) => b.width * b.height - a.width * a.height)[0]
    );
  }

  if (role === 'badge-group') {
    return (
      textNodes.find((node) => node.data?.content?.includes('%')) ||
      nodes.find((node) => node.data?.shapeType === 'circle')
    );
  }

  throw new Error(`No node found for role: ${role}`);
}

function moveBadgeGroup(layout, position) {
  const updated = structuredClone(layout);
  const circle = Object.values(updated.nodes).find((node) => node.data?.shapeType === 'circle');
  const badgeText = Object.values(updated.nodes).find((node) => node.type === 'text' && node.data?.content?.includes('%'));
  if (!circle || !badgeText) throw new Error('Badge group not found');

  const { artboard } = getArtboard(updated);
  const delta = position === 'higher' ? -artboard.height * 0.08 : artboard.height * 0.08;

  for (const node of [circle, badgeText]) {
    node.y = Math.max(0, Math.min(artboard.height - node.height, node.y + delta));
    syncNormalizedFromAbsolute(node, artboard);
  }

  return updated;
}

function resizeBadgeGroup(layout, scale) {
  const circle = Object.values(layout.nodes).find((node) => node.data?.shapeType === 'circle');
  const badgeText = Object.values(layout.nodes).find((node) => node.type === 'text' && node.data?.content?.includes('%'));
  if (!circle || !badgeText) throw new Error('Badge group not found');

  let updated = resizeNode(layout, circle.id, scale);
  updated = resizeNode(updated, badgeText.id, scale);
  return updated;
}

function getArtboard(layout) {
  const rootId = layout.rootNodes[0];
  return { rootId, artboard: layout.nodes[rootId] };
}

function syncAbsoluteFromNormalized(node, artboard) {
  node.x = node.nx * artboard.width;
  node.y = node.ny * artboard.height;
  node.width = node.nw * artboard.width;
  node.height = node.nh * artboard.height;
}

function syncNormalizedFromAbsolute(node, artboard) {
  node.nx = node.x / artboard.width;
  node.ny = node.y / artboard.height;
  node.nw = node.width / artboard.width;
  node.nh = node.height / artboard.height;
}

function centerNodeHorizontally(node, artboard) {
  node.x = (artboard.width - node.width) / 2;
}

function isBackground(node) {
  return node.name?.toLowerCase().includes('background') || (node.nw >= 0.95 && node.nh >= 0.95);
}

function isCenterAnchored(node) {
  const label = `${node.name || ''} ${node.data?.content || ''}`.toLowerCase();
  return label.includes('product') || label.includes('luxury comfort') || label.includes('comfort that');
}

function parseRatio(text) {
  if (text.includes('9:16') || text.includes('story') || text.includes('reel')) return '9:16';
  if (text.includes('16:9') || text.includes('youtube')) return '16:9';
  if (text.includes('4:5') || text.includes('portrait')) return '4:5';
  if (text.includes('1:1') || text.includes('square') || text.includes('instagram post')) return '1:1';
  return null;
}

function buildResult(updatedLayout, explanation, node) {
  return {
    explanation,
    updatedLayout,
    lastModifiedElement: node
      ? {
          id: node.id,
          name: node.name,
          type: node.type
        }
      : null
  };
}

