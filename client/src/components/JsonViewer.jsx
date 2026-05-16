import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function JsonViewer({ layout }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="panel json-panel">
      <button className="panel-title panel-title-button" onClick={() => setExpanded((value) => !value)}>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Layout JSON
      </button>
      {expanded && <pre className="json-viewer">{JSON.stringify(layout, null, 2)}</pre>}
    </section>
  );
}

