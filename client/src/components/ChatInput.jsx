import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ disabled, onSend }) {
  const [value, setValue] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  return (
    <form className="chat-input" onSubmit={submit}>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask for a layout change..."
        disabled={disabled}
        aria-label="Layout instruction"
      />
      <button type="submit" disabled={disabled || !value.trim()} title="Send message" aria-label="Send message">
        <Send size={18} />
      </button>
    </form>
  );
}

