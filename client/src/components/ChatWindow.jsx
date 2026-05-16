import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, loading }) {
  return (
    <div className="chat-window" aria-live="polite">
      {messages.map((message, index) => (
        <MessageBubble key={`${message.role}-${index}`} message={message} />
      ))}
      {loading && (
        <div className="message-row">
          <div className="message-bubble message-assistant">Thinking through the layout...</div>
        </div>
      )}
    </div>
  );
}

