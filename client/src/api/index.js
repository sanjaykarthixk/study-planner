import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser    = (data) => api.post('/auth/login',    data);
export const getMe        = ()     => api.get('/auth/me');

// Subjects
export const getSubjects    = ()           => api.get('/subjects');
export const createSubject  = (data)       => api.post('/subjects',       data);
export const updateSubject  = (id, data)   => api.put(`/subjects/${id}`,  data);
export const deleteSubject  = (id)         => api.delete(`/subjects/${id}`);

// Sessions
export const getSessions   = ()     => api.get('/sessions');
export const createSession = (data) => api.post('/sessions', data);

// Notes
export const getNotes    = (subjectId) => api.get('/notes', { params: subjectId ? { subjectId } : {} });
export const createNote  = (data)      => api.post('/notes',      data);
export const updateNote  = (id, data)  => api.put(`/notes/${id}`, data);
export const deleteNote  = (id)        => api.delete(`/notes/${id}`);

// Tasks
export const getTasks    = (subjectId) => api.get('/tasks', { params: subjectId ? { subjectId } : {} });
export const createTask  = (data)      => api.post('/tasks',      data);
export const updateTask  = (id, data)  => api.put(`/tasks/${id}`, data);
export const deleteTask  = (id)        => api.delete(`/tasks/${id}`);

// Analytics
export const getAnalytics = () => api.get('/analytics/summary');

export default api;