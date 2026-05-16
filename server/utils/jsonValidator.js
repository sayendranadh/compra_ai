export function validateLayout(layout) {
  if (!layout || typeof layout !== 'object') throw new Error('Layout must be an object');
  if (!Array.isArray(layout.rootNodes)) throw new Error('rootNodes must be an array');
  if (layout.rootNodes.length === 0) throw new Error('rootNodes must include an artboard id');
  if (!layout.nodes || typeof layout.nodes !== 'object' || Array.isArray(layout.nodes)) {
    throw new Error('nodes must be an object');
  }

  for (const id of layout.rootNodes) {
    if (!layout.nodes[id]) throw new Error(`Missing root node: ${id}`);
  }

  const rootId = layout.rootNodes[0];
  const artboard = layout.nodes[rootId];
  if (artboard.type !== 'artboard') throw new Error('Root node must be an artboard');
  assertPositiveNumber(artboard.width, 'artboard.width');
  assertPositiveNumber(artboard.height, 'artboard.height');
  if (!Array.isArray(artboard.children)) throw new Error('artboard.children must be an array');

  for (const childId of artboard.children) {
    const node = layout.nodes[childId];
    if (!node) throw new Error(`Missing child node: ${childId}`);
    if (!node.type) throw new Error(`Node ${childId} is missing type`);

    for (const key of ['x', 'y', 'width', 'height', 'nx', 'ny', 'nw', 'nh']) {
      assertFiniteNumber(node[key], `${childId}.${key}`);
    }

    if (node.width < 0 || node.height < 0) throw new Error(`Node ${childId} has negative dimensions`);
  }

  return true;
}

export function validateLLMResult(result) {
  if (!result || typeof result !== 'object') throw new Error('LLM result must be an object');
  if (typeof result.explanation !== 'string') throw new Error('LLM result must include explanation');
  validateLayout(result.updatedLayout);
  return true;
}

function assertFiniteNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
}

function assertPositiveNumber(value, label) {
  assertFiniteNumber(value, label);
  if (value <= 0) throw new Error(`${label} must be positive`);
}

