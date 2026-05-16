export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'message-row-user' : ''}`}>
      <div className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}>
        {message.content}
      </div>
    </div>
  );
}

