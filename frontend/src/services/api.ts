import axios from 'axios';

// Get current backend selection (default to .NET API on port 8081)
const getBaseUrl = () => {
  const backend = localStorage.getItem('growsure_backend') || 'dotnet';
  return backend === 'springboot' ? 'http://localhost:8080' : 'http://localhost:8081';
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
