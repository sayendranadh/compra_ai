import ChatInput from './components/ChatInput';
import ChatWindow from './components/ChatWindow';
import JsonViewer from './components/JsonViewer';
import WireframePreview from './components/WireframePreview';
import { useLayoutAgent } from './hooks/useLayoutAgent';

export default function App() {
  const { layout, messages, loading, sendMessage, lastModifiedElement } = useLayoutAgent();
  const artboard = layout.nodes[layout.rootNodes[0]];

  return (
    <main className="app-shell">
      <section className="workspace-header">
        <div>
          <h1>Chat-Based Layout Agent</h1>
          <p>{artboard.name} - {Math.round(artboard.width)} x {Math.round(artboard.height)}</p>
        </div>
        <div className="status-pill">
          {lastModifiedElement?.name || lastModifiedElement?.id || 'No element changed yet'}
        </div>
      </section>

      <section className="workspace-grid">
        <section className="chat-panel">
          <div className="panel-title">Assistant</div>
          <ChatWindow messages={messages} loading={loading} />
          <ChatInput disabled={loading} onSend={sendMessage} />
        </section>

        <section className="layout-panel">
          <WireframePreview layout={layout} />
          <JsonViewer layout={layout} />
        </section>
      </section>
    </main>
  );
}

