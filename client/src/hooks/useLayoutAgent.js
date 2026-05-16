import { useState } from 'react';
import initialLayout from '../data/initialLayout.json';
import { sendChatMessage } from '../utils/api';

const welcomeMessage = {
  role: 'assistant',
  content: 'Ready. Try "Convert this design to 9:16" or "Move the headline to the top."'
};

export function useLayoutAgent() {
  const [layout, setLayout] = useState(initialLayout);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [loading, setLoading] = useState(false);
  const [lastModifiedElement, setLastModifiedElement] = useState(null);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const data = await sendChatMessage({
        message: trimmed,
        layout,
        history: nextMessages.slice(-6),
        lastModifiedElement
      });

      setLayout(data.updatedLayout);
      setLastModifiedElement(data.lastModifiedElement || lastModifiedElement);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.explanation || data.assistantMessage || 'Done.'
        }
      ]);
    } catch (error) {
      const detail = error.response?.data?.error || 'Sorry, something went wrong. Your layout was not changed.';
      setMessages((prev) => [...prev, { role: 'assistant', content: detail }]);
    } finally {
      setLoading(false);
    }
  };

  return { layout, messages, loading, sendMessage, lastModifiedElement };
}

