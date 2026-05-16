import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 45000
});

export async function sendChatMessage(payload) {
  const { data } = await api.post('/api/chat', payload);
  return data;
}

