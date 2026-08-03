import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // In local Vite dev mode (port 3000), target localhost backend on port 8081
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    const backend = localStorage.getItem('growsure_backend') || 'dotnet';
    const port = backend === 'springboot' ? '8080' : '8081';
    return `http://${window.location.hostname}:${port}`;
  }
  // In production (Vercel deployment), use relative '/api' proxied via vercel.json
  return '';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and dynamically reload base URL
api.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
    const token = localStorage.getItem('growsure_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
