import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const backend = localStorage.getItem('growsure_backend') || 'dotnet';
  const port = backend === 'springboot' ? '8080' : '8081';
  return `http://${hostname}:${port}`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and dynamically reload base URL on preference changes
api.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl(); // Refresh base URL dynamically
    const token = localStorage.getItem('growsure_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
