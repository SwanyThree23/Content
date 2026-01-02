import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

export const projects = {
  list: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  get: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};

export const apiKeys = {
  list: () => api.get('/apikeys'),
  create: (data) => api.post('/apikeys', data),
  delete: (id) => api.delete(`/apikeys/${id}`)
};

export const claude = {
  chat: (data) => api.post('/claude/chat', data),
  refineCode: (data) => api.post('/claude/refine-code', data)
};

export const openrouter = {
  chat: (data) => api.post('/openrouter/chat', data),
  models: () => api.get('/openrouter/models')
};

export const elevenlabs = {
  tts: (data) => api.post('/elevenlabs/tts', data, { responseType: 'blob' }),
  voices: () => api.get('/elevenlabs/voices')
};

export const whisper = {
  transcribe: (formData) => api.post('/whisper/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const akool = {
  faceSwap: (formData) => api.post('/akool/face-swap', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  voiceClone: (formData) => api.post('/akool/voice-clone', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  videoTranslate: (data) => api.post('/akool/video-translate', data)
};

export const chat = {
  history: (projectId) => api.get(`/chat/history${projectId ? `?projectId=${projectId}` : ''}`),
  sendMessage: (data) => api.post('/chat/message', data)
};

export const stream = {
  start: (config) => api.post('/stream/start', { config }),
  stop: (streamId) => api.post('/stream/stop', { streamId }),
  active: () => api.get('/stream/active')
};

export const usage = {
  stats: () => api.get('/usage/stats'),
  history: (days = 30) => api.get(`/usage/history?days=${days}`)
};

export const webhooks = {
  list: () => api.get('/webhooks'),
  register: (data) => api.post('/webhooks/register', data),
  delete: (id) => api.delete(`/webhooks/${id}`)
};

export const mcp = {
  servers: () => api.get('/mcp/servers'),
  createServer: (data) => api.post('/mcp/servers', data)
};

export default api;
